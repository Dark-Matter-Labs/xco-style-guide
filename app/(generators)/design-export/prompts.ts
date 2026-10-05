// Generates the three exportable design token artifacts from lib/design-tokens.ts.
// Pure functions — no React, safe to call server or client side.

import { colors, typography, spacing, diagram, bannedWords, semanticMeanings } from "@/lib/design-tokens";

// Ink as an rgb triple, for the rule colour (ink at 12%).
function rgbOf(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

// ── CLAUDE.md system prompt ─────────────────────────────────────────────────

export function buildClaudePrompt(): string {
  const colorRows = Object.entries(colors)
    .filter(([, v]) => "hex" in v)
    .map(([, v]) => {
      const c = v as { hex: string; cssVar?: string; usage: string };
      const cssVar = c.cssVar ?? "—";
      const tw = ("twClass" in v ? v.twClass : "—") as string;
      return `| \`${cssVar}\` | \`${c.hex}\` | \`${tw}\` | ${c.usage} |`;
    })
    .join("\n");

  const faceRows = Object.entries(typography.faces)
    .map(([, f]) => `| ${f.family} | \`${f.twClass}\` | ${f.usage} |`)
    .join("\n");

  const scaleRows = typography.scale
    .map((s) => `| ${s.label} | \`${s.size}\` | ${s.lineHeight} | ${s.face} |`)
    .join("\n");

  const banned = bannedWords.map((w) => `\`${w.trim()}\``).join(", ");

  const tokenLines = Object.values(colors)
    .filter((v): v is Extract<typeof v, { cssVar: string }> => "cssVar" in v)
    .map((c) => `  ${c.cssVar}:${" ".repeat(Math.max(1, 24 - c.cssVar.length))}${c.hex};`)
    .join("\n");

  const meaningLines = semanticMeanings
    .map((m) => `  ${m.cssVar}:${" ".repeat(Math.max(1, 22 - m.cssVar.length))}${m.hex}; /* ${m.shape} ${m.shapeLabel} */`)
    .join("\n");

  return `# xCO Design System — Claude Code Reference

You are implementing the xCO visual language by Dark Matter Labs (Expanding Civilizational Optionality). Apply these exact tokens and rules to every UI decision. Do not introduce any colours, fonts, or radius values outside this system.

## Colour palette

These tokens only, drawn from the xCO identity scales (Field, Signal, Matter). Never use arbitrary hex codes or add new colours.

| CSS Variable | Hex | Tailwind class | Usage |
|---|---|---|---|
${colorRows}

Rules and dividers: \`rgba(${rgbOf(colors.ink.hex)}, ${colors.rule.opacity})\` — ink at 12% opacity. In Tailwind: \`border-xco-ink/[0.12]\`.

## Typography

Four typefaces only. Do not introduce any other font families.

| Family | Tailwind class | Usage |
|---|---|---|
${faceRows}

## Type scale

| Step | Size | Line height | Face |
|---|---|---|---|
${scaleRows}

Body measure (max-width): 68ch for body text. Reduce for captions and mono.

## Visual principles

- **Corner radius**: near-zero (\`${spacing.gutter}\` gutter, \`0.125rem\` radius max). This is not a rounded-corner brand.
- **Borders**: always ink at 0.12 opacity, 1px. Never decorative; always structural.
- **Never** use pure black (\`#000\`) or pure white (\`#FFF\`) — use \`ink\` (${colors.ink.hex}) and \`paper\` (${colors.paper.hex}) tokens.
- **Diagrams** use exactly two line weights: \`${diagram.lineWeights.structural}px\` structural, \`${diagram.lineWeights.texture}px\` texture.
- **No bold** on UI / Untitled Sans face. Use weight 400 or 500 only.
- Dark mode is a paper ↔ ink swap — all other colours remain fixed.

## House rules (non-negotiable)

These apply to every string you write — UI copy, comments, alt text, commit messages.

- **Spell civilization with a z**, never an s: civilization, civilizational, civilizations. Never civilisation, civilisational, civilisations. xCO writes in US English.
- **Write the project name as \`xCO\`** — lowercase x, uppercase CO. Never XCO, xco, Xco, XCo, or xCo. The casing is semantic: the lowercase x is the expansion operator, CO is Civilizational Optionality, the thing being expanded.

## Three visual registers (diagram modes)

- **Blueprint** (cool): navy → ocean → teal gradient. Use for systemic / structural diagrams.
- **Warmth** (warm): sand → dusk. Use for field-level / terrestrial context.
- **Spectrum**: full warm-to-cold arc — sand, dusk, teal, ocean, navy. Use for comparative / ranked diagrams.

Never mix registers within a single diagram.

## Node types (diagram)

| Type | Fill | Border | Usage |
|---|---|---|---|
| Option | paper | ink solid | Default node — a response or choice. |
| Risk | dusk | ink solid | The trigger — what the portfolio responds to. |
| Field | paper | ocean dashed | Systemic precondition — foundational layer. |

## Banned words

Never write these in copy, UI labels, or documentation: ${banned}

Write with precision and restraint instead.

## CSS setup

Add this block to your \`globals.css\` or \`app/globals.css\`:

\`\`\`css
:root {
${tokenLines}

  /* Semantic meanings — always pair with shape */
${meaningLines}
}
\`\`\`

Then load fonts:
- Untitled Serif (licensed) — display + body; fallback: Crimson Pro (Google Fonts)
- Untitled Sans (licensed) — UI; fallback: Inter (Google Fonts)
- DM Mono — mono (Google Fonts)
`;
}

// ── CSS custom properties block ─────────────────────────────────────────────

export function buildCSSVariables(): string {
  const entries = Object.entries(colors)
    .filter(([, v]) => "hex" in v && "cssVar" in v)
    .map(([, v]) => {
      const c = v as { hex: string; cssVar: string };
      const pad = " ".repeat(Math.max(1, 30 - c.cssVar.length));
      return `  ${c.cssVar}:${pad}${c.hex};`;
    })
    .join("\n");

  return `:root {
  /* xCO colour tokens */
${entries}

  /* xCO spacing */
  --xco-gutter: ${spacing.gutter};

  /* xCO radius — near-zero, not a round-corner brand */
  --radius: 0.125rem;
}`;
}

// ── Tailwind v4 @theme block ────────────────────────────────────────────────

export function buildTailwindV4(): string {
  const colorEntries = Object.entries(colors)
    .filter(([, v]) => "hex" in v && "cssVar" in v && "twClass" in v)
    .map(([, v]) => {
      const c = v as { hex: string; cssVar: string; twClass: string };
      const key = `--color-${c.twClass}`;
      const pad = " ".repeat(Math.max(1, 30 - key.length));
      return `  ${key}:${pad}${c.hex};`;
    })
    .join("\n");

  return `/* Add inside @theme {} in globals.css */
@theme {
  /* xCO colour palette */
${colorEntries}

  /* Typography — Untitled fonts (licensed); system fallbacks shown */
  --font-display: "Untitled Serif", "Crimson Pro", Georgia, serif;
  --font-body:    "Untitled Serif", "Crimson Pro", Georgia, serif;
  --font-ui:      "Untitled Sans", "Inter", Arial, sans-serif;
  --font-mono:    var(--font-dm-mono), monospace;

  /* Spacing */
  --xco-gutter: ${spacing.gutter};

  /* Radius */
  --radius: 0.125rem;
}`;
}

// ── Tailwind v3 theme extension ─────────────────────────────────────────────

export function buildTailwindV3(): string {
  const colorEntries = Object.entries(colors)
    .filter(([, v]) => "hex" in v && "twClass" in v)
    .map(([, v]) => {
      const c = v as { hex: string; twClass: string };
      const key = `"${c.twClass}"`;
      const pad = " ".repeat(Math.max(1, 22 - key.length));
      return `      ${key}:${pad}"${c.hex}",`;
    })
    .join("\n");

  return `// tailwind.config.js — add inside theme.extend
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
${colorEntries}
      },
      fontFamily: {
        display: ["Untitled Serif", "Crimson Pro", "Georgia", "serif"],
        body:    ["Untitled Serif", "Crimson Pro", "Georgia", "serif"],
        ui:      ["Untitled Sans", "Inter", "Arial", "sans-serif"],
        mono:    ["DM Mono", "monospace"],
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        sm:      "0.0625rem",
        lg:      "0.1875rem",
      },
    },
  },
};`;
}
