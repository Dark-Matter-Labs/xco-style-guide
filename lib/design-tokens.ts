// Single source of truth for all xCO design tokens.
// CSS equivalents live in app/globals.css @theme — keep in sync manually.
// These constants are consumed by: diagram-primitives (SVG), export API,
// and prompt templates. Tailwind utilities are derived from globals.css.

// ── Colour ──────────────────────────────────────────────────────────

export const colors = {
  paper: {
    hex: "#FFFFFF",
    cssVar: "--color-xco-paper",
    twClass: "xco-paper",
    usage: "Default page background. Never pure white.",
  },
  ink: {
    hex: "#1C1B17",
    cssVar: "--color-xco-ink",
    twClass: "xco-ink",
    usage: "Body text, structural lines. Never #000.",
  },
  inkMuted: {
    hex: "#1C1B17",
    cssVar: "--color-xco-ink-muted",
    twClass: "xco-ink-muted",
    usage: "Alias for ink. No greys in the system.",
  },
  rule: {
    hex: "#1C1B17",
    opacity: 0.12,
    // Not a standalone colour — always ink at 12% opacity.
    // Use: rgba(28,27,23,0.12) or Tailwind border-xco-ink/[0.12]
    usage: "Rules, dividers, grid lines. Never a separate hue.",
  },
  // ── Extended diagram palette ─────────────────────────────────────
  // Five-color system for blueprint / warmth diagram modes.
  // Never use all five at once — pick a register (cool or warm).
  navy:  { hex: "#000064", cssVar: "--color-xco-navy",  twClass: "xco-navy",  usage: "Blueprint dark ground. Deep structural register." },
  ocean: { hex: "#005096", cssVar: "--color-xco-ocean", twClass: "xco-ocean", usage: "Structural blue — nav accent, systemic diagram elements." },
  teal:  { hex: "#0082aa", cssVar: "--color-xco-teal",  twClass: "xco-teal",  usage: "Open register — frontier, coastal, lighter blue." },
  sand:  { hex: "#ffa064", cssVar: "--color-xco-sand",  twClass: "xco-sand",  usage: "Warm field register — terrestrial, amber light." },
  dusk:  { hex: "#ff5a00", cssVar: "--color-xco-dusk",  twClass: "xco-dusk",  usage: "Warm convergence — orange-ember, the meeting point." },
} as const;

export type ColorName = keyof typeof colors;

// ── Typography ───────────────────────────────────────────────────────

export const typography = {
  faces: {
    display: {
      family: "Untitled Serif",
      cssVar: "--font-display",
      twClass: "font-display",
      weights: ["400 (regular)", "400i (italic)"],
      usage: "Headings. Serif — the weight of the idea.",
    },
    body: {
      family: "Untitled Sans",
      cssVar: "--font-body",
      twClass: "font-body",
      weights: ["400 (regular)"],
      usage: "All running text. Sans — clarity, no decoration.",
    },
    ui: {
      family: "Untitled Sans",
      cssVar: "--font-ui",
      twClass: "font-ui",
      weights: ["400 (regular)", "500 (medium)"],
      usage: "Alias for body. Navigation, labels, structural scaffolding.",
    },
    mono: {
      family: "DM Mono",
      cssVar: "--font-mono",
      twClass: "font-mono",
      weights: ["500 (medium)"],
      usage:
        "Small text. Numbers, code, annotations — showing the working. Always medium weight.",
    },
  },

  // Type scale — four levels + small label.
  // Serif face (Untitled Serif) for logo + heading.
  // Sans face (Untitled Sans) for heading2 + body.
  // Mono face (DM Mono) for labels, annotations, code.
  scale: [
    {
      name: "logo",
      label: "Logo",
      size: "100px",
      lineHeight: "90px",
      measure: "20ch",
      face: "display" as const,
      tailwind: "font-display text-[100px] leading-[90px]",
    },
    {
      name: "heading",
      label: "Heading",
      size: "60px",
      lineHeight: "60px",
      measure: "40ch",
      face: "display" as const,
      tailwind: "font-display text-[60px] leading-[60px]",
    },
    {
      name: "heading2",
      label: "Heading 2",
      size: "36px",
      lineHeight: "40px",
      measure: "55ch",
      face: "body" as const,
      tailwind: "font-body text-[36px] leading-[40px]",
    },
    {
      name: "body",
      label: "Body",
      size: "24px",
      lineHeight: "26px",
      measure: "68ch",
      face: "body" as const,
      tailwind: "font-body text-[24px] leading-[26px]",
    },
    {
      name: "small",
      label: "Small",
      size: "0.9375rem",
      lineHeight: "1.6",
      measure: "70ch",
      face: "mono" as const,
      tailwind: "font-mono font-medium text-[0.9375rem] leading-[1.6]",
    },
  ],
} as const;

