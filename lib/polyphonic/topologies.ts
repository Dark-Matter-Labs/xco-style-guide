// Explanatory topologies — modules with typed imports and exports.
//
// From the xCO Polyphonic Communication Style Guide v8.1, §05A–§05D, §06–§06C,
// §08B, §09. 6.1 added Situated Accounts, the Inquiry Field, the Purpose Field
// and the Service Score beside v5's five. 7.1 joined four more to the
// import/export table: the Proof Block, the Situated Atlas, the Material World
// and the Annotation that can address any of them.
// Semantic topology ≠ evidential topology ≠ inferential topology. A concept
// field shows what a proposition contains. An evidence mantle shows what bears
// upon it. A reasoning lineage shows what follows — and why.

export const topologies = [
  {
    id: "situated-accounts",
    code: "SA",
    name: "Situated Accounts",
    licence: "explanation",
    shows: "How distinct accounts change one shared question",
    imports: "Exact source accounts, shared referent and declared scope",
    exports: "SA account IDs, sources, standing, limits, shared question and unresolved differences",
    wide: "Distinct accounts around a shared referent and inspectable framing",
    narrow: "Each exact account with source and limits; shared question follows",
    invariant: "Voice identities, meaning, disagreement and how the framing changed",
    route: null,
  },
  {
    id: "concept-field",
    code: "CF",
    name: "Concept Field",
    licence: "explanation",
    shows: "What a proposition contains",
    imports: "Exact proposition and declared context",
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
    id: "inquiry-field",
    code: "IF",
    name: "Inquiry Field",
    licence: "explanation",
    shows: "What assumptions leave open",
    imports: "Shared question, commitments, exact accounts, evidence and reasoning",
    exports: "IF assumption and hunch IDs, explicit dependencies, hypothetical branch status and revision triggers",
    wide: "Conditions beside dependent hypotheses and a separate authority condition",
    narrow: "Conditions followed by derived statements and their dependency sentences",
    invariant: "Source status, branch assumptions, model rules and independent authority",
    route: null,
  },
  {
    id: "decision-surface",
    code: "DS",
    name: "Decision Surface",
    licence: "decision",
    shows: "What action is requested, and what follows",
    imports: "RL or IF basis, evidence limits and verified mandate version",
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
    exports: "New EM objects, revised SA question or IF model, revised RL basis and a duly authorised continue, amend, pause, cease or remedy decision",
    wide: "Return edges from consequence into the evidence base",
    narrow: "Outcome, then each revision it triggers",
    invariant: "The trigger, reviewer and reopened decision stay named",
    route: "Outcome → observation → revised basis → decision",
  },
  {
    id: "purpose-field",
    code: "PF",
    name: "Purpose Field",
    licence: "explanation",
    shows: "How concerns, constraints and values bear on a proposed purpose",
    imports: "Situated concerns, operating constraints and declared values",
    exports: "Proposed purpose, typed rationale, unresolved tensions, scope and legitimacy questions",
    wide: "Separated concerns joined to an explicitly proposed purpose",
    narrow: "Each concern, its relation and the proposal follow in order",
    invariant: "Concern, constraint and chosen value remain distinct; no implied consensus",
    route: null,
  },
  {
    id: "service-score",
    code: "SS",
    name: "Service Score",
    licence: "explanation",
    shows: "Who and what enables a pathway, across stages",
    imports: "Purpose, proposed commitment, actors and material dependencies",
    exports: "Responsibility and stage cells, named handoffs, required permissions, records and return routes",
    wide: "Responsibilities across stages, with selective handoff inspection",
    narrow: "Responsibilities and stages become labelled sequential entries",
    invariant: "Actors, preconditions, authorisations, handoffs and return routes remain recoverable",
    route: null,
  },
  {
    id: "proof-block",
    code: "PB",
    name: "Proof Block",
    licence: "explanation",
    shows: "What must hold for a construction to become real",
    imports: "Exact RL or IF proposition IDs, premise status, evidence grounds and proposed construction",
    exports: "Block ID, defined degree, dependencies, proposed transition, lost options, new burdens, failure, fallback and reopening tests",
    wide: "Ruled proposition with dependency and questioning rails",
    narrow: "Argument bands, then targeted questions and tests",
    invariant: "Premise status, conditions, defined degree, lost options, new dependencies and fallback",
    route: "Premise → construction → escalation → realisation → reopening test",
  },
  {
    id: "situated-atlas",
    code: "AT",
    name: "Situated Atlas",
    licence: "explanation",
    shows: "What changes as someone encounters a pathway",
    imports: "SA account and source IDs, declared scope, encounter sequence and relevant SS handoffs",
    exports: "Scoped route, step and encounter IDs; waits, crossings, gaps, condition links, burdens, scale and return route",
    wide: "Distinct trajectories on a quiet field; encounters and waits attached locally",
    narrow: "Each account in its own ordered route; crossings and return relations named explicitly",
    invariant: "Account identity, source status, sequence, gaps, waiting and distribution of work",
    route: null,
  },
  {
    id: "material-world",
    code: "MW",
    name: "Material World",
    licence: "encounter",
    shows: "What kind of inhabited world could become imaginable",
    imports: "Proposition or image-brief ID, source references, media status and active licence",
    exports: "Composition ID, body–field relation, recurring material vocabulary, transformations, unresolved possibility and accessible description",
    wide: "Large silhouette within a detailed inhabited field",
    narrow: "Readable subject and shared material vocabulary; description retains the body–field relation",
    invariant: "Media status, central relation and whether any mark encodes data",
    route: null,
  },
  {
    id: "annotation",
    code: "AN",
    name: "Annotation",
    licence: "explanation",
    shows: "A question with an address — what could change the next reading",
    imports: "Exact versioned target from any module, a named voice, origin and local role",
    exports: "Annotation ID, question or objection, source links, response state, proposed revision and recorded effect at the target",
    wide: "A questioning margin beside its exact target",
    narrow: "The margin becomes a sequential reading after its target",
    invariant: "Target and version, voice, role and response state",
    route: "Target → voice → function → response → recorded revision",
  },
] as const;

