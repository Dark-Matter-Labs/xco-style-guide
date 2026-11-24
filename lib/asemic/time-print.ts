// The time print: a faint asemic sheet at the back of an instrument's artwork,
// grown from the artwork's own words and seeded by the minute it was made. The
// marks encode nothing, so the minute is also printed in words (the stamp); the
// stamp is the seed, so the print can be made again from what is printed on it.
// Spec: docs/superpowers/specs/2026-11-24-time-print-design.md

import { DENSITY, DUSK, writeSheet, type Sheet } from "./script";
import { SOURCES } from "./sources";

export const TIME_PRINT_OPACITY = 0.06;

/** The checkbox hint every instrument shows, word for word. */
export const TIME_PRINT_HINT = "A faint asemic print of this minute at the back, with the time along one edge. Decorative; it proves nothing.";

export interface Minute {
  /** `2026-11-24T15:52+01:00`, what writeSheet is seeded with. */
  seed: string;
  /** `2026-11-24 15:52 +01:00`, what the slug prints. */
  stamp: string;
}

export interface TimePrintProp { minute: Minute; words: string }

export interface TimePrintInput {
  words: string;
  minute: Minute;
  width: number;
  height: number;
  /** The artwork's own text colour on this ground. */
  ink: string;
  /** The ground colour for knock-outs; null on a gradient ground. */
  ground: string | null;
}

export interface TimePrint {
  sheet: Sheet;
  /** The marks as SVG, without a wrapping group. */
  body: string;
  stamp: string;
  label: string;
  source: "artwork" | "identity";
  ink: string;
  ground: string | null;
}

const p2 = (n: number) => String(n).padStart(2, "0");

/** The maker's minute, in their local time unless an offset (minutes east of UTC) is given. */
export function minuteOf(d: Date, offsetMinutes: number = -d.getTimezoneOffset()): Minute {
  const t = new Date(d.getTime() + offsetMinutes * 60000);
  const date = `${t.getUTCFullYear()}-${p2(t.getUTCMonth() + 1)}-${p2(t.getUTCDate())}`;
  const time = `${p2(t.getUTCHours())}:${p2(t.getUTCMinutes())}`;
  const o = Math.abs(offsetMinutes);
  const off = `${offsetMinutes < 0 ? "-" : "+"}${p2(Math.floor(o / 60))}:${p2(o % 60)}`;
  return { seed: `${date}T${time}${off}`, stamp: `${date} ${time} ${off}` };
}

export const msToNextMinute = (nowMs: number) => 60000 - (nowMs % 60000);

/** The sentence an artwork's accessible label ends with. */
export const labelOf = (minute: Minute) => `Time print, ${minute.stamp}.`;

// Constructor: this repo's TypeScript target does not allow the u flag in literals.
const LETTER = new RegExp("\\p{L}", "u");
const IDENTITY = SOURCES.find((s) => s.id === "identity")!.text;

const n = (v: number) => +v.toFixed(2);

/**
 * The marks as a handful of compound paths, in the same order the sheet paints them: lines,
 * squares, then the beads' knock-outs and outlines, then the x. One element per mark meant
 * thousands of nodes in every hidden copy, and the browser restyled them all on each keystroke.
 * Every bead shape winds clockwise, so overlapping knock-outs fill solid under the default rule.
 */
function compactBody(sheet: Sheet, fg: string, bg: string | null): string {
  const U = sheet.unit;
  const a = (50 * Math.PI) / 180;
  const dotted: string[] = [], solid: string[] = [], dashes: string[] = [], squares: string[] = [];
  const knock: string[] = [], boxes: string[] = [], rings: string[] = [], xs: string[] = [];
  for (const m of sheet.marks) {
    switch (m.kind) {
      case "thread":
        (m.dotted ? dotted : solid).push(`M${n(m.x1)} ${n(m.y)}H${n(m.x2)}`);
        break;
      case "dash":
        dashes.push(`M${n(m.x)} ${n(m.y)}h${n(m.w)}`);
        break;
      case "square":
        squares.push(`M${n(m.x - m.size / 2)} ${n(m.y - m.size / 2)}h${n(m.size)}v${n(m.size)}h${n(-m.size)}z`);
        break;
      case "box": {
        const d = `M${n(m.x - m.w / 2)} ${n(m.y - m.h / 2)}h${n(m.w)}v${n(m.h)}h${n(-m.w)}z`;
        knock.push(d);
        boxes.push(d);
        break;
      }
      case "ring": {
        // The C opens 100° to the right: from +50° round the left to -50°.
        const px = n(m.x + m.r * Math.cos(a)), dy = m.r * Math.sin(a);
        const d = m.open
          ? `M${px} ${n(m.y + dy)}A${n(m.r)} ${n(m.r)} 0 1 1 ${px} ${n(m.y - dy)}`
          : `M${n(m.x - m.r)} ${n(m.y)}a${n(m.r)} ${n(m.r)} 0 1 1 ${n(2 * m.r)} 0a${n(m.r)} ${n(m.r)} 0 1 1 ${n(-2 * m.r)} 0z`;
        knock.push(d);
        rings.push(d);
        break;
      }
      case "x": {
        const kh = (m.k * 62) / 56;
        xs.push(`M${n(m.x - m.k)} ${n(m.y - kh)}L${n(m.x + m.k)} ${n(m.y + kh)}`, `M${n(m.x + m.k)} ${n(m.y - kh)}L${n(m.x - m.k)} ${n(m.y + kh)}`);
        break;
      }
    }
  }
  const stroke = (d: string[], colour: string, width: number, extra = "") =>
    d.length ? `<path stroke="${colour}" stroke-width="${n(width)}"${extra} d="${d.join("")}"/>` : "";
  const fill = (d: string[], colour: string) => (d.length ? `<path fill="${colour}" d="${d.join("")}"/>` : "");
  return (
    stroke(dotted, fg, U * 0.18, ` stroke-dasharray="${n(U * 0.35)} ${n(U * 0.55)}"`) +
    stroke(solid, fg, U * 0.2) +
    stroke(dashes, fg, U * 0.22) +
    fill(squares, fg) +
    (bg ? fill(knock, bg) : "") +
    stroke(boxes, fg, U * 0.25) +
    stroke(rings, fg, U * 0.3) +
    stroke(xs, DUSK, U * 0.3)
  );
}

