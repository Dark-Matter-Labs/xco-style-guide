// WOFF2 to TrueType, for the PNG route. resvg reads TTF and OTF only, and the
// site ships its licensed Untitled faces as WOFF2, so the route decodes them
// in memory: Brotli (node:zlib), then the WOFF2 glyf and loca transform undone
// (W3C WOFF2 §5.1). Only what these fonts use: TrueType outlines, no font
// collections, no hmtx transform. Anything else throws.

import { brotliDecompressSync } from "node:zlib";

const KNOWN_TAGS = [
  "cmap", "head", "hhea", "hmtx", "maxp", "name", "OS/2", "post", "cvt ", "fpgm", "glyf", "loca", "prep", "CFF ", "VORG", "EBDT",
  "EBLC", "gasp", "hdmx", "kern", "LTSH", "PCLT", "VDMX", "vhea", "vmtx", "BASE", "GDEF", "GPOS", "GSUB", "EBSC", "JSTF", "MATH",
  "CBDT", "CBLC", "COLR", "CPAL", "SVG ", "sbix", "acnt", "avar", "bdat", "bloc", "bsln", "cvar", "fdsc", "feat", "fmtx", "fvar",
  "gvar", "hsty", "just", "lcar", "mort", "morx", "opbd", "prop", "trak", "Zapf", "Silf", "Glat", "Gloc", "Feat", "Sill",
];

class Reader {
  constructor(readonly b: Uint8Array, public o = 0) {}
  u8() { if (this.o >= this.b.length) throw new Error("WOFF2: read past the end"); return this.b[this.o++]; }
  u16() { return (this.u8() << 8) | this.u8(); }
  i16() { const v = this.u16(); return v & 0x8000 ? v - 0x10000 : v; }
  u32() { return ((this.u16() << 16) | this.u16()) >>> 0; }
  bytes(n: number) { if (this.o + n > this.b.length) throw new Error("WOFF2: read past the end"); const s = this.b.subarray(this.o, this.o + n); this.o += n; return s; }
  /** UIntBase128: up to five bytes, seven bits each, high bit set on all but the last. */
  base128() {
    let v = 0;
    for (let i = 0; i < 5; i++) {
      const c = this.u8();
      if (i === 0 && c === 0x80) throw new Error("WOFF2: base128 with a leading zero");
      if (v & 0xfe000000) throw new Error("WOFF2: base128 overflow");
      v = (v << 7) | (c & 0x7f);
      if (!(c & 0x80)) return v >>> 0;
    }
    throw new Error("WOFF2: base128 too long");
  }
  /** 255UInt16. */
  u255() {
    const c = this.u8();
    if (c === 253) return this.u16();
    if (c === 255) return this.u8() + 253;
    if (c === 254) return this.u8() + 506;
    return c;
  }
}

class Writer {
  private parts: number[] = [];
  get length() { return this.parts.length; }
  u8(v: number) { this.parts.push(v & 0xff); }
  u16(v: number) { this.u8(v >> 8); this.u8(v); }
  u32(v: number) { this.u16(v >>> 16); this.u16(v & 0xffff); }
  bytes(b: Uint8Array) { for (let i = 0; i < b.length; i++) this.parts.push(b[i]); }
  pad(to: number) { while (this.parts.length % to) this.parts.push(0); }
  done() { return Uint8Array.from(this.parts); }
}

interface Entry { tag: string; origLength: number; length: number; transformed: boolean; data?: Uint8Array }

/** The triplet coordinate encoding (§5.2): one flag byte, then 1–4 data bytes, gives one point's dx, dy and on-curve bit. */
function triplet(flag: number, r: Reader): { dx: number; dy: number; on: boolean } {
  const on = !(flag & 0x80);
  const f = flag & 0x7f;
  const sign = (bit: number, v: number) => (bit & 1 ? v : -v);
  if (f < 10) return { dx: 0, dy: sign(f, ((f & 14) << 7) + r.u8()), on };
  if (f < 20) return { dx: sign(f, (((f - 10) & 14) << 7) + r.u8()), dy: 0, on };
  if (f < 84) {
    const b0 = f - 20, b1 = r.u8();
    return { dx: sign(f, 1 + (b0 & 0x30) + (b1 >> 4)), dy: sign(f >> 1, 1 + ((b0 & 0x0c) << 2) + (b1 & 0x0f)), on };
  }
  if (f < 120) {
    const b0 = f - 84;
    const x = r.u8(), y = r.u8();
    return { dx: sign(f, 1 + (Math.floor(b0 / 12) << 8) + x), dy: sign(f >> 1, 1 + (((b0 % 12) >> 2) << 8) + y), on };
  }
  if (f < 124) {
    const a = r.u8(), b = r.u8(), c = r.u8();
    return { dx: sign(f, (a << 4) + (b >> 4)), dy: sign(f >> 1, ((b & 0x0f) << 8) + c), on };
  }
  const a = r.u8(), b = r.u8(), c = r.u8(), d = r.u8();
  return { dx: sign(f, (a << 8) + b), dy: sign(f >> 1, (c << 8) + d), on };
}

