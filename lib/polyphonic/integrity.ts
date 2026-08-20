// Integrity — release conditions, ambiguity classes and anti-patterns.
//
// From the xCO Polyphonic Communication Style Guide v5, §07.
// Integrity is a release condition. Difficulty is licensed only when it reveals
// a relation easier prose would conceal. Accidental ambiguity is a defect;
// divergent consequence is a blocker.

// ── Ambiguity classes ────────────────────────────────────────────────
// A0–A3 are licensed under the right conditions. AX is always a reject.

export const ambiguityClasses = [
  {
    code: "A0",
    name: "Exact",
    rule: "One operational reading",
    detail: "Required for Decision; default for formal Explanation.",
    licensed: true,
  },
  {
    code: "A1",
    name: "Resonant",
    rule: "Primary meaning + compatible echoes",
    detail: "Useful when secondary readings deepen rather than contradict the proposition.",
    licensed: true,
  },
  {
    code: "A2",
    name: "Suspensive",
    rule: "Meaning resolves later",
    detail: "The delay must be bounded, intentional and rewarding on rereading.",
    licensed: true,
  },
  {
    code: "A3",
    name: "Contested",
    rule: "The issue itself remains unsettled",
    detail: "Name the alternatives, evidence and consequence of each interpretation.",
    licensed: true,
  },
  {
    code: "AX",
    name: "Divergent",
    rule: "Different commitments",
    detail: "Reject when plausible readings alter action, authority, rights, cost or remedy.",
    licensed: false,
  },
] as const;

export type AmbiguityClass = (typeof ambiguityClasses)[number];

// The two tests every release must pass (§07).
export const releaseTests = [
  {
    n: "01",
    name: "Accessible recoverability",
    detail:
      "Every essential claim, relation, instruction and consequence has a complete route independent of colour, typeface, motion, hover or spatial vision.",
  },
  {
    n: "02",
    name: "Defensible semantic surplus",
    detail:
      "The transformation adds a meaning that a reviewer can name, defend and relate to the claim. Difficulty alone does not qualify.",
  },
] as const;

// ── The eight release gates (§07) ────────────────────────────────────
// No gate is "not applicable" without a written rationale.
// Release order: licence → recovery + surplus → reader + power →
// relations + evidence + lineage → consent → responsive + access.

export const releaseGates = [
  {
    n: "01",
    name: "Licence + consequence",
    action: "Classify the act",
    detail: "Mark Encounter, Explanation or Decision and make each transition perceptible.",
    blocker: "Decision consequence hides inside encounter ambiguity.",
  },
  {
    n: "02",
    name: "Proposition + recovery",
    action: "Recover the claim and its surplus",
    detail: "Provide the canonical route, local operator ledger and notation status.",
    blocker: "Styling supplies an unsupported claim.",
  },
  {
    n: "03",
    name: "Reader + power",
    action: "Audit position, benefit and burden",
    detail: "Name speaker, addressee, authority, beneficiary, burden holder and affected non-reader.",
    blocker: "Viewer silently becomes consenter, or the actor disappears.",
  },
  {
    n: "04",
    name: "Relations + evidence + lineage",
    action: "Keep every jurisdiction inspectable",
    detail: "Type claims, joins, warrants, mechanisms, counterconditions and authority gates.",
    blocker: "Pertinence becomes proof, or styling bridges a logical gap.",
  },
  {
    n: "05",
    name: "Authority + remedy",
    action: "Protect agency at state change",
    detail: "Disclose basis, prior and resulting state, alternatives, receipt, expiry and remedy.",
    blocker: "One-way, bundled or preselected choice.",
  },
  {
    n: "06",
    name: "Responsive + accessible",
    action: "Preserve rhetorical invariants",
    detail: "Test narrow, wide, print, no-JS, keyboard, screen reader, zoom and reduced motion.",
    blocker: "A relation, refusal or consequence exists only in colour or position.",
  },
  {
    n: "07",
    name: "Ethics + harm",
    action: "Do not reproduce the harm",
    detail: "Review capture, coercion, exposure, stereotype, exclusion and repair.",
    blocker: "Rhetorical simulation creates material harm.",
  },
  {
    n: "08",
    name: "Registry + version",
    action: "Release a governed object",
    detail: "Record owner, evidence, mandate, effective date, expiry, deprecated readings and correction.",
    blocker: "Identity, provenance or current version disagrees.",
  },
] as const;

export type ReleaseGate = (typeof releaseGates)[number];

// ── Anti-pattern index (§07, Reference D) ────────────────────────────

export const antiPatterns = [
  { name: "Universal symbol dictionary", detail: "Assigning fixed meanings to code-like marks regardless of operand and context." },
  { name: "Aesthetic computationality", detail: "Borrowing system syntax to manufacture precision or authority." },
  { name: "Plain-language reduction", detail: "Calling form expendable when it carries enacted meaning." },
  { name: "Pronoun capture", detail: 'Using "we" or "you" to annex the reader or fabricate consent.' },
  { name: "Hidden agent", detail: "Using passivity to shift investigative burden onto the affected person." },
  { name: "Coercive CTA", detail: "Making assent prominent while refusal, consequence or remedy recedes." },
  { name: "Ornamental quantification", detail: "Using weights, arrows or equations without scale, mechanism or source." },
  { name: "Responsive flattening", detail: "Keeping words while deleting the path, suspension or action parity." },
  { name: "Evidence halo", detail: "Surrounding a claim with charts to manufacture authority without a declared function." },
  { name: "Corpus realism", detail: "Treating the circulation of language as real-world prevalence or truth." },
  { name: "Join slippage", detail: 'Allowing "bears upon" to become "supports" through proximity or styling.' },
  { name: "Centre-as-truth", detail: "Using spatial centrality to upgrade a source account into verified fact." },
  { name: "Missing-denominator theatre", detail: "Displaying a precise count without the population, corpus, baseline or scope." },
  { name: "Span laundering", detail: "Attaching evidence to a softened paraphrase instead of the exact claim examined." },
] as const;

export type AntiPattern = (typeof antiPatterns)[number];

// ── Chromatic discipline (§08) ───────────────────────────────────────
// Compositional proportion, stated as area roles rather than colour families.
// Signal derives force from scarcity.

export const compositionalProportion = [
  { pct: 70, role: "canvas", detail: "The reading ground." },
  { pct: 20, role: "structure", detail: "Readable structure and boundary." },
  { pct: 8, role: "trace", detail: "Analytic domain accents." },
  { pct: 2, role: "signal", detail: "The current operative event." },
] as const;

// The one-jurisdiction-per-channel rule (§08).
export const channelJurisdictions = [
  { channel: "Hue", carries: "Domain", never: "Epistemic status or sequence" },
  { channel: "Line syntax + label", carries: "Epistemic status", never: "Domain" },
  { channel: "Position + tone", carries: "Sequence", never: "Authority" },
  { channel: "Signal accent", carries: "The current operative hinge", never: "Default buttons or decoration" },
] as const;
