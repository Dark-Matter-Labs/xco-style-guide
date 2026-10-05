// Identity, registry and reusable production patterns (§11, §11B).
//
// From the xCO Polyphonic Communication Style Guide v8.1. Identity stays
// stable; meaning stays local. Every composition ships with a compact record
// of what its forms do, and the depth is built into the source: one semantic
// account, several authored compositions.
//
// The reusable CSS is generated from design-tokens.ts rather than copied from
// the guide, so the pattern a team copies always matches the shipped palette.

import { colors, paletteHex, highlightTokens, identityScales } from "@/lib/design-tokens";

export const identityIntro = {
  title: "Identity stays stable. Meaning stays local.",
  body: "The palette, proportions and editorial character create recognition. Operators, register functions and status meanings are declared per composition. Serif, italic, mono, colour and orientation are affordances — not semantic laws.",
} as const;

/** The four type affordances (§11), each with the misuse it must avoid. */
export const typeAffordances = [
  { face: "Editorial serif", role: "Proposition", question: "What is being claimed?", body: "Titles, questions, propositions and reflective synthesis. Its default affordance is discursive authority — not an inherent “human” meaning." },
  { face: "Sans", role: "Operation", question: "Who acts next?", body: "Instructions, interfaces, connective copy and explicit actions. It carries operational clarity, not neutrality." },
  { face: "Mono", role: "State + notation", question: "[ STATE / PROVISIONAL ]", body: "Identifiers, evidence status, local syntax and machine-readable states. Never to manufacture computational authority." },
  { face: "Italic", role: "Voice + stance", question: "Whose voice enters?", body: "Situated voice, quotation, reflection or performed difference. Not a generic visual mannerism for vulnerability or doubt." },
] as const;

/** The local semantic registry — what every composition records about itself. */
export const semanticRegistry = [
  { name: "Identity + scope", holds: "Composition ID, title, owner, audience, jurisdiction, context and active licence" },
  { name: "Reader + power", holds: "Speaker, addressee, represented subject, authority, beneficiary, burden and affected non-reader" },
  { name: "Canonical nucleus", holds: "Exact propositions, source utterances, shared question and distinct accounts, or requested state transition" },
  { name: "Local meaning", holds: "Operator, operand, semantic verb, formal or expressive status, primary reading and bounded resonance" },
  { name: "Module object graph", holds: "Imported and exported SRC, SA, CF, EM, RL, IF, PF, SS, PB, AT, MW, AN, DS and R addresses with exact targets, target versions and relation classes" },
  { name: "Evidence + decision basis", holds: "Method, scope, uncertainty, counterevidence, reasoning-lineage version, mandate and authorised actor" },
  { name: "Reader path + recovery", holds: "Entry, hinge, reveal and aftermath; linear equivalent; narrow-screen and non-visual invariants" },
  { name: "Action + remedy", holds: "Prior and resulting state, consequence, refusal, receipt, expiry, withdrawal, correction and appeal" },
  { name: "Generative purpose", holds: "Intended reader capability; why this form may help; observed benefit, burden and unexpected readings" },
  { name: "Situated polyphony", holds: "Each source, standing, interests, limits, exact account, shared question and unresolved disagreement" },
  { name: "Inquiry state", holds: "Commitments, scope, hunches, assumptions, dependency rules, competing pathways and revision triggers" },
  { name: "Media status", holds: "Observed, sourced, generated, reconstructed, expressive or modelled; transformations and material limits" },
  { name: "Governance lifecycle", holds: "Stewards, approvers, effective date, review, expiry, supersession, deprecated readings, correction route and influence provenance" },
  { name: "Annotation + response", holds: "Annotation ID, exact typed target and version, target quotation, voice and origin, role, source links, response state and recorded revision effect", added: "7.1" },
  { name: "Proof block + optionality", holds: "Stable block ID, adopted premises, defined degree, conditions, proposed state transition, lost options, new dependencies, affected actors, fallback and tests", added: "7.1" },
  { name: "Atlas + source trajectory", holds: "Route and account IDs, source status, interval, steps, waits, crossings, gaps, scope and correction route; declared spatial and temporal scale", added: "7.1" },
  { name: "Material world + construction language", holds: "Subject, field, recurring material vocabulary, expressive or measured status, references, transformations and accessible description", added: "7.1" },
] as const;

