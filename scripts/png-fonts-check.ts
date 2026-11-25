// Assert-based check for the PNG export's fonts. Run: npm run png:check
//
// What must never break: the route sets text in our own Untitled faces, never
// DM Mono or a font fetched from elsewhere; every Untitled WOFF2 decodes to a
// well-formed TrueType file; resvg draws real glyphs from it; and the Noto
// fallbacks fill only what Untitled lacks, a glyph at a time, beside any letter.

import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { initWasm, Resvg } from "@resvg/resvg-wasm";
import { woff2ToSfnt } from "@/app/api/export/png/woff2";
import { charMap } from "@/app/api/export/png/sfnt";
import { FALLBACK_FILES, FONT_FILES, pngFonts } from "@/app/api/export/png/fonts";

const eq: typeof assert.equal = assert.equal;
// Built with the constructor: this repo's TypeScript target does not allow the u flag in literals.
const MARK = new RegExp("\\p{M}", "u");
const LETTER = new RegExp("\\p{L}", "u");

// ── The route reads our faces only ───────────────────────────────────
{
  const route = readFileSync("app/api/export/png/route.ts", "utf8");
  for (const banned of ["DM Mono", "googleapis", "gstatic"]) assert.ok(!route.includes(banned), `the route never mentions ${banned}`);
  assert.ok(route.includes('defaultFontFamily: "Untitled Sans"'), "unstyled text falls back to Untitled Sans");
  assert.ok(route.includes("loadSystemFonts: false"), "no system face stands in");
  assert.ok(route.includes("pngFonts(") && route.includes('.normalize("NFC")'), "the route loads the shared faces and composes accents");
  const config = readFileSync("next.config.mjs", "utf8");
  for (const glob of ["./public/fonts/Untitled*.woff2", "./app/api/export/png/fallback/*.ttf"]) assert.ok(config.includes(glob), `${glob} is traced into the function`);
  assert.ok(readFileSync("app/api/export/png/fallback/OFL.txt", "utf8").includes("SIL OPEN FONT LICENSE Version 1.1"), "the fallbacks' licence travels with them");
}

// ── Each Untitled face decodes to a well-formed TrueType file ────────
const u16 = (b: Uint8Array, o: number) => (b[o] << 8) | b[o + 1];
const u32 = (b: Uint8Array, o: number) => ((u16(b, o) << 16) | u16(b, o + 2)) >>> 0;
for (const face of FONT_FILES) {
  const ttf = woff2ToSfnt(new Uint8Array(readFileSync(`public/fonts/${face}.woff2`)));
  eq(u32(ttf, 0), 0x00010000, `${face}: a TrueType sfnt`);
  const n = u16(ttf, 4);
  const tables: Record<string, { offset: number; length: number }> = {};
  let last = "";
  for (let i = 0; i < n; i++) {
    const r = 12 + i * 16;
    const tag = String.fromCharCode(ttf[r], ttf[r + 1], ttf[r + 2], ttf[r + 3]);
    assert.ok(tag > last, `${face}: table records sorted by tag`);
    last = tag;
    tables[tag] = { offset: u32(ttf, r + 8), length: u32(ttf, r + 12) };
    assert.ok(tables[tag].offset % 4 === 0 && tables[tag].offset + tables[tag].length <= ttf.length, `${face}: ${tag} sits inside the file, aligned`);
  }
  for (const t of ["cmap", "glyf", "head", "hhea", "hmtx", "loca", "maxp", "name", "post"]) assert.ok(tables[t], `${face}: has ${t}`);
  const numGlyphs = u16(ttf, tables.maxp.offset + 4);
  const longLoca = u16(ttf, tables.head.offset + 50) === 1;
  eq(tables.loca.length, (numGlyphs + 1) * (longLoca ? 4 : 2), `${face}: one loca entry per glyph, plus the end`);
  const at = (i: number) => (longLoca ? u32(ttf, tables.loca.offset + i * 4) : u16(ttf, tables.loca.offset + i * 2) * 2);
  let prev = 0, simple = 0;
  for (let i = 0; i <= numGlyphs; i++) {
    const o = at(i);
    assert.ok(o >= prev, `${face}: loca never runs backwards (glyph ${i})`);
    if (i < numGlyphs && at(i + 1) > o) {
      const contours = (u16(ttf, tables.glyf.offset + o) << 16) >> 16;
      assert.ok(contours >= -1, `${face}: glyph ${i} has a valid contour count`);
      if (contours > 0) simple++;
    }
    prev = o;
  }
  eq(at(numGlyphs), tables.glyf.length, `${face}: loca ends where glyf ends`);
  assert.ok(simple > 200, `${face}: hundreds of drawn glyphs (${simple})`);
}
assert.throws(() => woff2ToSfnt(new Uint8Array(64)), /not a WOFF2 file/, "anything else is refused");

