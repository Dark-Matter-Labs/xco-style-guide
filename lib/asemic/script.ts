// The xCO asemic script: writing with no fixed meaning, grown from xCO's own
// sentences. Spec: docs/superpowers/specs/2026-11-24-asemic-script-design.md.
//
// Each row is a thread. A word longer than three letters becomes a cluster of
// marks mirrored above and below it; shorter words and punctuation become small
// stacks; a line break lets the dotted thread run on alone. The beads on the
// thread are the logotype's O and C, and the x, in dusk, opens the thread.
// Every token draws its randomness from (seed, position, token), so the same
// text always writes the same sheet but no word maps to a fixed glyph: open
// writing, not a cipher. Pure and deterministic; no DOM.

export type Register = "paper" | "ink";
type Base = { row: number; token: number };
export type Mark = Base & (
  | { kind: "thread"; x1: number; x2: number; y: number; dotted: boolean }
  | { kind: "square"; x: number; y: number; size: number }
  | { kind: "dash"; x: number; y: number; w: number }
  | { kind: "box"; x: number; y: number; w: number; h: number }
  | { kind: "ring"; x: number; y: number; r: number; open: boolean }
  | { kind: "x"; x: number; y: number; k: number }
);

export interface SheetOptions {
  width: number;
  height: number;
  margin: number;
  rows: number;
  seed: string;
  density: readonly [number, number];
}

export interface Sheet {
  width: number;
  height: number;
  margin: number;
  rows: number;
  rowHeight: number;
  unit: number;
  marks: Mark[];
  /** The source words that landed in each row. */
  lines: string[];
}

export const INK = "#101F24";
export const PAPER = "#F6F1E5";
export const DUSK = "#F47743";
export const DENSITY = {
  sparse: [0.35, 0.55],
  normal: [0.45, 0.8],
  dense: [0.65, 0.92],
} as const;

// Built with the constructor: this repo's TypeScript target does not allow the u flag in literals.
// Letters keep their combining marks (Gurmukhi, Devanagari, a decomposed ë); digits count as letters,
// and a version keeps its point (v0.2).
const TOKEN = new RegExp("[\\p{L}\\p{M}\\p{N}’'\\-]+(?:\\.\\p{N}+)*|[.,:;]", "gu");
const LETTER = new RegExp("\\p{L}|\\p{N}", "u");
const letters = (t: string) => Array.from(t).filter((c) => LETTER.test(c)).length;

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}
const hash = (str: string) => Array.from(str).reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
const pick = <T,>(r: () => number, a: readonly T[]) => a[Math.floor(r() * a.length)];

/** Words, punctuation (. , : ;) and "¶" after every line. */
export function tokenize(text: string): string[] {
  return text.split(/\r?\n/).flatMap((line) => [...(line.match(TOKEN) || []), "¶"]);
}

const SHAPES = ["diamond", "spindle", "hourglass", "fanL", "fanR", "wave", "bead", "spindle"] as const;

