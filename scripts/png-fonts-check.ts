// Assert-based check for the PNG export's fonts. Run: npm run png:check
//
// What must never break: the route sets text in our own Untitled faces, never
// DM Mono or a font fetched from elsewhere; every Untitled WOFF2 decodes to a
// well-formed TrueType file; and resvg draws real glyphs from it.

import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { initWasm, Resvg } from "@resvg/resvg-wasm";
import { woff2ToSfnt } from "@/app/api/export/png/woff2";

const eq: typeof assert.equal = assert.equal;
const FACES = ["UntitledSansRegular", "UntitledSansItalic", "UntitledSerifRegular", "UntitledSerifItalic"];

// ── The route reads our faces only ───────────────────────────────────
{
  const route = readFileSync("app/api/export/png/route.ts", "utf8");
  for (const banned of ["DM Mono", "googleapis", "gstatic"]) assert.ok(!route.includes(banned), `the route never mentions ${banned}`);
  assert.ok(route.includes('defaultFontFamily: "Untitled Sans"'), "unstyled text falls back to Untitled Sans");
  assert.ok(route.includes("loadSystemFonts: false"), "no system face stands in");
  for (const f of FACES) assert.ok(route.includes(`"${f}"`), `the route loads ${f}`);
  assert.ok(readFileSync("next.config.mjs", "utf8").includes("./public/fonts/Untitled*.woff2"), "the font files are traced into the function");
}

// ── Each face decodes to a well-formed TrueType file ─────────────────
const u16 = (b: Uint8Array, o: number) => (b[o] << 8) | b[o + 1];
const u32 = (b: Uint8Array, o: number) => ((u16(b, o) << 16) | u16(b, o + 2)) >>> 0;
const fonts = FACES.map((face) => {
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
  return ttf;
});

assert.throws(() => woff2ToSfnt(new Uint8Array(64)), /not a WOFF2 file/, "anything else is refused");

// ── resvg draws real glyphs from them ────────────────────────────────
(async () => {
  await initWasm(readFileSync("node_modules/@resvg/resvg-wasm/index_bg.wasm"));
  const ink = (family: string, style = "normal", withFonts = true) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="80"><text x="10" y="56" font-family="${family}" font-style="${style}" font-size="40">Hamburgefonstiv</text></svg>`;
    const px = new Resvg(svg, { font: { fontBuffers: withFonts ? fonts : [], defaultFontFamily: "Untitled Sans", loadSystemFonts: false } }).render().pixels;
    let n = 0;
    for (let i = 3; i < px.length; i += 4) if (px[i] > 128) n++;
    return { n };
  };
  eq(ink("'Untitled Sans'", "normal", false).n, 0, "without the faces nothing is drawn, so ink below comes from Untitled");
  const counts = [ink("'Untitled Sans', system-ui"), ink("'Untitled Sans'", "italic"), ink("'Untitled Serif', serif"), ink("'Untitled Serif'", "italic"), ink("'DM Mono', monospace")].map((r) => r.n);
  counts.forEach((c, i) => assert.ok(c > 1500, `face ${i} draws real glyphs (${c} inked pixels)`));
  eq(new Set(counts.slice(0, 4)).size, 4, "the four Untitled faces draw differently");
  eq(counts[4], counts[0], "a DM Mono request falls back to Untitled Sans, not to DM Mono");
  console.log("png: all checks passed");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