export function makeTimePrint(i: TimePrintInput): TimePrint {
  const own = Array.from(i.words).filter((c) => LETTER.test(c)).length >= 12;
  const sheet = writeSheet(own ? i.words : IDENTITY, {
    width: i.width,
    height: i.height,
    margin: 0.04 * Math.min(i.width, i.height),
    rows: Math.min(30, Math.max(8, Math.round(i.height / 60))),
    seed: i.minute.seed,
    density: DENSITY.sparse,
  });
  return {
    sheet,
    body: compactBody(sheet, i.ink, i.ground),
    stamp: `time print · ${own ? "" : "identity note · "}${i.minute.stamp}`,
    label: labelOf(i.minute),
    source: own ? "artwork" : "identity",
    ink: i.ink,
    ground: i.ground,
  };
}

/** The slug's type size: the artwork's smallest label, never more than a third of its margin. */
export const slugSize = (smallestLabel: number, margin: number) => Math.min(smallestLabel, margin / 3);

/** The PNG route sets SVG text in DM Mono, about 0.6 em a character: the widest face a slug meets. */
export const PNG_EM = 0.6;

/**
 * A slug hung from `top` on a gradient that is dark at the top and light below: as large as
 * `size`, but small enough that it ends by `limit` (where paper type stops reading) in any face.
 */
export const hungSlugSize = (size: number, stamp: string, top: number, limit: number) =>
  Math.min(size, (limit - top) / (PNG_EM * Array.from(stamp).length));

export type Ctx2D = Pick<
  CanvasRenderingContext2D,
  "fillStyle" | "strokeStyle" | "lineWidth" | "setLineDash" | "beginPath" | "moveTo" | "lineTo" | "arc" | "rect" | "fill" | "stroke"
>;

/** The same geometry as marksBody, on a canvas. Draw at full alpha; the caller fades the whole layer. */
export function paintMarks(ctx: Ctx2D, sheet: Sheet, fg: string, bg: string | null): void {
  const U = sheet.unit;
  const line = (width: number, colour: string, draw: () => void, dash: number[] = []) => {
    ctx.beginPath();
    draw();
    ctx.setLineDash(dash);
    ctx.lineWidth = width;
    ctx.strokeStyle = colour;
    ctx.stroke();
  };
  const bead = (shape: () => void, width: number) => {
    ctx.beginPath();
    shape();
    if (bg) {
      ctx.fillStyle = bg;
      ctx.fill();
    }
    ctx.setLineDash([]);
    ctx.lineWidth = width;
    ctx.strokeStyle = fg;
    ctx.stroke();
  };
  for (const m of sheet.marks) {
    switch (m.kind) {
      case "thread":
        line(U * (m.dotted ? 0.18 : 0.2), fg, () => { ctx.moveTo(m.x1, m.y); ctx.lineTo(m.x2, m.y); }, m.dotted ? [U * 0.35, U * 0.55] : []);
        break;
      case "square":
        ctx.beginPath();
        ctx.rect(m.x - m.size / 2, m.y - m.size / 2, m.size, m.size);
        ctx.fillStyle = fg;
        ctx.fill();
        break;
      case "dash":
        line(U * 0.22, fg, () => { ctx.moveTo(m.x, m.y); ctx.lineTo(m.x + m.w, m.y); });
        break;
      case "box":
        bead(() => ctx.rect(m.x - m.w / 2, m.y - m.h / 2, m.w, m.h), U * 0.25);
        break;
      case "ring": {
        // The logotype's C opens 100° to the right: the long way round from -50° to +50°.
        const a = (50 * Math.PI) / 180;
        bead(() => (m.open ? ctx.arc(m.x, m.y, m.r, -a, a, true) : ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2)), U * 0.3);
        break;
      }
      case "x": {
        const kh = (m.k * 62) / 56;
        line(U * 0.3, DUSK, () => {
          ctx.moveTo(m.x - m.k, m.y - kh);
          ctx.lineTo(m.x + m.k, m.y + kh);
          ctx.moveTo(m.x + m.k, m.y - kh);
          ctx.lineTo(m.x - m.k, m.y + kh);
        });
        break;
      }
    }
  }
}