export function writeSheet(text: string, o: SheetOptions): Sheet {
  const rowHeight = (o.height - 2 * o.margin) / o.rows;
  const U = rowHeight / 13; // the tallest cluster (4 lattice steps of 1.4 U) stays inside half a row
  const S = U * 1.4;
  const right = o.width - o.margin;
  const marks: Mark[] = [];
  const words: string[][] = Array.from({ length: o.rows }, () => []);
  const sheet = (): Sheet => ({
    width: o.width, height: o.height, margin: o.margin, rows: o.rows, rowHeight, unit: U, marks,
    lines: words.map((ws) => ws.join(" ").replace(/ ([.,:;])/g, "$1")),
  });

  const once = tokenize(text);
  if (!once.some((t) => t !== "¶")) return sheet();

  let row = 0;
  let x = o.margin;
  let phraseStart: number | null = null;
  const yOf = (r: number) => o.margin + rowHeight * (r + 0.5);

  const thread = (x1: number, x2: number, dotted: boolean, token: number) => {
    const a = Math.max(o.margin, x1), b = Math.min(right, x2);
    if (b - a > 0.01) marks.push({ kind: "thread", x1: a, x2: b, y: yOf(row), dotted, row, token });
  };
  const newRow = (token: number) => {
    if (phraseStart !== null) thread(phraseStart, x, true, token);
    row++;
    x = o.margin;
    phraseStart = null;
  };

  // A small stack centred on px: punctuation, or a word of one to three letters.
  const stack = (r: () => number, px: number, t: string, token: number) => {
    const y = yOf(row), base = { row, token };
    if (t === ".") for (const k of [-1.5, -0.5, 0.5, 1.5]) marks.push({ kind: "square", x: px, y: y + k * U * 1.1, size: U * 0.7, ...base });
    else if (t === ",") for (const k of [-0.6, 0.6]) marks.push({ kind: "square", x: px, y: y + k * U, size: U * 0.7, ...base });
    else if (t === ":" || t === ";") for (const k of [-1, 0, 1]) marks.push({ kind: "dash", x: px - U * 0.6, y: y + k * U * 0.6, w: U * 1.2, ...base });
    else {
      const n = Math.max(1, letters(t)), kind = r();
      if (kind < 0.45) for (let k = 0; k < n; k++) marks.push({ kind: "square", x: px, y: y + (k - (n - 1) / 2) * U * 1.15, size: U * 0.72, ...base });
      else if (kind < 0.7) marks.push({ kind: "box", x: px, y, w: U * 1.1, h: U * (n + 0.5) * 0.9, ...base });
      else for (let k = 0; k <= n; k++) marks.push({ kind: "dash", x: px - U * 0.6, y: y + (k - n / 2) * U * 0.55, w: U * 1.2, ...base });
    }
  };

  // A cluster from x0 with n columns: an envelope of options, mirrored about the thread.
  const cluster = (r: () => number, x0: number, n: number, token: number) => {
    const y = yOf(row), base = { row, token };
    const width = n * S + U * 0.4; // a 0.2 U pad each side keeps the 1.6 U dashes inside
    const A = 2 + Math.floor(r() * 3);
    const shape = pick(r, SHAPES), phase = r() * 6.28;
    const density = o.density[0] + r() * (o.density[1] - o.density[0]);
    const env = (c: number) => {
      const t = n === 1 ? 0.5 : c / (n - 1);
      switch (shape) {
        case "diamond": return A * (1 - Math.abs(2 * t - 1));
        case "spindle": return A * Math.sin(Math.PI * t);
        case "hourglass": return A * Math.abs(2 * t - 1) + 0.6;
        case "fanL": return A * (1 - t) + 0.4;
        case "fanR": return A * t + 0.4;
        case "wave": return A * (0.55 + 0.45 * Math.sin(c * 0.9 + phase));
        default: return t > 0.3 && t < 0.7 ? A : 1;
      }
    };

    // Beads are placed first (an x opens the thread, so the thread is drawn around it)
    // but painted last, so the thread and hatching never cross an O, C or box.
    const gaps: [number, number][] = [];
    const beadMarks: Mark[] = [];
    const beads = 1 + Math.floor(r() * 3);
    for (let b = 0; b < beads; b++) {
      const bx = Math.min(x0 + width - U * 1.4, Math.max(x0 + U * 1.4, x0 + (0.15 + r() * 0.7) * width));
      const kind = r();
      if (kind < 0.3) beadMarks.push({ kind: "box", x: bx, y, w: U * 2.4, h: U * 1.4, ...base });
      else if (kind < 0.58) beadMarks.push({ kind: "ring", x: bx, y, r: U * 0.8, open: false, ...base });
      else if (kind < 0.84) beadMarks.push({ kind: "ring", x: bx, y, r: U * 0.8, open: true, ...base });
      else if (kind < 0.93) beadMarks.push({ kind: "square", x: bx, y, size: U * 1.4, ...base });
      else {
        beadMarks.push({ kind: "x", x: bx, y, k: U * 0.7, ...base });
        gaps.push([bx - U * 0.8, bx + U * 0.8]);
      }
    }
    let from = x0;
    for (const [g1, g2] of gaps.sort((a, b) => a[0] - b[0])) {
      if (g1 > from) marks.push({ kind: "thread", x1: from, x2: g1, y, dotted: false, ...base });
      from = Math.max(from, g2);
    }
    if (x0 + width > from) marks.push({ kind: "thread", x1: from, x2: x0 + width, y, dotted: false, ...base });

    // A run of hatching: the identity's scan lines, read as tone.
    const hs = r() < 0.5 ? Math.floor(r() * n * 0.6) : -1;
    const he = hs + 3 + Math.floor(r() * 6);
    for (let c = 0; c < n; c++) {
      const cx = x0 + U * 0.2 + c * S + S / 2;
      const h = Math.max(0, Math.min(A, Math.round(env(c) + (r() - 0.5))));
      if (hs >= 0 && c >= hs && c < he) {
        for (let k = -h * 2; k <= h * 2; k++) if (k) marks.push({ kind: "dash", x: cx - S / 2, y: y + k * U * 0.62, w: S * 0.9, ...base });
        continue;
      }
      for (let k = 1; k <= h; k++) {
        if (r() > density) continue;
        if (r() < 0.74) for (const s of [-1, 1]) marks.push({ kind: "square", x: cx, y: y + s * k * S, size: U * 0.82, ...base });
        else for (const s of [-1, 1]) marks.push({ kind: "dash", x: cx - U * 0.8, y: y + s * k * S, w: U * 1.6, ...base });
      }
    }
    marks.push(...beadMarks);
    return width;
  };

  const maxCols = Math.max(4, Math.floor((right - o.margin - U * 0.4) / S));
  // Repeat the text until the sheet is full; the token index keeps counting so every repeat is new.
  for (let tok = 0; row < o.rows && tok < once.length * 400; tok++) {
    const t = once[tok % once.length];
    const r = rng(hash(o.seed + "|" + tok + "|" + t));

    if (t === "¶" || (t === "." && r() < 0.5)) {
      if (t === ".") {
        if (x + U * 2.4 > right) newRow(tok);
        if (row >= o.rows) break;
        stack(r, x + U * 1.6, t, tok);
        words[row].push(t);
        x += U * 3.9;
      }
      const rest = t === "¶" ? (right - x) * (0.3 + r() * 0.7) : U * (8 + r() * 40);
      thread(x, x + rest, true, tok);
      x = Math.min(right, x + rest) + U * 2;
      phraseStart = null;
      if (x > right - U * 6) newRow(tok);
      continue;
    }

    const long = letters(t) > 3;
    const n = long ? Math.min(maxCols, Math.max(4, Math.round(letters(t) * 1.25 + r() * 3))) : 0;
    const width = long ? n * S + U * 0.4 : U * 2.4;
    if (x + width > right) newRow(tok);
    if (row >= o.rows) break;
    words[row].push(t);

    if (long) {
      if (phraseStart !== null) thread(phraseStart, x, true, tok);
      x += cluster(r, x, n, tok);
      phraseStart = x;
      x += U * (1.5 + r() * 2.5);
    } else {
      if (phraseStart !== null) thread(phraseStart, x - U, true, tok);
      phraseStart = null;
      stack(r, x + U * 1.6, t, tok);
      x += U * (3.3 + r() * 3);
    }
  }
  return sheet();
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const f = (n: number) => +n.toFixed(2);

/** The sheet as a standalone SVG: its own ground, ink marks, and the x in dusk. */
export function toSvg(sheet: Sheet, register: Register, label: string, physical?: { w: string; h: string }): string {
  const fg = register === "ink" ? PAPER : INK;
  const bg = register === "ink" ? INK : PAPER;
  const U = sheet.unit;
  let body = "";
  for (const m of sheet.marks) {
    switch (m.kind) {
      case "thread":
        body += `<path d="M${f(m.x1)} ${f(m.y)}H${f(m.x2)}" stroke="${fg}" stroke-width="${f(U * (m.dotted ? 0.18 : 0.2))}"${m.dotted ? ` stroke-dasharray="${f(U * 0.35)} ${f(U * 0.55)}"` : ""}/>`;
        break;
      case "square":
        body += `<rect x="${f(m.x - m.size / 2)}" y="${f(m.y - m.size / 2)}" width="${f(m.size)}" height="${f(m.size)}" fill="${fg}"/>`;
        break;
      case "dash":
        body += `<path d="M${f(m.x)} ${f(m.y)}h${f(m.w)}" stroke="${fg}" stroke-width="${f(U * 0.22)}"/>`;
        break;
      case "box":
        body += `<rect x="${f(m.x - m.w / 2)}" y="${f(m.y - m.h / 2)}" width="${f(m.w)}" height="${f(m.h)}" fill="${bg}" stroke="${fg}" stroke-width="${f(U * 0.25)}"/>`;
        break;
      case "ring":
        if (m.open) {
          // The logotype's C: a 100° opening, facing right.
          const a = (50 * Math.PI) / 180, px = f(m.x + m.r * Math.cos(a)), dy = m.r * Math.sin(a);
          body += `<path d="M${px} ${f(m.y - dy)}A${f(m.r)} ${f(m.r)} 0 1 0 ${px} ${f(m.y + dy)}" fill="${bg}" stroke="${fg}" stroke-width="${f(U * 0.3)}"/>`;
        } else body += `<circle cx="${f(m.x)}" cy="${f(m.y)}" r="${f(m.r)}" fill="${bg}" stroke="${fg}" stroke-width="${f(U * 0.3)}"/>`;
        break;
      case "x": {
        // The logotype's x proportions, 56 wide by 62 tall.
        const kh = (m.k * 62) / 56;
        body += `<path d="M${f(m.x - m.k)} ${f(m.y - kh)}L${f(m.x + m.k)} ${f(m.y + kh)}M${f(m.x + m.k)} ${f(m.y - kh)}L${f(m.x - m.k)} ${f(m.y + kh)}" stroke="${DUSK}" stroke-width="${f(U * 0.3)}"/>`;
        break;
      }
    }
  }
  const w = sheet.width, h = sheet.height, l = esc(label);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${physical?.w ?? w}" height="${physical?.h ?? h}" role="img" aria-label="${l}"><title>${l}</title><rect width="${w}" height="${h}" fill="${bg}"/><g fill="none" stroke-linecap="butt">${body}</g></svg>`;
}
