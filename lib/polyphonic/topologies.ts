// Explanatory topologies — five modules with typed imports and exports.
//
// From the xCO Polyphonic Communication Style Guide v5, §04A–§04C, §06.
// Semantic topology ≠ evidential topology ≠ inferential topology. A concept
// field shows what a proposition contains. An evidence mantle shows what bears
// upon it. A reasoning lineage shows what follows — and why.

export const topologies = [
  {
    id: "concept-field",
    code: "CF",
    name: "Concept Field",
    licence: "explanation",
    shows: "What a proposition contains",
    imports: "Canonical proposition and declared context",
    exports: "CF proposition ID, knot IDs, typed satellites and semantic joins",
    wide: "Sentence spine with soft semantic satellites",
    narrow: "Complete sentence, then satellites nested under each knot in sentence order",
    invariant: "Exact anchor, semantic role and relation phrase",
    route: "Sentence → knots → satellites → conditions → feedback",
  },
  {
    id: "evidence-mantle",
    code: "EM",
    name: "Evidence Mantle",
    licence: "explanation",
    shows: "What bears upon exact spans",
    imports: "Exact CF or source span ID",
    exports: "EM evidence-object IDs, function, method, limit, version and correction route",
    wide: "Source nucleus with indexed evidence objects",
    narrow: "Source first, then evidence capsules grouped beneath each exact span",
    invariant: "Exact wording, evidence function, method, limit and return to source",
    route: "Source → addressable span → evidence function → method + limit → source reread",
  },
  {
    id: "reasoning-lineage",
    code: "RL",
    name: "Reasoning Lineage",
    licence: "explanation",
    shows: "What follows from what",
    imports: "Named claim and EM object IDs",
    exports: "RL claim IDs, relation IDs, warrants, mechanisms, authority result and review trigger",
    wide: "Typed propositions joined by verb-labelled edges",
    narrow: "One proposition per step with the edge sentence between steps",
    invariant: "Evidence, warrant, mechanism, authority and countercondition remain distinct",
    route: "Evidence → inference → authority gate → decision → action → consequence → correction",
  },
  {
    id: "decision-surface",
    code: "DS",
    name: "Decision Surface",
    licence: "decision",
    shows: "What action is requested, and what follows",
    imports: "RL basis, evidence bundle and mandate version",
    exports: "DS decision-object ID, prior and resulting state, receipt, expiry and remedy",
    wide: "Bounded action, review and consequence field",
    narrow: "Action, refusal, consequence and remedy remain equally proximal",
    invariant: "No change of institutional meaning or choice parity",
    route: "Basis → prior state → requested action → resulting state → remedy",
  },
  {
    id: "review",
    code: "R",
    name: "Review",
    licence: "explanation",
    shows: "What the observed outcome revises",
    imports: "DS outcome and observed consequence",
    exports: "New EM objects, revised RL basis and continue, amend, pause, cease or remedy decision",
    wide: "Return edges from consequence into the evidence base",
    narrow: "Outcome, then each revision it triggers",
    invariant: "The trigger, reviewer and reopened decision stay named",
    route: "Outcome → observation → revised basis → decision",
  },
] as const;

export type Topology = (typeof topologies)[number];

// ── Concept field elements (§04A) ────────────────────────────────────
// Required function and the automatic release failure for each element.

export const conceptFieldElements = [
  {
    element: "Canonical proposition",
    required: "One complete grammatical claim whose conditions remain visible",
    failure: "A noun-chain replaces the sentence or the reader must guess its order",
  },
  {
    element: "Semantic knot",
    required: "An exact term that acts as a port into greater resolution",
    failure: "Highlighted nouns overpower the verbs that make the claim meaningful",
  },
  {
    element: "Typed satellite",
    required: "Actor, condition, practice, resource, limit, consequence or countercondition",
    failure: "The annotation has no exact anchor, type or relation phrase",
  },
  {
    element: "Soft curve",
    required: "Elaborates or belongs with the exact knot",
    failure: "It appears to assert evidence, sequence or causality",
  },
  {
    element: "Feedback edge",
    required: "A named return mechanism such as revises or reshapes",
    failure: "A decorative loop manufactures recursion",
  },
  {
    element: "Mobile transposition",
    required: "Sentence first; satellites nested beneath anchors in sentence order",
    failure: "Stacking detaches a satellite from its host or deletes a condition",
  },
] as const;