/** Reference D2 — implementation practices that preserve the grammar. */
export const implementationRequirements = [
  { layer: "HTML", practice: "Semantic headings, canonical propositions, labels, captions and relation transcripts", avoid: "DOM fragments that reproduce visual disorder for assistive technology" },
  { layer: "CSS", practice: "Fluid scale, authored breakpoints, visible focus, redundant status channels", avoid: "Absolute composition with no narrow-screen score" },
  { layer: "Interaction", practice: "Progressive enhancement, named state, keyboard parity, reduced motion", avoid: "Meaning available only after hover or animation" },
  { layer: "Data / claims", practice: "Source, status, assumptions, version, expiry and correction route", avoid: "Atmosphere presented as evidence" },
  { layer: "Decision state", practice: "Authority, choice parity, review, receipt, reversal and remedy", avoid: "Generic action labels or silent state change" },
] as const;

export const productionIntro = {
  title: "Build the depth into the source.",
  line: "One semantic account, several authored compositions.",
  body: "Begin with complete source language and a usable static sequence. Add spatial composition and reader-controlled depth as progressive enhancements. A reusable component keeps identity through a change of form: the exact span, block, route and relation stay stable across desktop, narrow screen, print and an accessible linear reading.",
  native: "Semantic sections, figures, captions, details and exact anchors can carry the complete guide. Essential content stays available without scripts.",
  machine: "Use machine support to check references, propagate declared conditions and compare versions. Keep the author's claims and choices attributable.",
} as const;

/** Production contract — complete before release. */
export const productionContract = [
  { object: "Source span", keep: "Stable ID, exact wording, source and version", verify: "Every evidence or semantic join resolves to the intended span" },
  { object: "Proof block", keep: "Typed premise, dependency, threshold, lost options, new burdens and test", verify: "Marginal and sequential readings preserve the same material conditions" },
  { object: "Atlas route", keep: "Account ID, source status, sequence, waits, crossings and gaps", verify: "Route identity survives overlap, route selection and narrow recomposition" },
  { object: "Image", keep: "Source or generated status, descriptive text and transformation record", verify: "Assets load offline; expressive traces cannot be read as measured data" },
  { object: "Interaction", keep: "Control label, changed object, resulting state and no-script reading", verify: "Keyboard operation, visible focus, announcement and repeatable return" },
  { object: "Typography & tokens", keep: "Fallback font stack, local role key and usable colour pairing", verify: "Legibility at narrow widths and zoom; colour has redundant labels" },
  { object: "Publication", keep: "Version, date, author or steward, review and correction route", verify: "Title, metadata, visible version and retained record agree" },
] as const;

// ── Reusable component: a ruled proof fragment ───────────────────────

export const proofFragmentHTML = `<article class="xco-proof" aria-labelledby="proof-title">
  <div class="xco-spine">
    <p class="xco-meta">PB-1 / authored proposition / version 1</p>
    <h2 id="proof-title">A capability requires continuing work.</h2>
    <section class="xco-band" id="condition-1">
      <h3>[Condition / unresolved]</h3>
      <p>The pathway depends on
        <mark class="xco-condition">staff, resources and maintenance</mark>.
      </p>
      <p>Grounds: specify the record, scope and known gaps.</p>
      <p>Test: what would show that this condition is unmet?</p>
    </section>
  </div>
  <aside class="xco-margin" aria-label="Question on condition 1">
    <p>Authored inquiry: who carries the recurring work?</p>
    <a href="#condition-1">Return to the exact condition</a>
  </aside>
</article>`;

const condition = highlightTokens.find((h) => h.id === "condition")!.hex;