(async () => {
  const { untitled, fallbacks } = await pngFonts(async (f) => new Uint8Array(readFileSync(f)));
  eq(fallbacks.length, FALLBACK_FILES.length);

  // ── The fallbacks hold only what Untitled lacks ────────────────────
  const covered = new Set(untitled.flatMap((f) => Array.from(charMap(f).keys())));
  const reach = new Set<number>();
  fallbacks.forEach((f, i) => {
    for (const c of Array.from(charMap(f).keys())) {
      assert.ok(!covered.has(c), `${FALLBACK_FILES[i]} keeps no character Untitled has (U+${c.toString(16)})`);
      reach.add(c);
    }
  });
  for (const ch of Array.from("→↗↯✓✕∞≈≠≤≥±⬡ệếΩЖ")) assert.ok(!covered.has(ch.codePointAt(0)!) && reach.has(ch.codePointAt(0)!), `${ch} comes from a fallback`);
  assert.ok(!Array.from(covered).concat(Array.from(reach)).some((c) => MARK.test(String.fromCodePoint(c))), "no face offers a stand-alone accent to build letters from");

  // ── resvg draws them as the route does ─────────────────────────────
  await initWasm(readFileSync("node_modules/@resvg/resvg-wasm/index_bg.wasm"));
  const all = [...untitled, ...fallbacks];
  const pixels = (text: string, o: { family?: string; style?: string; faces?: Uint8Array[]; width?: number } = {}) => {
    const w = o.width ?? 300;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="80"><text x="10" y="56" font-family="${o.family ?? "'Untitled Sans'"}" font-style="${o.style ?? "normal"}" font-size="40">${text}</text></svg>`;
    return new Resvg(svg.normalize("NFC"), { font: { fontBuffers: o.faces ?? all, defaultFontFamily: "Untitled Sans", loadSystemFonts: false } }).render().pixels;
  };
  const hash = (px: Uint8Array, cols = Infinity, width = 300) => {
    let h = 0;
    for (let i = 3; i < px.length; i += 4) if (((i - 3) / 4) % width < cols) h = (h * 31 + px[i]) >>> 0;
    return h;
  };
  const inked = (px: Uint8Array) => { let n = 0; for (let i = 3; i < px.length; i += 4) if (px[i] > 128) n++; return n; };

  eq(inked(pixels("Hamburgefonstiv", { faces: [] })), 0, "without the faces nothing is drawn, so ink below comes from ours");
  const counts = ["'Untitled Sans', system-ui", "'Untitled Serif', serif"].flatMap((family) => ["normal", "italic"].map((style) => inked(pixels("Hamburgefonstiv", { family, style }))));
  counts.forEach((c, i) => assert.ok(c > 1500, `Untitled face ${i} draws real glyphs (${c} inked pixels)`));
  eq(new Set(counts).size, 4, "the four Untitled faces draw differently");
  eq(inked(pixels("Hamburgefonstiv", { family: "'DM Mono', monospace" })), counts[0], "a DM Mono request falls back to Untitled Sans");

  // Untitled keeps every character it has, in both styles, beside fallback characters.
  for (const style of ["normal", "italic"]) {
    eq(hash(pixels("Field → ✓ ệ Ω", { style }), 110), hash(pixels("Field", { style }), 110), `${style}: "Field" is drawn the same with fallback characters after it`);
  }
  // Beside any accented Latin, Greek or Cyrillic letter, a fallback character still draws (resvg drops
  // the fallback for a whole line if the faces disagree on a letter's glyph count).
  const BOX = "";
  const letters = [[0xc0, 0x24f], [0x1e00, 0x1eff], [0x370, 0x3ff], [0x400, 0x4ff]]
    .flatMap(([a, b]) => Array.from({ length: b - a + 1 }, (_, i) => a + i))
    .filter((c) => LETTER.test(String.fromCodePoint(c)) && (covered.has(c) || reach.has(c)));
  const broken = letters.filter((c) => { const ch = String.fromCodePoint(c); return hash(pixels(`${ch} →`)) === hash(pixels(`${ch} ${BOX}`)); });
  eq(broken.map((c) => String.fromCodePoint(c)).join(" "), "", `an arrow draws beside each of ${letters.length} letters`);
  // Untitled's own ligatures and contextual forms must not cost a line its fallback either.
  for (const word of ["office", "fit", "flow", "ffi", "Th", "1/2", "->", "--", "...", "(x)"]) {
    eq(hash(pixels(`${word} →`)) === hash(pixels(`${word} ${BOX}`)), false, `an arrow draws after "${word}"`);
  }
  // A decomposed accent, as some keyboards type it, composes and draws like the letter.
  eq(hash(pixels("ế →")), hash(pixels("ế →")), "a typed-apart ế draws as ế");
  console.log(`png: all checks passed (${letters.length} letters beside a fallback arrow)`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
