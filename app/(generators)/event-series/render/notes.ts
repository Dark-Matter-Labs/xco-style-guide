import { paletteHex } from "@/lib/design-tokens";
import { paintMark, paintOptionField, paintTerritory, sweep } from "@/lib/regimes/paint";
import { drawHeadline, type Ink } from "./blocks";
import { drawLogotype, logotypeWidth } from "./lockup";
import { metrics } from "./metrics";
import { font, setTracking } from "./text";
import { drawTimePrint, SWEEP_DARK } from "./time-print";
import type { Assets, CardSpec, EmbedId, NoteId, Rect } from "./types";

type Ctx = CanvasRenderingContext2D;
type Template = (ctx: Ctx, spec: CardSpec, phase: number, assets: Assets) => void;

// xCO notes: the social card's three layouts, folded into event series (D12).
// xCO's own cards, with no Medulla lockup, imagery or motion: the tag, a
// headline and a byline, the drawn logotype, and in the diagram layout one of
// the Three Regimes embeds. Fields map as Kicker = tag, Title = headline,
// Subtitle = byline; date, time and location are not drawn.

const { paper: PAPER, ink: INK, inkMuted: MUTED, duskInk: DUSK_INK } = paletteHex;
const clear = "rgba(0,0,0,0)";

/** Text colours per note: on paper, and on the navy-to-dusk sweep (paper above, ink in the light footer). */
export const NOTE_INKS = {
  paper: { ground: PAPER, text: INK, tag: DUSK_INK, byline: MUTED },
  sweepTop: { text: PAPER, tag: PAPER },
  sweepFooter: { byline: INK, logo: INK },
} as const;

export const isNote = (id: string): id is NoteId => id.startsWith("note-");

export const noteList: { id: NoteId; label: string; hint: string }[] = [
  { id: "note-typographic", label: "xCO note — typographic", hint: "Headline on paper — xCO only, no Medulla" },
  { id: "note-diagram", label: "xCO note — diagram", hint: "Headline beside a Three Regimes diagram" },
  { id: "note-abstract", label: "xCO note — abstract", hint: "Paper type on the navy-to-dusk sweep" },
];

export const embedList: { id: EmbedId; label: string; hint: string }[] = [
  { id: "three-regimes", label: "Three Regimes", hint: "Frontier / Fortress / Field mark" },
  { id: "option-field", label: "Option Field", hint: "Variable-weight scanline field" },
  { id: "territory", label: "Territory", hint: "Weighted treemap — concept areas by size" },
];

/** The headline without the byline, which the footer carries. */
const headlineOnly = (spec: CardSpec): CardSpec => ({ ...spec, content: { ...spec.content, subtitle: "" } });

/** Byline on the left, the logotype on the right, on one baseline. Returns the footer's top. */
function footer(ctx: Ctx, spec: CardSpec, assets: Assets, k: ReturnType<typeof metrics>, byline: string, logo: string): number {
  const { W, H, u, m, safeBottom } = k;
  const base = H - m - safeBottom;
  const cap = 30 * u;
  const logoW = logotypeWidth(cap);
  drawLogotype(ctx, W - m - logoW, base - cap, cap, logo);
  const text = spec.content.subtitle.trim();
  if (text) {
    let size = 22 * u;
    const room = W - 2 * m - logoW - 32 * u;
    ctx.font = font(size, assets.fonts.label, 400);
    setTracking(ctx, size * 0.04);
    if (ctx.measureText(text).width > room) {
      size *= room / ctx.measureText(text).width;
      ctx.font = font(size, assets.fonts.label, 400);
      setTracking(ctx, size * 0.04);
    }
    ctx.fillStyle = byline;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(text, m, base);
    setTracking(ctx, 0);
  }
  return base - cap;
}

