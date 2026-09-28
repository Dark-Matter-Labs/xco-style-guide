// The static accessibility gate. Server / Node only.
//
// Pure functions that return findings; scripts/a11y-check.ts prints them and
// sets the exit code, and the accessibility page renders the pairing matrix
// from the same functions — so the page cannot show a pass the build fails.

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { contrastRatio, minimumFor, type ContrastUse } from "./contrast";
import { colorIn, registers, utilityColor, type Register } from "./css-tokens";
import { pairings, TEXT_SURFACES, type Pairing } from "./pairings";
import { colors, surfaceTokens, semanticMeanings, domainColors, paletteHex } from "@/lib/design-tokens";
import { groupMarks, groupColors, auditPairs, MARK_CONTRAST_MIN, type GroupMark } from "@/lib/group-marks";
import { palettes } from "@/app/(generators)/event-series/render/palettes";

export interface Finding {
  check: string;
  ok: boolean;
  label: string;
  detail: string;
  file?: string;
  line?: number;
}

// ── 1. Sanctioned pairings, both registers ───────────────────────────

export interface PairingResult {
  pairing: Pairing;
  register: Register;
  fg: string;
  bg: string;
  ratio: number;
  min: number;
  ok: boolean;
}

export function measurePairings(): PairingResult[] {
  const out: PairingResult[] = [];
  for (const pairing of pairings) {
    for (const register of registers) {
      if (pairing.only && pairing.only !== register) continue;
      const fg = colorIn(register, pairing.fg);
      const bg = colorIn(register, pairing.bg);
      // Translucent grounds (the WIP badge) are measured over the page paper.
      const ratio = contrastRatio(fg, bg, colorIn(register, "--xco-paper"));
      const min = minimumFor[pairing.use];
      out.push({ pairing, register, fg, bg, ratio, min, ok: ratio >= min });
    }
  }
  return out;
}

export function checkPairings(): Finding[] {
  return measurePairings().map((r) => ({
    check: "pairing",
    ok: r.ok,
    label: `${r.pairing.id} [${r.register}]`,
    detail: `${r.ratio.toFixed(2)}:1 (${r.pairing.use}, needs ${r.min}:1) — ${r.pairing.where}`,
  }));
}

// ── 2. The TypeScript token copy matches the CSS ─────────────────────

export function checkTokenDrift(): Finding[] {
  const entries: { name: string; hex: string; cssVar: string }[] = [
    ...Object.entries(colors)
      .filter(([, c]) => "cssVar" in c)
      .map(([name, c]) => ({ name: `colors.${name}`, hex: c.hex, cssVar: (c as { cssVar: string }).cssVar })),
    ...Object.entries(surfaceTokens).map(([name, s]) => ({ name: `surfaceTokens.${name}`, hex: s.hex, cssVar: s.cssVar })),
    ...semanticMeanings.map((m) => ({ name: `meaning.${m.name}`, hex: m.hex, cssVar: m.cssVar })),
    ...domainColors.map((d) => ({ name: `domain.${d.name}`, hex: d.hex, cssVar: d.cssVar })),
  ];
  return entries.map(({ name, hex, cssVar }) => {
    const css = colorIn("paper", cssVar).toLowerCase();
    return {
      check: "token-drift",
      ok: css === hex.toLowerCase(),
      label: name,
      detail: `design-tokens.ts ${hex} · globals.css ${cssVar} ${css}`,
    };
  });
}

// ── 3. The source: utilities and styles ──────────────────────────────

const SOURCE_DIRS = ["app", "components"];
const SOURCE_EXT = /\.(tsx|ts)$/;

/** Text utilities that are only ever set on an ink ground, and the pairing that covers them. */
const INVERSE_TEXT: Record<string, string> = {
  "xco-paper": "paper/ink",
  "xco-on-accent": "on-accent/ocean",
};

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (SOURCE_EXT.test(name)) out.push(p);
  }
  return out;
}

function sourceFiles(): string[] {
  return SOURCE_DIRS.flatMap((d) => walk(path.join(process.cwd(), d)));
}

function lineOf(text: string, index: number): number {
  return text.slice(0, index).split("\n").length;
}