export type Topology = (typeof topologies)[number];

// ── Concept field elements (§05A) ────────────────────────────────────
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

// ── Reasoning lineage steps (§05C) ───────────────────────────────────
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

// The three tests a lineage edge must pass (§05C).
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

// ── Transposition (§09) ──────────────────────────────────────────────
// Responsive design is semantic transposition, not visual reduction.

export const transpositionInvariants = [
  "Exact claim or shared question with its distinct accounts; complete accessible route",
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

// ── Inquiry Field (§06) ──────────────────────────────────────────────
// Questions, commitments, hunches and assumptions enter the explanatory
// grammar. Working controls reopen dependent hypotheses while the source
// record stays fixed.

export const inquiryConditionStates = [
  { state: "Unresolved", detail: "The default: it reflects the limits of the source record." },
  { state: "Assume met", detail: "Explores a hypothetical branch in which the condition holds." },
  { state: "Assume unmet", detail: "Explores a hypothetical branch in which it does not." },
] as const;

export const inquiryFieldRules = [
  {
    rule: "A control never verifies.",
    detail: "Changing a control never verifies a condition or alters the source record.",
  },
  {
    rule: "A hypothetical branch keeps its status.",
    detail: "Any interactive change follows an explicit rule and reports what it changed. A hypothetical branch must retain its hypothetical status.",
  },
  {
    rule: "Authority is independent.",
    detail: "A favourable hypothesis cannot confer institutional authority. Hypotheses inform deliberation without granting it; a further discrete decision is always required.",
  },
  {
    rule: "Declare the model boundary.",
    detail: "An authored qualitative dependency demonstration estimates no probability, benefit or cost. The conditions are deliberately incomplete; meeting them does not prove adequacy.",
  },
  {
    rule: "Revision is versioned.",
    detail: "A new account can challenge the scope or the dependency model itself. Revising that model requires a recorded interpretation and a new version.",
  },
] as const;
