// Relation jurisdictions — eight connector types, each exclusive.
//
// From the xCO Polyphonic Communication Style Guide v5, §04B.
// A connector has no universal meaning. Once a composition declares its
// relation contract, each visual jurisdiction becomes exclusive and stable
// throughout that work.
//
// `line` maps each jurisdiction to an SVG stroke pattern so the channel is
// carried by line syntax rather than colour — the same accessibility rule the
// semantic-meaning shapes follow in design-tokens.ts.

export const relationJurisdictions = [
  {
    code: "S",
    name: "Semantic elaboration",
    syntax: "Soft unarrowed leader + role label",
    means: "Elaborates or belongs with",
    never: "Evidence or causality",
    line: { dash: "none", arrow: false, weight: 0.75 },
  },
  {
    code: "E",
    name: "Evidence join",
    syntax: "Dotted indexed connector",
    means: "Bears on this exact span; function is named in the capsule",
    never: "Support, proof or consent by proximity",
    line: { dash: "1 3", arrow: false, weight: 1.5 },
  },
  {
    code: "I",
    name: "Inference",
    syntax: "Dashed directional edge + precise verb + warrant",
    means: "Follows from, under a named warrant",
    never: "Silently physical causality",
    line: { dash: "6 4", arrow: true, weight: 1.5 },
  },
  {
    code: "M",
    name: "Mechanism",
    syntax: "Solid directional edge + operating condition + countercondition",
    means: "Produces, through a stated mechanism",
    never: "Certainty exceeding the evidence",
    line: { dash: "none", arrow: true, weight: 1.5 },
  },
  {
    code: "G",
    name: "Authority gate",
    syntax: "Double gated edge naming mandate, standing, decision rule and actor",
    means: "Authorises or refuses",
    never: "An epistemic claim conferring authority on itself",
    line: { dash: "none", arrow: true, weight: 1.5, doubled: true },
  },
  {
    code: "T",
    name: "State transition",
    syntax: "Strong directional edge naming prior state, action, resulting state",
    means: "Changes state, with consequence, expiry and remedy",
    never: "A state change without a named resulting state",
    line: { dash: "none", arrow: true, weight: 2.5 },
  },
  {
    code: "Q",
    name: "Contestation",
    syntax: "Opposing or terminating edge",
    means: "Unless, limits, contests or counterevidence",
    never: "Being peripheral making it less material",
    line: { dash: "3 3", arrow: true, weight: 1.5, terminator: true },
  },
  {
    code: "R",
    name: "Review + correction",
    syntax: "Return edge naming trigger, reviewer and evidence update",
    means: "Returns through observation and review",
    never: "A decorative loop manufacturing recursion",
    line: { dash: "5 3", arrow: true, weight: 1.5, returns: true },
  },
] as const;

export type RelationJurisdiction = (typeof relationJurisdictions)[number];
export type RelationCode = RelationJurisdiction["code"];

// ── Epistemic function vocabulary (§04B) ─────────────────────────────
// Precise verbs for what an evidence object does. "Proves" is reserved for
// deduction — most documentary and empirical relations support, constrain or
// contest rather than prove.

export const epistemicFunctions = [
  { verb: "authenticates", detail: "Verifies the record contains the utterance — not that its account is accurate." },
  { verb: "identifies", detail: "Resolves a referent while leaving boundary and standing contestable." },
  { verb: "contextualises", detail: "Situates a term without measuring the condition it names." },
  { verb: "quantifies", detail: "Attaches a measure, with unit, denominator and window declared." },
  { verb: "corroborates", detail: "Independently bears out a status, without establishing common cause." },
  { verb: "supports", detail: "Raises the standing of a claim under a stated warrant." },
  { verb: "limits", detail: "Bounds the scope within which the claim holds." },
  { verb: "contests", detail: "Offers a competing account of the same span." },
  { verb: "cannot adjudicate", detail: "Bears on the span but is insufficient to settle it." },
] as const;

// The three logical distinctions that the mantle exists to preserve (§04B).
// These are logical statements, not an empirical model.
export const logicalDistinctions = [
  { formula: "record_contains(u) ⇏ content_of(u) is true", gloss: "A trace is not verification." },
  { formula: "mentions(x, corpus, t) ⇏ prevalence(x, population, t)", gloss: "Mentions track representation, not the world." },
  { formula: "evidence_object(e) pertains_to span(s) ⇏ e supports s", gloss: "Pertinence is not support." },
] as const;

// ── Evidence-object contract (§04B) ──────────────────────────────────
// Every satellite must say what it addresses, what epistemic work it performs,
// how it was produced, where it is limited and how it may be corrected.

export const evidenceContract = [
  { field: "Identity + target", detail: "Object ID, exact span ID, target wording and object type" },
  { field: "Epistemic function", detail: "Authenticates, identifies, contextualises, quantifies, supports, limits, contests or cannot adjudicate" },
  { field: "Provenance", detail: "Source, custodian, author or speaker and transcription status" },
  { field: "Scope + denominator", detail: "Time, place, population, corpus, unit, baseline and system boundary" },
  { field: "Method", detail: "Query, transformation, entity resolution, classification and normalisation" },
  { field: "Uncertainty + limitation", detail: "Missingness, error, competing account, causal limit and unknowns" },
  { field: "Inspection + counterevidence", detail: "Route to source, method, data and material contesting evidence" },
  { field: "Lifecycle + correction", detail: "Observed, reviewed and expiry dates; owner and challenge route" },
] as const;

// Additional disclosure required per evidence-object type (§04B, Reference B).
export const evidenceTypeDisclosures = [
  {
    type: "Quantitative measure",
    required: "Metric, unit, denominator, baseline, window, raw or normalised status",
    neverImply: "That precision creates relevance, adequacy or causality",
  },
  {
    type: "Corpus trace",
    required: "Corpus, query, deduplication, entity resolution, coverage and missingness",
    neverImply: "That mentions measure real-world incidence or truth",
  },
  {
    type: "Quotation / archive",
    required: "Voice, date, publication context, transcription and allegation or observation status",
    neverImply: "That the source's description has been verified",
  },
  {
    type: "Absence claim",
    required: "Record scope, completeness, recording rules and alternative repositories",
    neverImply: "That no matching entry means no event occurred",
  },
  {
    type: "Model output",
    required: "Inputs, assumptions, version, validation, range and expiry",
    neverImply: "That simulation is observation",
  },
  {
    type: "Counterevidence",
    required: "Same structural status, provenance and inspection route as supporting material",
    neverImply: "That being peripheral makes it less material",
  },
] as const;
