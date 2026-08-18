// Single source of truth for all xCO design tokens.
// CSS equivalents live in app/globals.css @theme — keep in sync manually.
// These constants are consumed by: diagram-primitives (SVG), export API,
// and prompt templates. Tailwind utilities are derived from globals.css.

// ── System version ───────────────────────────────────────────────────
// Single source of truth for the version badge shown on the home page
// footer and every system/generator page. Bump here only.

export const SYSTEM_VERSION = "v0.2" as const;

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

// ── Flat palette (hex only) ──────────────────────────────────────────
// For SVG attributes and canvas fills, which need literal hex rather than
// CSS variables so exported files stay self-contained.
//
// Import this instead of redeclaring hex constants locally. Diagram modules
// used to each hold their own `const PAPER = "#FFFFFF"` / `const INK =
// "#1C1B17"`; when the palette moved to warm paper those copies were missed,
// so every exported asset kept rendering on pure white with the old ink while
// the documentation showed the new system.

export const paletteHex = {
  paper:     colors.paper.hex,
  ink:       colors.ink.hex,
  inkMuted:  colors.inkMuted.hex,
  navy:      colors.navy.hex,
  ocean:     colors.ocean.hex,
  teal:      colors.teal.hex,
  sand:      colors.sand.hex,
  dusk:      colors.dusk.hex,
} as const;

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

// ── Domain tints ─────────────────────────────────────────────────────
// Low-opacity domain backgrounds for callouts, ports, and tags.
// Use on paper surfaces only — never as standalone fills.

export const domainTints = {
  bio:     { cssVar: "--bio-tint",     value: "rgba(213,108,83,0.08)",   usage: "Biological: warm coral at 8% — for callout backgrounds." },
  inst:    { cssVar: "--inst-tint",    value: "rgba(31,154,145,0.08)",   usage: "Institutional: teal at 8% — for callout backgrounds." },
  tech:    { cssVar: "--tech-tint",    value: "rgba(115,117,183,0.08)",  usage: "Technology: indigo at 8% — for callout backgrounds." },
  culture: { cssVar: "--culture-tint", value: "rgba(205,106,149,0.08)",  usage: "Culture: rose at 8% — for callout backgrounds." },
} as const;

// ── Fibonacci spacing scale ──────────────────────────────────────────
// φ-based steps: each multiplied by 1.618.
// Use for padding, gap, margin — never ad-hoc pixel values.

export const spacingScale = [
  { step: 1, px: 8,   cssVar: "--s1", usage: "Micro: icon padding, tight inline gaps." },
  { step: 2, px: 13,  cssVar: "--s2", usage: "Small: component padding, label gaps." },
  { step: 3, px: 21,  cssVar: "--s3", usage: "Base: standard component padding." },
  { step: 4, px: 34,  cssVar: "--s4", usage: "Medium: section padding, card gaps." },
  { step: 5, px: 55,  cssVar: "--s5", usage: "Large: section spacing." },
  { step: 6, px: 89,  cssVar: "--s6", usage: "XL: page section gaps." },
  { step: 7, px: 144, cssVar: "--s7", usage: "XXL: hero-scale spacing." },
] as const;

// ── Motion tokens ────────────────────────────────────────────────────

export const motionTokens = {
  fast: { ms: 120,  cssVar: "--t-fast", usage: "Micro-interactions: hover states, focus rings." },
  mid:  { ms: 240,  cssVar: "--t-mid",  usage: "Component transitions: callout reveal, tag fade." },
  slow: { ms: 400,  cssVar: "--t-slow", usage: "Page transitions, overlays." },
  ease: { value: "cubic-bezier(0.25,0,0.1,1)", cssVar: "--ease", usage: "Default easing — weighted deceleration." },
} as const;

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
  // The idiom, spelled out as a phrase. This was previously " space ", but the
  // linter trims each entry before matching, so it flagged every use of the
  // word — including "the space of reachable futures", which is xCO's own
  // core vocabulary. Phrases are matched whole.
  "in this space",
] as const;

// ── Spelling corrections — US English (linter) ───────────────────────
// xCO writes in US English. Flag British spellings and show corrections.

