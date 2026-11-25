// Small sfnt (TrueType) helpers for the PNG route's fallback faces.
//
// resvg shapes a whole line in its base face, and when a fallback face covers
// every character of that line it swaps the line to the fallback wholesale:
// one arrow in a headline would set the headline in Noto. So each fallback is
// trimmed to the characters Untitled lacks. It can then never cover a whole
// Latin line, and resvg replaces only the missing glyphs.

const u16 = (b: Uint8Array, o: number) => (b[o] << 8) | b[o + 1];
const u32 = (b: Uint8Array, o: number) => ((u16(b, o) << 16) | u16(b, o + 2)) >>> 0;

/** The font's tables by tag. */
export function tables(font: Uint8Array): Map<string, Uint8Array> {
  const out = new Map<string, Uint8Array>();
  const n = u16(font, 4);
  for (let i = 0; i < n; i++) {
    const r = 12 + i * 16;
    const tag = String.fromCharCode(font[r], font[r + 1], font[r + 2], font[r + 3]);
    const offset = u32(font, r + 8), length = u32(font, r + 12);
    if (offset + length > font.length) throw new Error(`sfnt: ${tag} runs past the end`);
    out.set(tag, font.subarray(offset, offset + length));
  }
  return out;
}

/** An sfnt file from its tables: records sorted by tag, each table on a four-byte boundary. */
export function sfnt(flavor: number, byTag: Map<string, Uint8Array>): Uint8Array {
  const sorted = Array.from(byTag.entries()).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const n = sorted.length;
  const pad = (x: number) => Math.ceil(x / 4) * 4;
  const out = new Uint8Array(12 + n * 16 + sorted.reduce((s, [, d]) => s + pad(d.length), 0));
  const v = new DataView(out.buffer);
  const pow = 2 ** Math.floor(Math.log2(n));
  v.setUint32(0, flavor);
  v.setUint16(4, n);
  v.setUint16(6, pow * 16);
  v.setUint16(8, Math.log2(pow));
  v.setUint16(10, n * 16 - pow * 16);
  let offset = 12 + n * 16;
  sorted.forEach(([tag, data], i) => {
    const r = 12 + i * 16;
    for (let c = 0; c < 4; c++) out[r + c] = tag.charCodeAt(c);
    let sum = 0;
    for (let j = 0; j < data.length; j += 4) sum = (sum + (((data[j] << 24) | ((data[j + 1] ?? 0) << 16) | ((data[j + 2] ?? 0) << 8) | (data[j + 3] ?? 0)) >>> 0)) >>> 0;
    v.setUint32(r + 4, sum);
    v.setUint32(r + 8, offset);
    v.setUint32(r + 12, data.length);
    out.set(data, offset);
    offset += pad(data.length);
  });
  return out;
}

/** Code point to glyph id, from the Unicode cmap subtables (formats 4 and 12). */
export function charMap(font: Uint8Array): Map<number, number> {
  const cmap = tables(font).get("cmap");
  if (!cmap) throw new Error("sfnt: no cmap");
  const out = new Map<number, number>();
  for (let i = 0, n = u16(cmap, 2); i < n; i++) {
    const platform = u16(cmap, 4 + i * 8), encoding = u16(cmap, 6 + i * 8);
    if (!(platform === 0 || (platform === 3 && (encoding === 1 || encoding === 10)))) continue;
    const s = cmap.subarray(u32(cmap, 8 + i * 8));
    const format = u16(s, 0);
    if (format === 4) {
      const segs = u16(s, 6) / 2;
      const ends = 14, starts = 16 + segs * 2, deltas = starts + segs * 2, ranges = deltas + segs * 2;
      for (let k = 0; k < segs; k++) {
        const end = u16(s, ends + k * 2), start = u16(s, starts + k * 2), delta = u16(s, deltas + k * 2), range = u16(s, ranges + k * 2);
        for (let c = start; c <= end && c !== 0xffff; c++) {
          let g = range === 0 ? c + delta : u16(s, ranges + k * 2 + range + (c - start) * 2);
          if (range !== 0 && g !== 0) g += delta;
          g &= 0xffff;
          if (g) out.set(c, g);
        }
      }
    } else if (format === 12) {
      for (let k = 0, groups = u32(s, 12); k < groups; k++) {
        const start = u32(s, 16 + k * 12), end = u32(s, 20 + k * 12), first = u32(s, 24 + k * 12);
        for (let c = start; c <= end; c++) out.set(c, first + c - start);
      }
    }
  }
  return out;
}

/** The font with its cmap cut down to the code points `keep` allows (one format 12 subtable). Glyph data is left as it is. */
export function keepChars(font: Uint8Array, keep: (codePoint: number) => boolean): Uint8Array {
  const pairs = Array.from(charMap(font).entries()).filter(([c]) => keep(c)).sort((a, b) => a[0] - b[0]);
  const groups: [number, number, number][] = [];
  for (const [c, g] of pairs) {
    const last = groups[groups.length - 1];
    if (last && c === last[1] + 1 && g === last[2] + (c - last[0])) last[1] = c;
    else groups.push([c, c, g]);
  }
  const sub = new Uint8Array(16 + groups.length * 12);
  const sv = new DataView(sub.buffer);
  sv.setUint16(0, 12);
  sv.setUint32(4, sub.length);
  sv.setUint32(12, groups.length);
  groups.forEach(([start, end, first], k) => {
    sv.setUint32(16 + k * 12, start);
    sv.setUint32(20 + k * 12, end);
    sv.setUint32(24 + k * 12, first);
  });
  const cmap = new Uint8Array(12 + sub.length);
  const cv = new DataView(cmap.buffer);
  cv.setUint16(2, 1); // one subtable
  cv.setUint16(4, 3); // Windows
  cv.setUint16(6, 10); // Unicode, full repertoire
  cv.setUint32(8, 12);
  cmap.set(sub, 12);
  const byTag = tables(font);
  byTag.set("cmap", cmap);
  return sfnt(u32(font, 0), byTag);
}

/** The font without the named tables. */
export function withoutTables(font: Uint8Array, tags: string[]): Uint8Array {
  const byTag = tables(font);
  for (const t of tags) byTag.delete(t);
  return sfnt(u32(font, 0), byTag);
}