function rule(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, alpha: number): void {
  ctx.save();
  ctx.strokeStyle = INK;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function embed(ctx: Ctx, id: EmbedId, r: Rect, u: number, assets: Assets): void {
  if (id === "three-regimes") {
    const scale = Math.min(r.w / 400, r.h / 200) * 0.92;
    paintMark(ctx, r.x + (r.w - 400 * scale) / 2, r.y + (r.h - 200 * scale) / 2, scale, 2 * u);
  } else if (id === "option-field") {
    paintOptionField(ctx, r.x, r.y, r.w, r.h, INK, Math.max(1, u * 1.4));
  } else {
    paintTerritory(ctx, r.x, r.y, r.w, r.h, 6 * u, 44 * u, assets.fonts.label);
  }
}

const onPaper: Ink = { text: INK, accent: DUSK_INK, halo: clear, onLight: true, plate: PAPER };

const typographic: Template = (ctx, spec, _phase, assets) => {
  const k = metrics(spec);
  const { W, H, u, m, landscape, safeTop } = k;
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  drawTimePrint(ctx, spec);
  const top = footer(ctx, spec, assets, k, MUTED, INK);
  const ruleY = top - 28 * u;
  rule(ctx, m, ruleY, W - m, ruleY, 0.12);
  const y = m + safeTop;
  drawHeadline(ctx, headlineOnly(spec), assets, { x: m, y, w: (W - 2 * m) * (landscape ? 0.8 : 1), h: ruleY - m - y }, onPaper, u, {
    maxSize: landscape ? 112 : 130,
    titleShare: 0.85,
  });
};

const diagram: Template = (ctx, spec, _phase, assets) => {
  const k = metrics(spec);
  const { W, H, u, m, landscape, safeTop } = k;
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  drawTimePrint(ctx, spec);
  const top = footer(ctx, spec, assets, k, MUTED, INK);
  const ruleY = top - 28 * u;
  rule(ctx, m, ruleY, W - m, ruleY, 0.12);
  const y = m + safeTop;
  const id = spec.embed ?? "three-regimes";
  if (landscape) {
    // Text left, diagram right, a faint rule between, as the social card had.
    rule(ctx, W / 2, y, W / 2, ruleY - m / 2, 0.1);
    embed(ctx, id, { x: W / 2 + m / 2, y, w: W / 2 - 1.5 * m, h: ruleY - m / 2 - y }, u, assets);
    drawHeadline(ctx, headlineOnly(spec), assets, { x: m, y, w: W / 2 - 1.5 * m, h: ruleY - m - y }, onPaper, u, { maxSize: 96, titleShare: 0.8 });
  } else {
    // Diagram above, headline below.
    const eh = (ruleY - y) * 0.45;
    embed(ctx, id, { x: m, y, w: W - 2 * m, h: eh }, u, assets);
    const hy = y + eh + m;
    drawHeadline(ctx, headlineOnly(spec), assets, { x: m, y: hy, w: W - 2 * m, h: ruleY - m - hy }, onPaper, u, { maxSize: 110, titleShare: 0.85 });
  }
};

const abstract: Template = (ctx, spec, _phase, assets) => {
  const k = metrics(spec);
  const { W, H, u, m, landscape, safeTop } = k;
  sweep(ctx, 0, 0, W, H);
  drawTimePrint(ctx, spec);
  // The footer sits on the light end of the sweep (sand to dusk), so it is ink.
  footer(ctx, spec, assets, k, INK, INK);
  const y = m + safeTop;
  const ink: Ink = { text: PAPER, accent: PAPER, halo: clear, onLight: false, plate: INK };
  drawHeadline(ctx, headlineOnly(spec), assets, { x: m, y, w: (W - 2 * m) * (landscape ? 0.75 : 1), h: H * SWEEP_DARK * 0.92 - y }, ink, u, {
    maxSize: landscape ? 112 : 130,
    titleShare: 0.9,
  });
};

export const notes: Record<NoteId, Template> = {
  "note-typographic": typographic,
  "note-diagram": diagram,
  "note-abstract": abstract,
};

/** What the image shows, for the alt text. */
export function noteImage(spec: CardSpec): string {
  if (spec.template === "note-abstract") return "On a navy-to-dusk gradient.";
  if (spec.template !== "note-diagram") return "";
  const id = spec.embed ?? "three-regimes";
  return id === "three-regimes"
    ? "Beside the Three Regimes mark: Frontier and Fortress joining above Field."
    : id === "option-field"
      ? "Beside an option field: scanlines whose weight varies across the card. Generated and expressive; it encodes no data."
      : "Beside a territory treemap of Field, Frontier, Fortress, Optionality, Transition and Emergence, sized by weight.";
}
