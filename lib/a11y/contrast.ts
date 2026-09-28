// Colour contrast, measured — the single implementation in the system.
//
// WCAG 2.x relative luminance and contrast ratio. The colour page, the group
// marks, the contrast gate and the accessibility page all call this; nothing
// else should compute a ratio or state one by hand. A ratio typed into prose
// drifts the moment a token moves — the colour page's "6.5:1" was one.

// ── Thresholds ───────────────────────────────────────────────────────

export const WCAG = {
  /** 1.4.3 — body and UI text. */
  text: 4.5,
  /** 1.4.3 — 24px regular, or 18.66px bold, and up. */
  largeText: 3,
  /** 1.4.11 — graphics and UI components needed to understand or operate. */
  nonText: 3,
  /** 1.4.6 — the enhanced level. Reported, not required. */
  textAAA: 7,
} as const;

/** What a pairing is used for decides the bar it has to clear. */
export type ContrastUse = "text" | "large-text" | "non-text";

export const minimumFor: Record<ContrastUse, number> = {
  text: WCAG.text,
  "large-text": WCAG.largeText,
  "non-text": WCAG.nonText,
};

// ── Colour parsing ───────────────────────────────────────────────────

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** Parses #rgb, #rrggbb, #rrggbbaa, rgb() and rgba(). Throws on anything else,
 *  so a typo in a token fails the gate instead of passing as black. */
export function parseColor(input: string): RGBA {
  const s = input.trim().toLowerCase();
  const hex = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/);
  if (hex) {
    const h = hex[1].length === 3 ? Array.from(hex[1]).map((c) => c + c).join("") : hex[1];
    const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
  }
  const fn = s.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)$/);
  if (fn) {
    const alpha = fn[4] === undefined ? 1 : fn[4].endsWith("%") ? parseFloat(fn[4]) / 100 : parseFloat(fn[4]);
    return { r: +fn[1], g: +fn[2], b: +fn[3], a: alpha };
  }
  throw new Error(`Not a colour: "${input}"`);
}

/** A translucent colour as it appears over an opaque backdrop. */
export function composite(fg: RGBA, backdrop: RGBA): RGBA {
  const a = fg.a;
  return {
    r: fg.r * a + backdrop.r * (1 - a),
    g: fg.g * a + backdrop.g * (1 - a),
    b: fg.b * a + backdrop.b * (1 - a),
    a: 1,
  };
}

export function toHex({ r, g, b }: RGBA): string {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
}

// ── Luminance and ratio ──────────────────────────────────────────────

function channel(v: number): number {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function relLuminance(color: string | RGBA): number {
  const { r, g, b } = typeof color === "string" ? parseColor(color) : color;
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/**
 * Contrast of a foreground on a background. A translucent background is
 * composited over `backdrop` (the surface under it), then a translucent
 * foreground over the result — which is how the browser paints them.
 */
export function contrastRatio(fg: string, bg: string, backdrop = "#ffffff"): number {
  const base = parseColor(backdrop);
  const b = composite(parseColor(bg), base);
  const f = composite(parseColor(fg), b);
  const l1 = relLuminance(f);
  const l2 = relLuminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/** "4.56:1" — rounded down, so a displayed ratio never overstates a pass. */
export function formatRatio(ratio: number): string {
  return `${(Math.floor(ratio * 100) / 100).toFixed(2)}:1`;
}

export function passes(ratio: number, use: ContrastUse): boolean {
  return ratio >= minimumFor[use];
}

/** Of two candidates, the one that reads better on `bg` — for labels on swatches. */
export function bestOn(bg: string, a: string, b: string): string {
  return contrastRatio(a, bg) >= contrastRatio(b, bg) ? a : b;
}
