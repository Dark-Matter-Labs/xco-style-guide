// Assert-based check for the shared helpers in lib/random, lib/wrap and
// lib/media/export. Run: npm run lib:check
//
// What must never break: each shared generator gives exactly the numbers the
// copy it replaced gave (so no seeded pattern changes), wrap keeps its rules,
// and a failed PNG export always throws a message a person can act on.

import { strict as assert } from "node:assert";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { cliffordParams, fnv1a, fnv1aCodePoints, gaussian, lcg, mulberry32, noise2D } from "@/lib/random";
import { wrap } from "@/lib/wrap";
import { rasterise, svgText } from "@/lib/media/export";

const eq: typeof assert.equal = assert.equal;
const take = (r: () => number, n = 500) => Array.from({ length: n }, r);
const SEEDS = [0, 1, 7, 42, 99999, 2 ** 31 - 1, 2 ** 32 - 1];

// ── The copies this replaced, verbatim ───────────────────────────────
/* eslint-disable */
const OLD = {
  // lib/growth/differential-line.ts and event-series/render/field.ts
  mulberry32(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },
  // lib/asemic/script.ts
  rng(seed: number) {
    let s = seed >>> 0 || 1;
    return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  },
  hash: (str: string) => Array.from(str).reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261),
  // notion/render.ts seedFrom
  seedFrom(name: string): number {
    let h = 0x811c9dc5;
    for (const ch of name.trim().toLowerCase()) {
      h ^= ch.codePointAt(0)!;
      h = Math.imul(h, 0x01000193);
    }
    return ((h >>> 0) % 100000) || 1;
  },
  // lib/chaos/systems.ts
  cliffordParams(rand: () => number): [number, number, number, number] {
    for (let attempt = 0; attempt < 60; attempt++) {
      const p: [number, number, number, number] = [rand() * 4 - 2, rand() * 4 - 2, rand() * 3 - 1.5, rand() * 3 - 1.5];
      const [a, b, c, d] = p;
      const cells = new Set<number>();
      let x = 0.1, y = 0.1;
      for (let i = 0; i < 6000; i++) {
        const nx = Math.sin(a * y) + c * Math.cos(a * x);
        y = Math.sin(b * x) + d * Math.cos(b * y);
        x = nx;
        if (i > 100) cells.add(Math.floor((x + 3) * 8) * 64 + Math.floor((y + 3) * 8));
      }
      if (cells.size > 260) return p;
    }
    return [-1.4, 1.6, 1.0, 0.7];
  },
  // lib/chaos/random.ts
  noise2D(rand: () => number, octaves = 3): (x: number, y: number) => number {
    const perm = new Uint8Array(512);
    const values = new Float32Array(256);
    const idx = Array.from({ length: 256 }, (_, i) => i);
    for (let i = 255; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    for (let i = 0; i < 512; i++) perm[i] = idx[i & 255];
    for (let i = 0; i < 256; i++) values[i] = rand() * 2 - 1;
    const lattice = (ix: number, iy: number) => values[perm[(perm[ix & 255] + iy) & 511] & 255];
    const smooth = (t: number) => t * t * (3 - 2 * t);
    const single = (x: number, y: number) => {
      const ix = Math.floor(x), iy = Math.floor(y), fx = smooth(x - ix), fy = smooth(y - iy);
      const a = lattice(ix, iy) + (lattice(ix + 1, iy) - lattice(ix, iy)) * fx;
      const b = lattice(ix, iy + 1) + (lattice(ix + 1, iy + 1) - lattice(ix, iy + 1)) * fx;
      return a + (b - a) * fy;
    };
    return (x, y) => {
      let sum = 0, amp = 1, freq = 1, norm = 0;
      for (let o = 0; o < octaves; o++) { sum += single(x * freq + o * 17.3, y * freq - o * 9.1) * amp; norm += amp; amp *= 0.5; freq *= 2; }
      return sum / norm;
    };
  },
  // three regimes, social card and paper cover
  wrap(text: string, maxChars: number): string[] {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (test.length > maxChars && line) { lines.push(line); line = word; }
      else line = test;
    }
    if (line) lines.push(line);
    return lines;
  },
};
/* eslint-enable */

// ── Same numbers as before ───────────────────────────────────────────
for (const seed of SEEDS) {
  assert.deepEqual(take(mulberry32(seed)), take(OLD.mulberry32(seed)), `mulberry32(${seed}) matches the old copy`);
  assert.deepEqual(take(lcg(seed)), take(OLD.rng(seed)), `lcg(${seed}) matches the old copy`);
  for (const v of take(mulberry32(seed))) assert.ok(v >= 0 && v < 1, "mulberry32 stays in [0, 1)");
  assert.deepEqual(OLD.cliffordParams(OLD.mulberry32(seed)), cliffordParams(mulberry32(seed), 60, 260), `chaos's Clifford params for seed ${seed}`);
  const [a, b] = [noise2D(mulberry32(seed)), OLD.noise2D(OLD.mulberry32(seed))];
  for (const [x, y] of [[0, 0], [0.3, 0.7], [12.5, -3.25], [100.1, 41]]) eq(a(x, y), b(x, y), `noise2D(${seed}) at ${x},${y}`);
}
assert.notDeepEqual(take(lcg(1)), take(mulberry32(1)), "the LCG and mulberry32 are different generators");

const NAMES = ["Decisions Log", "  Ana Lopez ", "Søren", "Gurmukhi ਸ", "🌱 Garden", "𠀋 ext-B", ""];
for (const n of NAMES) {
  eq(fnv1a(n), OLD.hash(n), `fnv1a("${n}") matches the old copy`);
  eq(fnv1aCodePoints(n.trim().toLowerCase()) % 100000 || 1, OLD.seedFrom(n), `Notion's seed for "${n}" is unchanged`);
}
eq(fnv1a("Decisions Log"), fnv1aCodePoints("Decisions Log"), "the two hashes agree below U+FFFF");
assert.notEqual(fnv1a("🌱"), fnv1aCodePoints("🌱"), "and differ above it, which is why Notion keeps its own");

