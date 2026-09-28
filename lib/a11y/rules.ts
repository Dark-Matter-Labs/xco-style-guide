// The accessibility rules of the system, and how each one is enforced.
//
// "gate" rules are checked on every build by npm run a11y — a violation fails
// the build, locally and on Vercel. "audit" rules are checked in a real
// browser by npm run a11y:audit (axe-core over every page, in both registers),
// which runs in CI on every pull request. "review" rules need a person: they
// are listed so the review has a checklist, not a memory.
//
// The accessibility page renders this list. Changing a rule means changing it
// here, where the page and the checks both read it.

export type Enforcement = "gate" | "audit" | "review";

export interface A11yRule {
  id: string;
  title: string;
  /** WCAG 2.2 success criteria, where one applies. */
  wcag: string[];
  rule: string;
  checks: { by: Enforcement; how: string }[];
}

export const TARGET_MIN_PX = 24;       // WCAG 2.5.8 (AA) — enforced
export const TARGET_COMFORT_PX = 44;   // the system's standard for primary controls

export const a11yRules: A11yRule[] = [
  {
    id: "text-contrast",
    title: "Text contrast",
    wcag: ["1.4.3"],
    rule: "Text clears 4.5:1 against what it sits on, in both registers; 3:1 only from 24px regular or 18.66px bold. Saturated accents — dusk, ocean, teal, the domain colours — are never text: their -ink forms are.",
    checks: [
      { by: "gate", how: "Every sanctioned pairing is measured in both registers from the shipped CSS." },
      { by: "gate", how: "Every text-xco-* utility in the source is measured on every text surface, including opacity modifiers and placeholder text." },
      { by: "gate", how: "Inline colour styles may not use a saturated domain colour." },
      { by: "audit", how: "axe color-contrast on every rendered page, both registers." },
    ],
  },
  {
    id: "non-text-contrast",
    title: "Non-text contrast",
    wcag: ["1.4.11"],
    rule: "Marks, input borders, focus rings and any graphic needed to understand the page clear 3:1 against their ground.",
    checks: [
      { by: "gate", how: "Domain and meaning colours on paper, field borders and the focus ring are sanctioned pairings." },
      { by: "gate", how: "Every group mark's glyph clears 3:1 on its ground." },
    ],
  },
  {
    id: "colour-alone",
    title: "Never colour alone",
    wcag: ["1.4.1"],
    rule: "Colour reinforces; something else carries. Semantic meanings pair every colour with a shape, group marks pair every ground with an aperture angle, links are underlined or otherwise distinct from body text.",
    checks: [
      { by: "gate", how: "The group-mark pair audit fails any two marks weak on both colour and angle." },
      { by: "audit", how: "axe link-in-text-block." },
      { by: "review", how: "A new diagram or status reads correctly in greyscale." },
    ],
  },
  {
    id: "focus-visible",
    title: "Focus is always visible",
    wcag: ["2.4.7", "2.4.11"],
    rule: "Every focusable element shows the system focus ring — 2px of full ink, offset 2px — when reached by keyboard. Components may restyle focus; they may not remove it.",
    checks: [
      { by: "gate", how: "outline-none fails unless the same class list gives a focus-visible outline or ring." },
      { by: "gate", how: "The focus ring token is a sanctioned 3:1 pairing on every surface." },
    ],
  },
  {
    id: "names",
    title: "Everything has a name",
    wcag: ["1.1.1", "4.1.2", "1.3.1"],
    rule: "Images have alt text; decorative ones have empty alt or aria-hidden. Every control has an accessible name — a visible label first, aria-label only for icon-only controls. SVG and canvas that carry meaning take role=\"img\" and a label.",
    checks: [
      { by: "audit", how: "axe image-alt, svg-img-alt, button-name, label, select-name, link-name, aria-*." },
    ],
  },
  {
    id: "structure",
    title: "Structure",
    wcag: ["1.3.1", "2.4.6", "3.1.1"],
    rule: "One h1 per page, headings in order, a main landmark, the page language set. The document outline reads as the page does.",
    checks: [
      { by: "audit", how: "axe page-has-heading-one, heading-order, landmark-one-main, html-has-lang, region." },
    ],
  },
  {
    id: "targets",
    title: "Targets",
    wcag: ["2.5.8"],
    rule: `Pointer targets are at least ${TARGET_MIN_PX}×${TARGET_MIN_PX}px, or spaced as if they were. Primary controls — buttons, toggles, the nav — are ${TARGET_COMFORT_PX}px high.`,
    checks: [
      { by: "audit", how: `axe target-size (${TARGET_MIN_PX}px).` },
      { by: "review", how: `Primary controls at ${TARGET_COMFORT_PX}px.` },
    ],
  },
  {
    id: "motion",
    title: "Motion",
    wcag: ["2.3.3", "2.2.2"],
    rule: "Motion respects prefers-reduced-motion. Anything that moves for more than five seconds can be paused. Animation never carries information that a still frame does not.",
    checks: [
      { by: "audit", how: "With reduced motion emulated, no CSS animation or transition runs on any page." },
      { by: "review", how: "Canvas animation (the event-series cards) starts paused under reduced motion and has a pause control." },
    ],
  },
  {
    id: "exports",
    title: "Exported assets",
    wcag: ["1.4.3", "1.1.1"],
    rule: "Text inside generated images meets the same contrast bars as the page, since it is read on phones at a fraction of its size. When an asset is posted, its text goes in the alt text or the post itself.",
    checks: [
      { by: "gate", how: "Every event-series palette's text pairings are measured." },
      { by: "review", how: "Alt text written when posting to Luma, LinkedIn or Instagram." },
    ],
  },
];
