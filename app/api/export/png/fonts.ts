// The faces the PNG route renders with, in the order resvg searches them.
//
// The licensed Untitled faces, read from the site's own web fonts and decoded
// to TrueType: resvg reads TTF, not WOFF2. Then Noto (SIL OFL, in ./fallback)
// for the characters Untitled lacks: arrows, maths and marks, Vietnamese,
// Greek, Cyrillic. Each fallback is trimmed to exactly those characters, so
// Untitled always draws what it can (see sfnt.ts for why). next.config traces
// all of these files into the function.

import { charMap, keepChars, withoutTables } from "./sfnt";
import { woff2ToSfnt } from "./woff2";

export const FONT_FILES = ["UntitledSansRegular", "UntitledSansItalic", "UntitledSerifRegular", "UntitledSerifItalic"];
export const FALLBACK_FILES = ["NotoSans-Regular", "NotoSansMath-Regular", "NotoSansSymbols2-Regular"];

// Built with the constructor: this repo's TypeScript target does not allow the u flag in literals.
const MARK = new RegExp("\\p{M}", "u");

/** Every face, Untitled first. `read` takes a path relative to the project root. */
export async function pngFonts(read: (path: string) => Promise<Uint8Array>): Promise<{ untitled: Uint8Array[]; fallbacks: Uint8Array[] }> {
  // resvg replaces a line's missing glyphs only when every face gives the line the same glyph
  // count; if one differs, it drops the fallback for the whole line. A face builds a letter it
  // lacks from parts (ế as ê + ´, ά as α + ´) when it has a stand-alone accent, so no face keeps
  // one. The route sends text composed (NFC), so every accented letter arrives whole.
  const accent = (c: number) => MARK.test(String.fromCodePoint(c));
  const untitled = (await Promise.all(FONT_FILES.map((f) => read(`public/fonts/${f}.woff2`))))
    .map((f) => keepChars(woff2ToSfnt(f), (c) => !accent(c)));
  const covered = new Set(untitled.flatMap((f) => Array.from(charMap(f).keys())));
  // No GSUB in the fallbacks either: Noto's ccmp splits some letters (ẹ, Ά) into letter and
  // accent. Each kept character has its own precomposed glyph, so nothing is lost.
  const fallbacks = (await Promise.all(FALLBACK_FILES.map((f) => read(`app/api/export/png/fallback/${f}.ttf`))))
    .map((f) => withoutTables(keepChars(f, (c) => !covered.has(c) && !accent(c)), ["GSUB"]));
  return { untitled, fallbacks };
}
