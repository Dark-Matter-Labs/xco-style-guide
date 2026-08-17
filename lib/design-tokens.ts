// Single source of truth for all xCO design tokens.
// CSS equivalents live in app/globals.css @theme — keep in sync manually.
// These constants are consumed by: diagram-primitives (SVG), export API,
// and prompt templates. Tailwind utilities are derived from globals.css.

// ── Colour ──────────────────────────────────────────────────────────

export const colors = {
  paper: {
    hex: "#f4f1e9",
    cssVar: "--color-xco-paper",
    twClass: "xco-paper",
    usage: "Default page background. Warm off-white — never pure white.",
  },
  ink: {
    hex: "#20201e",
    cssVar: "--color-xco-ink",
    twClass: "xco-ink",
    usage: "Body text, structural lines. Near-black — never #000.",
  },
  inkMuted: {
    hex: "#514f4b",
    cssVar: "--color-xco-ink-muted",
    twClass: "xco-ink-muted",
    usage: "Secondary text. Ink at reduced contrast (6.5:1 on paper).",
  },
  rule: {
    hex: "#20201e",
    opacity: 0.12,
    // Not a standalone colour — always ink at 12% opacity.
    // Use: rgba(32,32,30,0.12) or Tailwind border-xco-ink/[0.12]
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

// ── Surface tokens ───────────────────────────────────────────────────
// Four paper variants for depth/elevation on the warm ground.

export const surfaceTokens = {
  default:    { hex: "#f4f1e9", cssVar: "--xco-paper",            usage: "Primary page background." },
  raised:     { hex: "#fffffc", cssVar: "--xco-paper-raised",     usage: "Cards, popovers — slightly lighter." },
  quiet:      { hex: "#e9e5dc", cssVar: "--xco-paper-quiet",      usage: "Quiet backgrounds, recessed areas." },
  structural: { hex: "#d7d2c8", cssVar: "--xco-paper-structural", usage: "Borders, dividers, structural surfaces." },
} as const;

export type SurfaceToken = keyof typeof surfaceTokens;

// ── Semantic meanings ────────────────────────────────────────────────
// Six meanings, each with two channels: colour and shape.
// Colour is never the sole carrier — shape is the primary identifier.

export const semanticMeanings = [
  {
    name: "continuity",
    hex: "#267b61",
    cssVar: "--meaning-continuity",
    shape: "●",
    shapeLabel: "circle",
    usage: "Ongoing processes, maintenance, reproduction — what keeps going.",
  },
  {
    name: "system",
    hex: "#50649f",
    cssVar: "--meaning-system",
    shape: "■",
    shapeLabel: "square",
    usage: "Infrastructure, institutions, platforms — what structures action.",
  },
  {
    name: "risk",
    hex: "#a0567e",
    cssVar: "--meaning-risk",
    shape: "▲",
    shapeLabel: "triangle",
    usage: "Threats, instabilities, failure modes — what could break.",
  },
  {
    name: "agency",
    hex: "#8e6713",
    cssVar: "--meaning-agency",
    shape: "◆",
    shapeLabel: "diamond",
    usage: "Actor capacity, leverage points, decision power — who can act.",
  },
  {
    name: "contested",
    hex: "#41376d",
    cssVar: "--meaning-contested",
    shape: "⬡",
    shapeLabel: "hexagon",
    usage: "Disputed claims, competing narratives, unresolved tensions.",
  },
  {
    name: "critical",
    hex: "#60221e",
    cssVar: "--meaning-critical",
    shape: "✕",
    shapeLabel: "cross",
    usage: "Failures, urgent flags, decisions requiring immediate attention.",
  },
] as const;

export type SemanticMeaning = (typeof semanticMeanings)[number];

// ── Domain colours ───────────────────────────────────────────────────
// Orientational — these tag domains, not meanings.
// Never use domain colours as semantic signals.

export const domainColors = [
  { name: "bio",     hex: "#d56c53", cssVar: "--domain-bio",     usage: "Biological and ecological systems." },
  { name: "inst",    hex: "#1f9a91", cssVar: "--domain-inst",    usage: "Institutional and governance contexts." },
  { name: "tech",    hex: "#7375b7", cssVar: "--domain-tech",    usage: "Technology and infrastructure." },
  { name: "culture", hex: "#cd6a95", cssVar: "--domain-culture", usage: "Cultural and social systems." },
] as const;

export type DomainColor = (typeof domainColors)[number];

// ── Border tokens ────────────────────────────────────────────────────

export const borderTokens = {
  subtle:  "rgba(32, 32, 30, 0.08)",
  default: "rgba(32, 32, 30, 0.14)",
  strong:  "rgba(32, 32, 30, 0.28)",
  focus:   "#20201e",
} as const;

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

// ── Aggregate export ─────────────────────────────────────────────────

export const tokens = {
  colors,
  surfaceTokens,
  semanticMeanings,
  domainColors,
  borderTokens,
  typography,
  spacing,
  diagram,
  toneRegisters,
  bannedWords,
} as const;

export type Tokens = typeof tokens;