/** Rebuilds glyf and loca from the transformed glyf table (§5.1). */
function untransformGlyf(t: Uint8Array): { glyf: Uint8Array; loca: Uint8Array; indexFormat: number } {
  const h = new Reader(t);
  h.u16(); // reserved
  const optionFlags = h.u16();
  const numGlyphs = h.u16();
  const indexFormat = h.u16();
  const sizes = Array.from({ length: 7 }, () => h.u32());
  let at = h.o;
  const stream = (n: number) => { const r = new Reader(t.subarray(at, at + n)); at += n; return r; };
  const [nContour, nPoints, flags, glyphs, composite, bbox, instructions] = sizes.map(stream);
  const overlap = optionFlags & 1 ? t.subarray(at, at + ((numGlyphs + 7) >> 3)) : null;
  const bitmapLength = 4 * Math.floor((numGlyphs + 31) / 32);
  const bboxBitmap = bbox.bytes(bitmapLength);
  const has = (bits: Uint8Array | null, i: number) => !!bits && (bits[i >> 3] & (0x80 >> (i & 7))) !== 0;

  const glyf = new Writer();
  const offsets: number[] = [];
  for (let i = 0; i < numGlyphs; i++) {
    offsets.push(glyf.length);
    const contours = nContour.i16();
    if (contours === 0) {
      if (has(bboxBitmap, i)) throw new Error("WOFF2: an empty glyph with a bounding box");
      continue;
    }
    if (contours > 0) {
      const ends: number[] = [];
      let total = 0;
      for (let c = 0; c < contours; c++) { total += nPoints.u255(); ends.push(total - 1); }
      const pts = Array.from({ length: total }, () => triplet(flags.u8(), glyphs));
      const insLength = glyphs.u255();
      const ins = instructions.bytes(insLength);
      let box: number[];
      if (has(bboxBitmap, i)) box = [bbox.i16(), bbox.i16(), bbox.i16(), bbox.i16()];
      else {
        let x = 0, y = 0, x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (const p of pts) { x += p.dx; y += p.dy; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
        box = [x0, y0, x1, y1];
      }
      glyf.u16(contours);
      box.forEach((v) => glyf.u16(v & 0xffff));
      ends.forEach((e) => glyf.u16(e));
      glyf.u16(insLength);
      glyf.bytes(ins);
      // Flags, then x deltas, then y deltas: one byte where a delta fits, none where it is zero.
      const xs = new Writer(), ys = new Writer();
      pts.forEach((p, j) => {
        let f = p.on ? 0x01 : 0;
        if (j === 0 && has(overlap, i)) f |= 0x40;
        if (p.dx === 0) f |= 0x10;
        else if (Math.abs(p.dx) < 256) { f |= 0x02 | (p.dx > 0 ? 0x10 : 0); xs.u8(Math.abs(p.dx)); }
        else xs.u16(p.dx & 0xffff);
        if (p.dy === 0) f |= 0x20;
        else if (Math.abs(p.dy) < 256) { f |= 0x04 | (p.dy > 0 ? 0x20 : 0); ys.u8(Math.abs(p.dy)); }
        else ys.u16(p.dy & 0xffff);
        glyf.u8(f);
      });
      glyf.bytes(xs.done());
      glyf.bytes(ys.done());
    } else if (contours === -1) {
      if (!has(bboxBitmap, i)) throw new Error("WOFF2: a composite glyph without a bounding box");
      const box = [bbox.i16(), bbox.i16(), bbox.i16(), bbox.i16()];
      // Component records are stored as in glyf; copy them through, noting whether instructions follow.
      const start = composite.o;
      let more = true, withInstructions = false;
      while (more) {
        const f = composite.u16();
        composite.u16(); // glyph index
        composite.bytes(f & 0x0001 ? 4 : 2); // arguments: words or bytes
        if (f & 0x0008) composite.bytes(2); // one scale
        else if (f & 0x0040) composite.bytes(4); // x and y scale
        else if (f & 0x0080) composite.bytes(8); // 2 × 2
        if (f & 0x0100) withInstructions = true;
        more = (f & 0x0020) !== 0;
      }
      const components = composite.b.subarray(start, composite.o);
      glyf.u16(0xffff);
      box.forEach((v) => glyf.u16(v & 0xffff));
      glyf.bytes(components);
      if (withInstructions) {
        const n = glyphs.u255();
        glyf.u16(n);
        glyf.bytes(instructions.bytes(n));
      }
    } else {
      throw new Error(`WOFF2: glyph ${i} has ${contours} contours`);
    }
    glyf.pad(4);
  }
  offsets.push(glyf.length);
  const loca = new Writer();
  for (const o of offsets) {
    if (indexFormat === 0) loca.u16(o / 2);
    else loca.u32(o);
  }
  return { glyf: glyf.done(), loca: loca.done(), indexFormat };
}

const checksum = (b: Uint8Array) => {
  let sum = 0;
  for (let i = 0; i < b.length; i += 4) sum = (sum + (((b[i] << 24) | ((b[i + 1] ?? 0) << 16) | ((b[i + 2] ?? 0) << 8) | (b[i + 3] ?? 0)) >>> 0)) >>> 0;
  return sum;
};

/** A WOFF2 font as a TrueType (sfnt) file. */
export function woff2ToSfnt(input: Uint8Array): Uint8Array {
  const r = new Reader(input);
  if (r.u32() !== 0x774f4632) throw new Error("WOFF2: not a WOFF2 file");
  const flavor = r.u32();
  if (flavor === 0x74746366) throw new Error("WOFF2: font collections are not supported");
  r.u32(); // length
  const numTables = r.u16();
  r.u16(); // reserved
  r.u32(); // totalSfntSize
  const compressedLength = r.u32();
  r.o = 48;

  const entries: Entry[] = [];
  for (let i = 0; i < numTables; i++) {
    const flags = r.u8();
    const tag = (flags & 0x3f) === 63 ? String.fromCharCode(...Array.from(r.bytes(4))) : KNOWN_TAGS[flags & 0x3f];
    if (!tag) throw new Error(`WOFF2: unknown table tag ${flags & 0x3f}`);
    const version = (flags >> 6) & 3;
    const origLength = r.base128();
    const transformed = tag === "glyf" || tag === "loca" ? version === 0 : version !== 0;
    if (transformed && tag !== "glyf" && tag !== "loca") throw new Error(`WOFF2: the ${tag} transform is not supported`);
    entries.push({ tag, origLength, length: transformed ? r.base128() : origLength, transformed });
  }

  const data = new Uint8Array(brotliDecompressSync(input.subarray(r.o, r.o + compressedLength)));
  let at = 0;
  for (const e of entries) {
    e.data = data.subarray(at, at + e.length);
    at += e.length;
  }
  if (at !== data.length) throw new Error("WOFF2: table data does not fill the stream");

  const glyf = entries.find((e) => e.tag === "glyf");
  const loca = entries.find((e) => e.tag === "loca");
  if (glyf?.transformed && loca) {
    const rebuilt = untransformGlyf(glyf.data!);
    glyf.data = rebuilt.glyf;
    loca.data = rebuilt.loca;
    const head = entries.find((e) => e.tag === "head");
    if (head && ((head.data![50] << 8) | head.data![51]) !== rebuilt.indexFormat) throw new Error("WOFF2: loca format does not match head");
  }

  // The sfnt: offset table, table records sorted by tag, then each table on a four-byte boundary.
  const sorted = [...entries].sort((a, b) => (a.tag < b.tag ? -1 : a.tag > b.tag ? 1 : 0));
  const out = new Writer();
  const pow = 2 ** Math.floor(Math.log2(numTables));
  out.u32(flavor);
  out.u16(numTables);
  out.u16(pow * 16);
  out.u16(Math.log2(pow));
  out.u16(numTables * 16 - pow * 16);
  let offset = 12 + numTables * 16;
  for (const e of sorted) {
    for (const c of e.tag) out.u8(c.charCodeAt(0));
    out.u32(checksum(e.data!));
    out.u32(offset);
    out.u32(e.data!.length);
    offset += Math.ceil(e.data!.length / 4) * 4;
  }
  for (const e of sorted) {
    out.bytes(e.data!);
    out.pad(4);
  }
  return out.done();
}