// ── Reasoning lineage steps (§04C) ───────────────────────────────────
// The worked seven-step chain. Every node carries one proposition; every edge
// states one defensible verb.

export const lineageSteps = [
  {
    id: "L1",
    node: "Evidence",
    proposition: "A pattern recurs under stated conditions.",
    detail: "Source, interval, measurement and uncertainty are recorded.",
    edgeOut: "I1 / supports under warrant W1",
    edgeCode: "I" as const,
  },
  {
    id: "L2",
    node: "Inference",
    proposition: "The recurrence is expected to continue.",
    detail: "The warrant, countercondition and competing explanation are explicit.",
    edgeOut: "G1 / enters authority gate",
    edgeCode: "G" as const,
  },
  {
    id: "L3",
    node: "Authority gate",
    proposition: "Expectation, value criterion, standing and mandate pass — or fail — a commitment gate.",
    detail: "No epistemic claim confers institutional authority by itself.",
    edgeOut: "G2 / authorises or refuses commitment",
    edgeCode: "G" as const,
  },
  {
    id: "L4",
    node: "Decision",
    proposition: "An authorised institution commits resources.",
    detail: "Authority, value judgment, threshold, duration and review are named.",
    edgeOut: "T1 / commits resources and initiates action",
    edgeCode: "T" as const,
  },
  {
    id: "L5",
    node: "Action",
    proposition: "The commitment changes material capacity.",
    detail: "Operating conditions, reversibility, cost and affected parties enter the account.",
    edgeOut: "M1 / produces outcomes under conditions",
    edgeCode: "M" as const,
  },
  {
    id: "L6",
    node: "Consequence",
    proposition: "Capability, liability and option space become path-dependent.",
    detail: "Future actors inherit assets, burdens and narrowed or expanded alternatives.",
    edgeOut: "R1 / returns through observation and review",
    edgeCode: "R" as const,
  },
  {
    id: "L7",
    node: "Correction",
    proposition: "Observed outcomes revise the evidence base.",
    detail: "Review may continue, amend, pause, cease or remedy the commitment.",
    edgeOut: null,
    edgeCode: null,
  },
] as const;

// The three tests a lineage edge must pass (§04C).
export const lineageTests = [
  {
    test: "Edge test",
    rule: "Read it as a sentence",
    detail: '"A supports B under W", "A increases B through M". If no precise verb fits, the relation is not ready.',
  },
  {
    test: "Warrant",
    rule: "Expose the bridge",
    detail: "An observation does not interpret itself. Name the rule, assumption or theory connecting it to the next claim.",
  },
  {
    test: "Authority gate",
    rule: "Knowledge cannot authorise itself",
    detail: "Expectation enters a decision with values, mandate, standing, resources and contestability.",
  },
] as const;

// ── Transposition (§06) ──────────────────────────────────────────────
// Responsive design is semantic transposition, not visual reduction.

export const transpositionInvariants = [
  "Canonical nucleus and complete accessible route",
  "Primary attractor and governing relation",
  "Any deliberately authored suspension and its resolution point",
  "Anchor–satellite or span–evidence addressability",
  "Register functions and subject positions",
  "Action, refusal and consequence parity",
  "No horizontal pan for core content",
] as const;

export const transpositionRecomposable = [
  "Column count and coordinates",
  "Amplitude of the left/right movement",
  "Which side carries a non-operative rail",
  "Opening silence and connector length",
  "Font scale within legibility limits",
  "Annotation placement and diagram orientation",
] as const;