/** The fragment's CSS, with colours from the shipped tokens. */
export function proofFragmentCSS(): string {
  return `:root {
  --xco-paper: ${colors.paper.hex};
  --xco-ink: ${colors.ink.hex};
  --xco-rule: ${identityScales.matter[500]};
  --xco-condition: ${condition}; /* Local role: operating condition. */
}
.xco-proof {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(10rem, 1fr);
  gap: clamp(1.5rem, 4vw, 4rem);
  padding: 2rem 0;
  color: var(--xco-ink);
  background: var(--xco-paper);
  border-block: 1px solid var(--xco-rule);
}
.xco-spine { min-width: 0; }
.xco-spine p { font: 1.2rem/1.65 Georgia, serif; max-width: 65ch; }
.xco-meta { font: .75rem/1.6 monospace !important; }
.xco-band { border-top: 1px solid var(--xco-rule); padding-top: 1rem; }
.xco-condition {
  padding: .04em .17em;
  color: ${identityScales.matter[900]};
  background: var(--xco-condition);
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}
.xco-margin { font: italic 1.1rem/1.5 Georgia, serif; }
.xco-margin a { display: inline-block; padding-block: .75rem; }
:focus-visible { outline: 3px solid ${paletteHex.ocean}; outline-offset: 4px; }
@media (max-width: 44rem) {
  .xco-proof { grid-template-columns: 1fr; }
  .xco-margin { border-top: 1px solid var(--xco-rule); }
}
@media print {
  .xco-proof { display: block; }
  .xco-band, .xco-margin { break-inside: avoid; }
  .xco-condition { print-color-adjust: exact; }
}`;
}

// ── Portable authored record (§11B) ──────────────────────────────────
// One source, one condition, one route step, one question — sharing scoped
// addresses so the page, atlas and argument can compose them differently.

export const addressConvention =
  "Use module:record/object for local objects and SRC:source for source records. A source span uses a zero-based, half-open UTF-16 interval and stores the exact quotation; check both against the stated source version before reuse.";

const H0 =
  "By the third heat alert, the neighbourhood retained two cool rooms, while three care routes were suspended and the contingency fund remained unreleased.";
const SPAN = "two cool rooms";

export const portableRecord = {
  pattern: "XCO guide / portable authored example",
  record_version: 3,
  guide_version: "8.1",
  status: "constructed teaching record / unresolved starting state",
  source: {
    id: "SRC:H0",
    version: "guide-8.1",
    status: "constructed record",
    text: H0,
    span: {
      id: "SRC:H0/cool-rooms",
      range: [H0.indexOf(SPAN), H0.indexOf(SPAN) + SPAN.length],
      unit: "UTF-16 code units / zero-based / end excluded",
      quote: SPAN,
    },
  },
  condition: {
    id: "IF:H-I/A2",
    version: "guide-8.1",
    text: "The specified residents can reach, enter and remain.",
    state: "unresolved",
  },
  route_step: {
    id: "AT:AT-H1/A3",
    version: "guide-8.1",
    account: "resident / hypothetical pathway",
    label: "Admission",
    sequence: 3,
  },
  annotation: {
    id: "AN:AT-H1/question-1",
    target: "IF:H-I/A2",
    target_version: "guide-8.1",
    target_quote: "The specified residents can reach, enter and remain.",
    voice: "XCO guide / authored design inquiry",
    origin: "authored for this specimen",
    role: "question",
    text: "Who cannot reach, enter or remain, and whose work closes the gap?",
    related_object: "AT:AT-H1/A3",
    response_state: "open",
    revision_effect: "None; opens an inquiry and leaves the model unchanged.",
  },
  relations: [
    { from: "SRC:H0/cool-rooms", to: "IF:H-I/A2", kind: "semantic", verb: "raises the situated-access question for" },
    { from: "AT:AT-H1/A3", to: "IF:H-I/A2", kind: "semantic", verb: "examines admission within" },
    { from: "AN:AT-H1/question-1", to: "IF:H-I/A2", kind: "contestation", verb: "asks who is missing from" },
  ],
  return: { task: "Record new accounts and findings; review the condition and shared question." },
  colour_contract: {
    id: "XCO-8.1",
    surface: `SIGNAL-500 ${identityScales.signal[500]}`,
    depth: `FIELD-700 ${identityScales.field[700]}`,
    reading_ground: `MATTER-50 ${identityScales.matter[50]}`,
    local_keys: ["expressive presence", "route identity", "exact phrase role", "domain trace"],
    epistemic_status: "Explicit label and line syntax; no hue alone",
  },
} as const;

export const revisionRule =
  "An annotation that proposes a change keeps its target version and response state; an adopted revision creates a new version and preserves the previous words.";
