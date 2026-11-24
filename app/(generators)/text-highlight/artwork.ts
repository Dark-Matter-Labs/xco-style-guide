// Text highlight's artwork: a passage with exact-span highlights and numbered
// sidenotes, laid out once and drawn twice: as SVG (the preview, serialised for
// the SVG export) and on a canvas (the PNG), so what is exported is what was shown.
//
// Fills are the five highlight roles (design-tokens highlightTokens) behind
// Matter 900 text. Every face is Untitled at 400, the one weight that ships.
// Layout is pure: text is measured through `measure`, so it runs in node too.

import { highlightTokens, identityScales, paletteHex, typography } from "@/lib/design-tokens";

export type Role = (typeof highlightTokens)[number]["id"];

export interface Annotation {
  id: number;
  term: string;
  note: string;
  role: Role;
}

export const HL_TEXT = identityScales.matter[900];
export const fillOf = (role: Role) => highlightTokens.find((h) => h.id === role)!.hex;

export const W = 1200;
const PAD = 64;
const TEXT_W = 660;
const NOTE_X = PAD + TEXT_W + 48;
const NOTE_W = W - NOTE_X - PAD;
export const BODY = { size: 24, line: 40, font: `400 24px ${typography.faces.body.stack}` };
export const NOTE = { size: 15, line: 22, font: `400 15px ${typography.faces.body.stack}` };
export const NUM = { size: 13, font: `400 13px ${typography.faces.body.stack}` };

export type Measure = (text: string, font: string) => number;

/** A run of the passage: plain, or the first occurrence of an annotation's term. */
interface Run { text: string; ann?: Annotation }

/** Splits the text into runs, marking each term's first case-insensitive occurrence. Longest terms first. */
export function runsOf(text: string, anns: Annotation[]): Run[] {
  const sorted = anns.filter((a) => a.term.trim()).sort((a, b) => b.term.length - a.term.length);
  const lower = text.toLowerCase();
  const spans: { start: number; end: number; ann: Annotation }[] = [];
  for (const ann of sorted) {
    const t = ann.term.toLowerCase();
    let from = 0;
    for (;;) {
      const at = lower.indexOf(t, from);
      if (at === -1) break;
      if (!spans.some((s) => at < s.end && at + t.length > s.start)) {
        spans.push({ start: at, end: at + t.length, ann });
        break;
      }
      from = at + 1;
    }
  }
  spans.sort((a, b) => a.start - b.start);
  const runs: Run[] = [];
  let i = 0;
  for (const s of spans) {
    if (s.start > i) runs.push({ text: text.slice(i, s.start) });
    runs.push({ text: text.slice(s.start, s.end), ann: s.ann });
    i = s.end;
  }
  if (i < text.length) runs.push({ text: text.slice(i) });
  return runs;
}

export interface Piece { x: number; text: string; w: number; ann?: Annotation; num?: boolean }
export interface Line { y: number; pieces: Piece[] }
export interface Note { ann: Annotation; y: number; lines: string[] }
export interface Layout { width: number; height: number; lines: Line[]; notes: Note[] }

/** Greedy wrap of plain text into lines no wider than `max`. */
function wrapWidth(text: string, max: number, font: string, measure: Measure): string[] {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const test = line ? `${line} ${word}` : word;
    if (line && measure(test, font) > max) {
      out.push(line);
      line = word;
    } else line = test;
  }
  if (line) out.push(line);
  return out;
}