{
  const r = mulberry32(3), xs = Array.from({ length: 20000 }, () => gaussian(r));
  const mean = xs.reduce((s, v) => s + v, 0) / xs.length;
  const sd = Math.sqrt(xs.reduce((s, v) => s + (v - mean) ** 2, 0) / xs.length);
  assert.ok(Math.abs(mean) < 0.03 && Math.abs(sd - 1) < 0.03, `gaussian is standard normal (mean ${mean.toFixed(3)}, sd ${sd.toFixed(3)})`);
}

// ── wrap ─────────────────────────────────────────────────────────────
for (const [text, n] of [["Field is the precondition for everything else", 20], ["A field of options", 6], ["Optionality", 3], ["", 10], ["one  two   three", 7]] as const) {
  assert.deepEqual(wrap(text, n), OLD.wrap(text, n), `wrap("${text}", ${n}) matches the old copies`);
}
assert.deepEqual(wrap("A field of options", 8), ["A field", "of", "options"]);
assert.deepEqual(wrap("Optionality", 3), ["Optionality"], "a long word keeps a line of its own");

// ── Export: a failed PNG always says why ─────────────────────────────
eq(svgText("<svg/>"), "<svg/>", "SVG markup passes through");
assert.throws(() => svgText(null), /Nothing to export yet/, "a missing export copy says so");

type Call = { url: string; init: RequestInit };
const fake = (respond: () => Response | Promise<Response>, calls: Call[] = []) =>
  (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return respond();
  }) as unknown as typeof fetch;

(async () => {
  const calls: Call[] = [];
  const png = new Blob([new Uint8Array([137, 80, 78, 71])], { type: "image/png" });
  const blob = await rasterise("<svg/>", 1200, 630, fake(() => new Response(png, { status: 200 }), calls));
  eq(blob.size, 4, "a good answer comes back as the PNG");
  eq(calls[0].url, "/api/export/png");
  eq(calls[0].init.method, "POST");
  assert.deepEqual(JSON.parse(String(calls[0].init.body)), { svg: "<svg/>", width: 1200, height: 630 }, "the route gets svg, width, height");

  const fails = async (respond: () => Response | Promise<Response>, ...want: RegExp[]) => {
    let message = "";
    await rasterise("<svg/>", 10, 10, fake(respond)).then(
      () => assert.fail("should have thrown"),
      (e: Error) => (message = e.message),
    );
    for (const w of want) assert.match(message, w);
    assert.match(message, /download the SVG/, "every failure points to the SVG");
  };
  await fails(() => Response.json({ error: "Google Fonts CSS fetch failed: 503" }, { status: 500 }), /^PNG export failed \(500: Google Fonts CSS fetch failed: 503\)/);
  await fails(() => new Response("<html>Bad gateway</html>", { status: 502 }), /^PNG export failed \(502\)\./);
  await fails(() => Response.json({ error: "x".repeat(500) }, { status: 400 }), /^PNG export failed \(400: x{120}\)\./);
  await fails(() => { throw new TypeError("Failed to fetch"); }, /could not be reached/);
  await fails(() => new Response(new Blob([]), { status: 200 }), /empty file/);

  // ── No generator keeps its own copy any more (event series' measuring wrap is its own) ──
  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? files(join(dir, f)) : [join(dir, f)]));
  for (const f of files("app/(generators)").filter((f) => /\.tsx?$/.test(f))) {
    const src = readFileSync(f, "utf8");
    for (const copy of ["function svgToString", "function downloadBlob", "function downloadDataURL", "/api/export/png", "function wrap(text: string, maxChars", "0x6d2b79f5", "16777619", "function spatialWeight"])
      assert.ok(!src.includes(copy), `${f} keeps no copy of ${copy}`);
  }

  // ── Image treatment's photo helpers exist once (align kept its own copies of seven) ──
  const sources = files("app/(generators)").filter((f) => /\.tsx?$/.test(f)).map((f) => readFileSync(f, "utf8")).join("\n");
  for (const helper of ["function clamp(", "function getPhotoDims(", "function sampleLum(", "function getImageData(", "function addGrain(", "function spacingFromRes", "function useDebounce("]) {
    const n = sources.split(helper).length - 1;
    assert.ok(n <= 1, `${helper} is defined once across the generators (found ${n})`);
  }

  // ── Type: Untitled ships at 400 only (D18), so nothing asks for more ──
  const source = ["app", "components", "lib"].flatMap((d) => files(d)).filter((f) => /\.(tsx?|css)$/.test(f));
  for (const f of source) {
    const text = readFileSync(f, "utf8");
    const m = /font-(medium|semibold|bold|extrabold|black)\b|font-?[wW]eight[=:]\s*["{]?\s*([5-9]00)/.exec(text);
    assert.ok(!m, `${f} asks for a weight that does not ship: ${m?.[0]}`);
  }

  // ── The error is said aloud ────────────────────────────────────────
  // tsx compiles JSX with the classic transform, so React must be global before the module loads.
  (globalThis as unknown as { React: typeof React }).React = React;
  const { ExportError } = await import("@/components/generator-controls");
  const html = renderToStaticMarkup(React.createElement(ExportError, { error: "PNG export failed (500). Try again, or download the SVG." }));
  assert.ok(html.startsWith('<p role="alert"') && html.includes("PNG export failed (500)"), "ExportError is an alert with the message");

  console.log("lib: all checks passed");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