/** "/40", "/[0.4]", "/[40%]" → 0.4 */
function opacityOf(mod?: string): number {
  if (!mod) return 1;
  const v = mod.replace(/^\/\[?|\]$/g, "");
  return v.endsWith("%") ? parseFloat(v) / 100 : parseFloat(v) > 1 ? parseFloat(v) / 100 : parseFloat(v);
}

function withOpacity(hex: string, a: number): string {
  if (a >= 1) return hex;
  const n = parseInt(hex.slice(1, 7), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/** The weakest ratio a text colour reaches across the text surfaces, both registers. */
function worstOnSurfaces(utility: string, opacity: number): { ratio: number; where: string } | null {
  let worst: { ratio: number; where: string } | null = null;
  for (const register of registers) {
    const c = utilityColor(register, utility);
    if (!c || !c.startsWith("#")) return null;
    for (const surface of TEXT_SURFACES) {
      const bg = colorIn(register, surface);
      const ratio = contrastRatio(withOpacity(c, opacity), bg, bg);
      if (!worst || ratio < worst.ratio) worst = { ratio, where: `${surface.slice(2)} [${register}]` };
    }
  }
  return worst;
}

const TEXT_TAGS = new Set(["p", "span", "b", "strong", "em", "i", "small", "label", "a", "li", "dt", "dd", "h1", "h2", "h3", "h4", "h5", "h6", "figcaption", "legend", "code"]);

const TEXT_UTILITY = /(?<![\w-])((?:[a-z-]+:)*)text-(xco-[a-z-]+)(\/\[?[\d.]+%?\]?)?(?![\w-])/g;
const CLASS_STRING = /(?:className|class|cls|input|label)\s*=\s*(?:\{?\s*)?(["'`])([\s\S]*?)\1/g;

export function scanSource(): Finding[] {
  const findings: Finding[] = [];
  const add = (f: Omit<Finding, "check" | "ok">, check: string) => findings.push({ ...f, check, ok: false });

  for (const file of sourceFiles()) {
    const text = readFileSync(file, "utf8");
    const rel = path.relative(process.cwd(), file);

    // Text colour utilities, measured.
    for (const m of Array.from(text.matchAll(TEXT_UTILITY))) {
      const [, variants, utility, mod] = m;
      if (INVERSE_TEXT[utility] && !mod) continue;
      const worst = worstOnSurfaces(utility, opacityOf(mod));
      if (!worst) continue; // not a colour utility (e.g. a size)
      const placeholder = variants.includes("placeholder:");
      const min = minimumFor.text;
      const label = `${variants}text-${utility}${mod ?? ""}`;
      const where = { file: rel, line: lineOf(text, m.index ?? 0) };
      if (worst.ratio < min) {
        add(
          {
            label,
            detail: `${worst.ratio.toFixed(2)}:1 on ${worst.where} — ${placeholder ? "placeholder text" : "text"} needs ${min}:1. Use an -ink token or ink-muted / ink-weak.`,
            ...where,
          },
          "text-utility",
        );
      } else {
        findings.push({ check: "text-utility", ok: true, label, detail: `worst ${worst.ratio.toFixed(2)}:1 on ${worst.where}`, ...where });
      }
    }

    // Placeholder faded by opacity can't be measured — and is always too faint.
    for (const m of Array.from(text.matchAll(/placeholder:opacity-\d+/g))) {
      add({ label: m[0], detail: "Placeholder text is text: use placeholder:text-xco-ink-weak.", file: rel, line: lineOf(text, m.index ?? 0) }, "text-utility");
    }

    // A saturated domain colour set as a text colour — directly or in a
    // ternary. A shape coloured through currentColor is non-text and is marked
    // "a11y: non-text" on the line above; those are measured as marks instead.
    const lines = text.split("\n");
    for (const m of Array.from(text.matchAll(/(?<![\w-])color:[^,;}\n]*var\(--(domain-[a-z]+|xco-(?:dusk|ocean|teal|sand|navy))\)/g))) {
      const line = lineOf(text, m.index ?? 0);
      if (/a11y: non-text/.test(`${lines[line - 2] ?? ""}${lines[line - 1]}`)) continue;
      const token = m[1];
      const fix = token.startsWith("domain-") ? `var(--${token.slice(7)}-ink)` : `var(--${token}-ink)`;
      add({ label: `color: var(--${token})`, detail: `A saturated accent fails as text. Use ${fix}.`, file: rel, line }, "domain-text");
    }

    // Text faded with opacity. Opacity multiplies contrast down with no token
    // to measure — ink at 60% on paper is 4.14:1. Disabled states are exempt
    // (WCAG 1.4.3); anything else uses ink-muted or ink-weak instead.
    for (const m of Array.from(text.matchAll(CLASS_STRING))) {
      const classes = m[2];
      const tag = text.slice(Math.max(0, (m.index ?? 0) - 200), m.index).match(/<([a-z][\w]*)\b[^<>]*$/)?.[1];
      const textElement = !!tag && TEXT_TAGS.has(tag);
      const textClasses = /(?<![\w-])(?:text-xco-|font-(?:mono|body|display|ui))/.test(classes);
      if (!textElement && !textClasses && !/group-hover:opacity/.test(classes)) continue;
      for (const o of Array.from(classes.matchAll(/(?<![\w-])((?:[a-z-]+:)*)opacity-(\d+)(?![\w-])/g))) {
        if (o[1].includes("disabled:") || Number(o[2]) >= 80) continue;
        add(
          { label: `${o[1]}opacity-${o[2]}`, detail: "Fades text below its measured contrast. Use text-xco-ink-muted / ink-weak (or opacity ≥ 80).", file: rel, line: lineOf(text, m.index ?? 0) },
          "faded-text",
        );
      }
    }

    // outline-none with nothing to replace it.
    for (const m of Array.from(text.matchAll(CLASS_STRING))) {
      const classes = m[2];
      if (!/(?<![\w-])(?:[a-z-]+:)*outline-none(?![\w-])/.test(classes)) continue;
      if (/focus-visible:(?:outline|ring)/.test(classes)) continue;
      add(
        { label: "outline-none", detail: "Removes the focus ring with no focus-visible outline or ring in its place.", file: rel, line: lineOf(text, m.index ?? 0) },
        "focus",
      );
    }
  }
  return findings;
}

// ── 4. Generated assets ──────────────────────────────────────────────

function measure(check: string, label: string, fg: string, bg: string, use: ContrastUse, where: string): Finding {
  const ratio = contrastRatio(fg, bg);
  const min = minimumFor[use];
  return { check, ok: ratio >= min, label, detail: `${ratio.toFixed(2)}:1 (${use}, needs ${min}:1) — ${where}` };
}

export function checkEventSeries(): Finding[] {
  return Object.values(palettes).flatMap((p) => [
    measure("event-series", `${p.id}: text on panel`, p.onPanel, p.panel, "text", "Title, details, lockup in the window / band"),
    measure("event-series", `${p.id}: kicker on panel`, p.accentOnPanel, p.panel, "text", "[KICKER] in the window"),
    measure("event-series", `${p.id}: text on ground`, p.onGround, p.ground, "text", "Title and details on the ground"),
    measure("event-series", `${p.id}: kicker on ground`, p.accentOnGround, p.ground, "text", "[KICKER] on the ground"),
  ]);
}

function markGround(m: GroupMark): string {
  return m.ground.kind === "token" ? paletteHex[m.ground.token] : groupColors[m.ground.color].hex;
}

export function checkGroupMarks(): Finding[] {
  const glyphs = groupMarks.flatMap((m) =>
    (["c", "x"] as const).map((part) => {
      const fg = paletteHex[m[part]];
      const ratio = contrastRatio(fg, markGround(m));
      return {
        check: "group-mark",
        ok: ratio >= MARK_CONTRAST_MIN,
        label: `${m.name}: ${part === "c" ? "C" : "x"}`,
        detail: `${ratio.toFixed(2)}:1 on its ground (non-text, needs ${MARK_CONTRAST_MIN}:1)`,
      };
    }),
  );
  const pairs = auditPairs(markGround)
    .filter((p) => p.failing)
    .map((p) => ({
      check: "group-mark",
      ok: false,
      label: `${p.a} vs ${p.b}`,
      detail: `weak on both channels — ${p.value.toFixed(2)}:1 apart, ${p.angle}° apart`,
    }));
  return [...glyphs, ...pairs];
}

// ── All of it ────────────────────────────────────────────────────────

export function runGate(): Finding[] {
  return [
    ...checkPairings(),
    ...checkTokenDrift(),
    ...scanSource(),
    ...checkEventSeries(),
    ...checkGroupMarks(),
  ];
}