export function layout(text: string, anns: Annotation[], measure: Measure): Layout {
  // Words keep the run they came from; a highlighted phrase may break across lines.
  type Word = { text: string; ann?: Annotation; last?: boolean };
  const words: Word[] = [];
  for (const run of runsOf(text.replace(/\s+/g, " ").trim(), anns)) {
    const parts = run.text.split(/(\s+)/).filter(Boolean);
    const lastWord = parts.map((p) => !/^\s+$/.test(p)).lastIndexOf(true);
    parts.forEach((p, i) => words.push({ text: p, ann: run.ann, last: run.ann && i === lastWord }));
  }

  const numW = (ann: Annotation) => measure(String(ann.id), NUM.font) + 4;
  const lines: Line[] = [];
  let pieces: Piece[] = [];
  let x = 0;
  let y = PAD + BODY.size;
  const newline = () => {
    // A line never starts or ends on a space.
    while (pieces.length && /^\s+$/.test(pieces[pieces.length - 1].text)) pieces.pop();
    lines.push({ y, pieces });
    pieces = [];
    x = 0;
    y += BODY.line;
  };
  for (const w of words) {
    const space = /^\s+$/.test(w.text);
    if (space && x === 0) continue;
    const width = measure(w.text, BODY.font) + (w.last && w.ann ? numW(w.ann) : 0);
    if (!space && x > 0 && x + width > TEXT_W) newline();
    pieces.push({ x: PAD + x, text: w.text, w: measure(w.text, BODY.font), ann: w.ann });
    x += measure(w.text, BODY.font);
    if (w.last && w.ann) {
      pieces.push({ x: PAD + x + 2, text: String(w.ann.id), w: numW(w.ann) - 2, ann: w.ann, num: true });
      x += numW(w.ann);
    }
  }
  if (pieces.length) newline();

  // Sidenotes at their term's line, pushed down so none overlap.
  // In reading order of their terms, so a note never sits below one whose term comes later.
  const placed = anns
    .map((ann) => {
      const li = lines.findIndex((l) => l.pieces.some((p) => p.ann?.id === ann.id));
      return { ann, li, x: li < 0 ? 0 : lines[li].pieces.find((p) => p.ann?.id === ann.id)!.x };
    })
    .filter((n) => n.li >= 0)
    .sort((a, b) => a.li - b.li || a.x - b.x);
  const notes: Note[] = [];
  let cursor = 0;
  for (const { ann, li } of placed) {
    const line = lines[li];
    const top = Math.max(line.y - BODY.size, cursor);
    const noteLines = wrapWidth(`${ann.note}`, NOTE_W - 28, NOTE.font, measure);
    notes.push({ ann, y: top, lines: noteLines });
    cursor = top + Math.max(1, noteLines.length) * NOTE.line + 14;
  }
  const textBottom = lines.length ? lines[lines.length - 1].y + BODY.line - BODY.size : PAD;
  return { width: W, height: Math.ceil(Math.max(textBottom, cursor) + PAD), lines, notes };
}

// ── Drawing ──────────────────────────────────────────────────────────

/** Highlight boxes: one per run of pieces sharing an annotation on a line. */
export function boxes(line: Line) {
  const out: { x: number; w: number; ann: Annotation }[] = [];
  for (const p of line.pieces) {
    if (!p.ann) continue;
    const prev = out[out.length - 1];
    if (prev && prev.ann.id === p.ann.id && Math.abs(prev.x + prev.w - p.x) < 4) prev.w = p.x + p.w - prev.x;
    else out.push({ x: p.x, w: p.w, ann: p.ann });
  }
  return out;
}

export const PADX = 3;
export const ASC = 0.8;    // the fill's top, in body sizes above the baseline
export const DESC = 0.32;  // and its bottom below
/** Where the sidenotes start, and the superscript number's lift above the baseline. */
export { NOTE_X };
export const LIFT = 0.38;

/** The same drawing on a canvas, for the PNG: the browser's own Untitled faces, not the PNG route's DM Mono. */
export function paint(ctx: CanvasRenderingContext2D, L: Layout, scale = 1): void {
  ctx.save();
  ctx.scale(scale, scale);
  ctx.fillStyle = paletteHex.paper;
  ctx.fillRect(0, 0, L.width, L.height);
  ctx.textBaseline = "alphabetic";
  for (const line of L.lines) {
    for (const b of boxes(line)) {
      ctx.fillStyle = fillOf(b.ann.role);
      ctx.fillRect(b.x - PADX, line.y - BODY.size * ASC, b.w + 2 * PADX, BODY.size * (ASC + DESC));
    }
    for (const p of line.pieces) {
      if (/^\s+$/.test(p.text)) continue;
      ctx.fillStyle = p.ann ? HL_TEXT : paletteHex.ink;
      ctx.font = p.num ? NUM.font : BODY.font;
      ctx.fillText(p.text, p.x, p.num ? line.y - BODY.size * LIFT : line.y);
    }
  }
  for (const n of L.notes) {
    ctx.fillStyle = fillOf(n.ann.role);
    ctx.fillRect(NOTE_X, n.y + 3, 20, 18);
    ctx.fillStyle = HL_TEXT;
    ctx.font = NUM.font;
    ctx.textAlign = "center";
    ctx.fillText(String(n.ann.id), NOTE_X + 10, n.y + 16.5);
    ctx.textAlign = "left";
    ctx.fillStyle = paletteHex.ink;
    ctx.font = NOTE.font;
    n.lines.forEach((l, i) => ctx.fillText(l, NOTE_X + 28, n.y + 16 + i * NOTE.line));
  }
  ctx.restore();
}