export type TypeFace = keyof typeof typography.faces;
export type ScaleStep = (typeof typography.scale)[number];

// ── Spacing ──────────────────────────────────────────────────────────

export const spacing = {
  gutter: "1.5rem",       // --xco-gutter
  columns: {
    document: 12,          // 12-col for pages/site
    diagram: 24,           // 24-col for diagram layout
  },
} as const;

// ── Diagram primitives ───────────────────────────────────────────────
//
// Two-weight system (Martin Perrow / In Studio):
//   structural — borders, connectors, axis rules, primary data lines
//   texture    — hatching, grid, leaders, secondary annotation
//
// All diagram types must use only these two weights.
// Scale by format: hero/square use 1×, mark uses 0.5×.

export const diagram = {
  lineWeights: {
    structural: 1.5,  // Box borders, connectors, primary lines
    texture:    0.75, // Hatching, grid rules, leader lines
  },

  nodeTypes: {
    risk: {
      label: "Risk Node",
      fill: colors.dusk.hex,
      stroke: colors.ink.hex,
      strokeWidth: 1.5,
      textColor: colors.paper.hex,
      border: "solid",
      usage: "The thing that triggers the response.",
    },
    option: {
      label: "Option Node",
      fill: colors.paper.hex,
      stroke: colors.ink.hex,
      strokeWidth: 1.5,
      textColor: colors.ink.hex,
      border: "solid",
      usage: "The response. Default node type.",
    },
    field: {
      label: "Field Node",
      fill: colors.paper.hex,
      stroke: colors.ocean.hex,
      strokeWidth: 1.5,
      textColor: colors.ink.hex,
      border: "dashed",
      usage: "Systemic precondition. Foundational layer.",
    },
  },
} as const;

export type NodeType = keyof typeof diagram.nodeTypes;

// ── Tone registers ───────────────────────────────────────────────────

export const toneRegisters = ["method", "hunch", "annotation"] as const;
export type ToneRegister = (typeof toneRegisters)[number];

// ── Banned words (linter) ────────────────────────────────────────────

export const bannedWords = [
  "transformative",
  "unprecedented",
  "regenerative",
  "holistic",
  "paradigm",
  "ecosystem",
  "unlock",
  "leverage",
  "empower",
  "journey",
  " space ",  // "in this space" — the idiom, not the character
] as const;

// ── Spelling corrections — US English (linter) ───────────────────────
// xCO writes in US English. Flag British spellings and show corrections.

export const spellingCorrections = [
  { british: "civilisation",    american: "civilization" },
  { british: "civilisational",  american: "civilizational" },
  { british: "organise",        american: "organize" },
  { british: "organised",       american: "organized" },
  { british: "organising",      american: "organizing" },
  { british: "organisation",    american: "organization" },
  { british: "organisations",   american: "organizations" },
  { british: "analyse",         american: "analyze" },
  { british: "analysed",        american: "analyzed" },
  { british: "analysing",       american: "analyzing" },
  { british: "recognise",       american: "recognize" },
  { british: "recognised",      american: "recognized" },
  { british: "recognising",     american: "recognizing" },
  { british: "realise",         american: "realize" },
  { british: "realised",        american: "realized" },
  { british: "realising",       american: "realizing" },
  { british: "optimise",        american: "optimize" },
  { british: "optimised",       american: "optimized" },
  { british: "maximise",        american: "maximize" },
  { british: "minimise",        american: "minimize" },
  { british: "behaviour",       american: "behavior" },
  { british: "behaviours",      american: "behaviors" },
  { british: "honour",          american: "honor" },
  { british: "labour",          american: "labor" },
  { british: "colour",          american: "color" },
  { british: "colours",         american: "colors" },
  { british: "centre",          american: "center" },
  { british: "centres",         american: "centers" },
] as const;

export type SpellingCorrection = (typeof spellingCorrections)[number];

// ── Aggregate export ─────────────────────────────────────────────────

export const tokens = {
  colors,
  typography,
  spacing,
  diagram,
  toneRegisters,
  bannedWords,
  spellingCorrections,
} as const;

export type Tokens = typeof tokens;
