// Generates the three exportable design token artifacts from lib/design-tokens.ts.
// Pure functions — no React, safe to call server or client side.

import { colors, typography, spacing, diagram, bannedWords } from "@/lib/design-tokens";

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

  return `# xCO Design System — Claude Code Reference

You are implementing the xCO visual language by Dark Matter Labs (Expanding Civilizational Optionality). Apply these exact tokens and rules to every UI decision. Do not introduce any colours, fonts, or radius values outside this system.

## Colour palette

Eight tokens only. Never use arbitrary hex codes or add new colours.

| CSS Variable | Hex | Tailwind class | Usage |
|---|---|---|---|
${colorRows}

Rules and dividers: \`rgba(32, 32, 30, 0.12)\` — ink at 12% opacity. In Tailwind: \`border-xco-ink/[0.12]\`.

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
- **Never** use pure black (\`#000\`) or pure white (\`#FFF\`) — use \`ink\` (#20201e) and \`paper\` (#f4f1e9) tokens.
- **Diagrams** use exactly two line weights: \`${diagram.lineWeights.structural}px\` structural, \`${diagram.lineWeights.texture}px\` texture.
- **No bold** on UI / Untitled Sans face. Use weight 400 or 500 only.
- Dark mode is a paper ↔ ink swap — all other colours remain fixed.

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
  --color-xco-paper:     #f4f1e9;
  --color-xco-ink:       #20201e;
  --color-xco-ink-muted: #514f4b;
  --color-xco-navy:      #000064;
  --color-xco-ocean:     #005096;
  --color-xco-teal:      #0082aa;
  --color-xco-sand:      #ffa064;
  --color-xco-dusk:      #ff5a00;

  /* Semantic meanings — always pair with shape */
  --meaning-continuity: #267b61; /* ● circle   */
  --meaning-system:     #50649f; /* ■ square   */
  --meaning-risk:       #a0567e; /* ▲ triangle */
  --meaning-agency:     #8e6713; /* ◆ diamond  */
  --meaning-contested:  #41376d; /* ⬡ hexagon  */
  --meaning-critical:   #60221e; /* ✕ cross    */
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