// Matching is whole-word, so every inflection needs its own entry — a base
// form cannot catch its own plural. "civilisations" was listed as an error in
// houseRules while being undetectable here, so the guide claimed enforcement
// it did not have.
//
// Deliberately absent: "analyses". It is also correct US English as the plural
// of "analysis", so flagging it would produce false positives on valid text.

export const spellingCorrections = [
  { british: "civilisation",    american: "civilization" },
  { british: "civilisations",   american: "civilizations" },
  { british: "civilisational",  american: "civilizational" },
  { british: "organise",        american: "organize" },
  { british: "organises",       american: "organizes" },
  { british: "organised",       american: "organized" },
  { british: "organising",      american: "organizing" },
  { british: "organisation",    american: "organization" },
  { british: "organisations",   american: "organizations" },
  { british: "organisational",  american: "organizational" },
  { british: "analyse",         american: "analyze" },
  { british: "analysed",        american: "analyzed" },
  { british: "analysing",       american: "analyzing" },
  { british: "recognise",       american: "recognize" },
  { british: "recognises",      american: "recognizes" },
  { british: "recognised",      american: "recognized" },
  { british: "recognising",     american: "recognizing" },
  { british: "realise",         american: "realize" },
  { british: "realises",        american: "realizes" },
  { british: "realised",        american: "realized" },
  { british: "realising",       american: "realizing" },
  { british: "optimise",        american: "optimize" },
  { british: "optimises",       american: "optimizes" },
  { british: "optimised",       american: "optimized" },
  { british: "optimising",      american: "optimizing" },
  { british: "maximise",        american: "maximize" },
  { british: "maximises",       american: "maximizes" },
  { british: "maximised",       american: "maximized" },
  { british: "maximising",      american: "maximizing" },
  { british: "minimise",        american: "minimize" },
  { british: "minimises",       american: "minimizes" },
  { british: "minimised",       american: "minimized" },
  { british: "minimising",      american: "minimizing" },
  { british: "behaviour",       american: "behavior" },
  { british: "behaviours",      american: "behaviors" },
  { british: "behavioural",     american: "behavioral" },
  { british: "honour",          american: "honor" },
  { british: "honours",         american: "honors" },
  { british: "labour",          american: "labor" },
  { british: "labours",         american: "labors" },
  { british: "colour",          american: "color" },
  { british: "colours",         american: "colors" },
  { british: "coloured",        american: "colored" },
  { british: "centre",          american: "center" },
  { british: "centres",         american: "centers" },
  { british: "centred",         american: "centered" },
] as const;

export type SpellingCorrection = (typeof spellingCorrections)[number];

// ── House rules (linter) ─────────────────────────────────────────────
// Non-negotiable rules that hold across every register and surface.
// These are hard errors, not stylistic preferences.

export const houseRules = [
  {
    id: "civilization-z",
    rule: "Always spell civilization with a z, never an s.",
    correct: "civilization, civilizational, civilizations",
    incorrect: "civilisation, civilisational, civilisations",
    why:
      "xCO writes in US English. The word appears in the project's own name — " +
      "an inconsistent spelling there undermines every other claim to precision.",
  },
  {
    id: "xco-casing",
    rule: "Always write xCO with a lowercase x and uppercase CO.",
    correct: "xCO",
    incorrect: "XCO, xco, Xco, XCo, xCo",
    why:
      "The casing is semantic, not decorative. The lowercase x is the expansion " +
      "operator; CO is Civilizational Optionality, the thing being expanded. " +
      "Flattening the case destroys the distinction the name is built on.",
  },
] as const;

export type HouseRule = (typeof houseRules)[number];

// Correct form of the brand name — the only accepted casing.
export const BRAND_NAME = "xCO" as const;

/**
 * Casing variants the linter flags. Matched case-sensitively as whole words,
 * so correct `xCO` never trips and unrelated words containing the letters
 * (e.g. "Mexico") are not candidates.
 */
export const brandCasingErrors = ["XCO", "xco", "Xco", "XCo", "xCo"] as const;

// ── Aggregate export ─────────────────────────────────────────────────

export const tokens = {
  colors,
  surfaceTokens,
  semanticMeanings,
  domainColors,
  domainTints,
  borderTokens,
  typography,
  spacing,
  spacingScale,
  motionTokens,
  diagram,
  toneRegisters,
  bannedWords,
  spellingCorrections,
  houseRules,
  brandCasingErrors,
} as const;

export type Tokens = typeof tokens;
