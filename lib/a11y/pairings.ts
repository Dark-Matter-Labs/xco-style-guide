// Every colour pairing the system sanctions, and what it is for.
//
// A pairing names CSS tokens, not hex, so it is measured in both registers
// (paper and ink) from the values that ship. Its `use` sets the bar: text
// 4.5:1, large text and non-text 3:1. The contrast gate (npm run a11y) fails
// the build if any pairing falls short in either register; the accessibility
// page renders the same list, so what is documented is what is checked.
//
// Adding a colour to the system means adding its pairings here. A pairing
// that cannot pass is not listed as an exception — it is not a pairing.

import type { ContrastUse } from "./contrast";

export interface Pairing {
  id: string;
  fg: string;
  bg: string;
  use: ContrastUse;
  where: string;
  /** Registers this pairing exists in. Defaults to both. */
  only?: "paper" | "ink";
}

/** Surfaces text is set on. Structural paper is for rules and borders, never text. */
export const TEXT_SURFACES = ["--xco-paper", "--xco-paper-raised", "--xco-paper-quiet"] as const;

/** Text colours allowed on any text surface, in either register. */
export const TEXT_COLOURS = [
  { token: "--xco-ink", role: "Body text, headings, UI" },
  { token: "--xco-ink-muted", role: "Secondary text, labels, hints" },
  { token: "--xco-ink-weak", role: "Captions and annotations" },
  { token: "--xco-dusk-ink", role: "Accent text — the ink-safe dusk" },
  { token: "--xco-ocean-ink", role: "Structural accent text" },
  { token: "--xco-teal-ink", role: "Open-register accent text" },
] as const;

const onSurfaces: Pairing[] = TEXT_COLOURS.flatMap(({ token, role }) =>
  TEXT_SURFACES.map((surface) => ({
    id: `${token.slice(2)}/${surface.slice(2)}`,
    fg: token,
    bg: surface,
    use: "text" as const,
    where: role,
  })),
);

const domains = ["bio", "inst", "tech", "culture"] as const;

export const pairings: Pairing[] = [
  ...onSurfaces,

  // Inverse and accent grounds
  { id: "paper/ink", fg: "--xco-paper", bg: "--xco-ink", use: "text", where: "Inverse text — buttons, badges, the active register toggle" },
  { id: "on-accent/ocean", fg: "--color-xco-on-accent", bg: "--color-xco-ocean", use: "text", where: "Selected chips and toggles on ocean" },
  { id: "on-accent/navy", fg: "--color-xco-on-accent", bg: "--color-xco-navy", use: "text", where: "Text on the blueprint ground" },
  { id: "ink/dusk", fg: "--color-xco-ink-fixed", bg: "--color-xco-dusk", use: "text", where: "Text on a dusk ground — never paper" },
  { id: "wip-badge", fg: "--xco-dusk-ink", bg: "--wip-ground", use: "text", where: "The [v0.2] / [wip] badge" },

  // Domains: saturated colour is a stroke or fill; -ink is the only text form.
  ...domains.flatMap((d): Pairing[] => [
    { id: `${d}-ink/paper`, fg: `--${d}-ink`, bg: "--xco-paper", use: "text", where: `Kicker, stat and callout labels in the ${d} domain` },
    { id: `${d}-ink/raised`, fg: `--${d}-ink`, bg: "--xco-paper-raised", use: "text", where: `${d} labels on cards` },
    { id: `${d}-ink/tint`, fg: `--${d}-ink`, bg: `--${d}-tint`, use: "text", where: `The label of a ${d} callout, on its tint` },
    { id: `ink/${d}-pale`, fg: "--xco-ink", bg: `--${d}-pale`, use: "text", where: `Text on a ${d} ground` },
    { id: `${d}/paper`, fg: `--domain-${d}`, bg: "--xco-paper", use: "non-text", where: `${d} marks, rules and callout bars` },
  ]),

  // Semantic meanings are drawn in diagrams on paper, always with their shape.
  ...["continuity", "system", "risk", "agency", "contested", "critical"].map((m): Pairing => ({
    id: `meaning-${m}/paper`,
    fg: `--meaning-${m}`,
    bg: "--xco-paper",
    use: "non-text",
    where: `The ${m} marker in diagrams — paired with its shape`,
    only: "paper",
  })),

  // 8.1 exact-span highlights: every fill carries Matter 900 text (§11).
  ...["premise", "capability", "condition", "provisional", "transition"].map((h): Pairing => ({
    id: `hl-${h}`,
    fg: "--xco-matter-900",
    bg: `--xco-hl-${h}`,
    use: "text",
    where: `Exact-span highlight: ${h} — role named in the language too`,
  })),
  { id: "route-a/paper", fg: "--xco-route-a", bg: "--xco-paper", use: "non-text", where: "Route A line in an atlas", only: "paper" },
  { id: "route-b/paper", fg: "--xco-route-b", bg: "--xco-paper", use: "non-text", where: "Route B line in an atlas", only: "paper" },

  // Controls and focus
  { id: "field-border", fg: "--xco-ink", bg: "--xco-paper", use: "non-text", where: "Input and select borders (1.4.11)" },
  { id: "focus-ring", fg: "--focus-ring", bg: "--xco-paper", use: "non-text", where: "The focus outline on every surface (2.4.7, 2.4.11)" },
  { id: "focus-ring/raised", fg: "--focus-ring", bg: "--xco-paper-raised", use: "non-text", where: "Focus on cards" },

  // shadcn primitives, remapped to the palette
  { id: "shadcn-foreground", fg: "--foreground", bg: "--background", use: "text", where: "shadcn body" },
  { id: "shadcn-card", fg: "--card-foreground", bg: "--card", use: "text", where: "shadcn card" },
  { id: "shadcn-popover", fg: "--popover-foreground", bg: "--popover", use: "text", where: "shadcn popover" },
  { id: "shadcn-primary", fg: "--primary-foreground", bg: "--primary", use: "text", where: "shadcn primary button" },
  { id: "shadcn-secondary", fg: "--secondary-foreground", bg: "--secondary", use: "text", where: "shadcn secondary button" },
  { id: "shadcn-muted", fg: "--muted-foreground", bg: "--muted", use: "text", where: "shadcn muted text" },
  { id: "shadcn-accent", fg: "--accent-foreground", bg: "--accent", use: "text", where: "shadcn accent" },
];

/**
 * Colours that are knowingly not held to a ratio, and why. These are not
 * failures waved through: WCAG itself does not apply to them.
 */
export const exemptions = [
  { what: "The xCO logotype, including the dusk x", why: "WCAG 1.4.3 exempts text that is part of a logo or brand name." },
  { what: "--rule and the border tokens", why: "Decorative dividers. Nothing is lost if they are not seen; controls carry their own ink border." },
  { what: "Grain", why: "Texture, not information." },
  { what: "Disabled controls", why: "WCAG 1.4.3 exempts inactive components. They still read as disabled by shape, not colour alone." },
] as const;
