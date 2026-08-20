// Communication licences — the consequence class of a composition.
//
// From the xCO Polyphonic Communication Style Guide v5, §02.
// The governing rule: licence follows consequence. The same composition cannot
// be equally ambiguous when opening a question, proving a claim, and obtaining
// consent. A mixed element inherits the STRICTEST licence it serves.

export const licences = [
  {
    id: "encounter",
    n: "01",
    name: "Encounter",
    subtitle: "provocation",
    task: "Create attention, tension and second reading",
    ambiguity: "Generative and bounded",
    landing: "Recoverable proposition; no hidden operative action",
    permits:
      "Controlled fracture, productive ambiguity, counterpoint, direct address and delayed recognition — when they deepen the question.",
    obligation:
      "Bounded readings + accessible recovery + no ambiguous operative consequence.",
  },
  {
    id: "explanation",
    n: "02",
    name: "Explanation",
    subtitle: "proof",
    task: "Define, evidence, relate and test",
    ambiguity: "Declared uncertainty only",
    landing: "Traceable logic and ordinary-language gloss",
    permits:
      "Use the topology the question requires: a Concept Field for what a proposition contains; an Evidence Mantle for what bears on exact spans; a Reasoning Lineage for what follows from what.",
    obligation:
      "Keep semantic attachment, evidence, inference, mechanism and authority in separate relation jurisdictions.",
  },
  {
    id: "decision",
    n: "03",
    name: "Decision",
    subtitle: "interface",
    task: "Authorise, refuse, revise or commit",
    ambiguity: "None around consequence or rights",
    landing: "Clear action, authority, refusal, expiry and remedy",
    permits:
      "Authority, scope, default, refusal, reversibility, expiry, record, appeal and remedy must be legible before action.",
    obligation:
      "Equal clarity for acceptance, refusal and revision. No poetic ambiguity at the point of commitment.",
  },
] as const;

export type Licence = (typeof licences)[number];
export type LicenceId = Licence["id"];

// The five-step authoring sequence that opens any composition (§01).
export const constitutionSteps = [
  {
    n: "01",
    name: "Licence",
    instruction: "Declare the consequence class.",
    detail:
      "Encounter, Explanation or Decision. A mixed element inherits the strictest licence it serves.",
  },
  {
    n: "02",
    name: "Nucleus",
    instruction: "State what must remain recoverable.",
    detail:
      "Name the canonical proposition, source utterance, evidence object or decision request.",
  },
  {
    n: "03",
    name: "Topology",
    instruction: "Choose the form the question requires.",
    detail:
      "Attention score, Concept Field, Evidence Mantle, Reasoning Lineage or Decision surface.",
  },
  {
    n: "04",
    name: "Jurisdictions",
    instruction: "Declare what each transformation and relation does.",
    detail:
      "Register, operator, operand, line grammar, colour role, reader path and prohibited reading.",
  },
  {
    n: "05",
    name: "Release",
    instruction: "Test consequence — not polish alone.",
    detail:
      "Recoverability, semantic surplus, power, consent, evidence, responsiveness and accessibility must pass.",
  },
] as const;

// The six constitutional principles (§01).
export const principles = [
  {
    n: "01",
    name: "Relation",
    claim: "Meaning is relational",
    detail:
      "A mark has affordances, not a universal meaning. Operator + operand + context generates the reading.",
  },
  {
    n: "02",
    name: "Enactment",
    claim: "Form may perform",
    detail:
      "Typography can model or enact capture, uncertainty, exclusion, recursion, authority or resistance.",
  },
  {
    n: "03",
    name: "Counterpoint",
    claim: "Voices may collide",
    detail:
      "Polyphony includes contamination, interruption and struggle — not only clean division of labour.",
  },
  {
    n: "04",
    name: "Choreography",
    claim: "The reader moves in time",
    detail:
      "Attraction, reversal, reconstruction and delayed revelation are authored parts of the argument.",
  },
  {
    n: "05",
    name: "Recovery",
    claim: "Access without reduction",
    detail:
      "Essential meaning needs an accessible equivalent. The expressive surface may still carry defensible surplus.",
  },
  {
    n: "06",
    name: "Consequence",
    claim: "Power enters the grammar",
    detail:
      "Who addresses, represents, records, decides, refuses and remedies is constitutive — not a final checklist.",
  },
] as const;

// The four questions that define a performed relation (§01).
export const performedRelation = [
  {
    axis: "Register",
    question: "Who is speaking?",
    detail: "Human, machine, formal, institutional, affective or spatial voice.",
  },
  {
    axis: "Operator",
    question: "What is being done?",
    detail:
      "Tagging, routing, fragmenting, suspending, scaling, marginalising or revealing.",
  },
  {
    axis: "Score",
    question: "When does it arrive?",
    detail:
      "Entry, reversal, reconstruction, delay, terminal recoding and aftermath.",
  },
  {
    axis: "Interface",
    question: "What follows?",
    detail: "Action, default, refusal, consequence, record, appeal and remedy.",
  },
] as const;

// Institutional acts and their minimum disclosure / exit requirements (§05, Ref C).
export const institutionalActs = [
  {
    act: "Notice",
    disclosure: "Issuer, purpose, effect and effective date",
    exit: "Access to the underlying policy and contact route",
  },
  {
    act: "Acknowledgement",
    disclosure: "Exactly what receipt confirms — and what it does not",
    exit: "Copy or durable record",
  },
  {
    act: "Consent",
    disclosure: "Party, object, purpose, data, recipient, duration and risk",
    exit: "Refuse, withdraw, correct and obtain remedy",
  },
  {
    act: "Authorisation",
    disclosure: "Scope, delegated power, expiry and limits",
    exit: "Revoke or contest authority",
  },
  {
    act: "Contract / waiver",
    disclosure: "Commitment, cost, liability, jurisdiction and material exclusions",
    exit: "Review, advice, cancellation and appeal where applicable",
  },
  {
    act: "Complaint / report",
    disclosure: "Recipient, use, confidentiality, process and likely timeline",
    exit: "Save, withdraw, correct, escalate and track",
  },
] as const;

// The decision object — every field must be exposed before commitment (§05).
export const decisionObject = [
  { field: "Actor / capacity", detail: "Who acts, and in what capacity." },
  { field: "Authority / mandate", detail: "Mandate reference, scope and expiry." },
  { field: "Decision basis", detail: "Policy, evidence bundle and reasoning-lineage version." },
  { field: "Prior state", detail: "What is true before the transition." },
  { field: "Requested transition", detail: "The exact action being asked for." },
  { field: "Resulting state", detail: "What becomes true, and what does not." },
  { field: "Data / purpose / recipients", detail: "What is collected, why, and who may access it." },
  { field: "Duration / reversibility", detail: "Retention, withdrawal window and thresholds." },
  { field: "Alternatives / refusal", detail: "Leave, defer, save or revise — at equal reach." },
  { field: "Review / receipt", detail: "Preview before action; durable timestamped record." },
  { field: "Appeal / remedy", detail: "Correction, withdrawal, deletion or escalation." },
  { field: "Owner / correction", detail: "Named steward and versioned correction route." },
] as const;

// Consent rules at the point of state change (§05).
export const consentRules = [
  {
    rule: "Name the state change and authority.",
    detail:
      "Separate navigation from assent. If choice is compulsory, name the governing authority instead of calling it consent.",
  },
  {
    rule: "Disclose consequence before action.",
    detail:
      "No preselection or inferred assent; direct address states who speaks, why, and what happens next.",
  },
  {
    rule: "Preserve refusal and revision parity.",
    detail:
      "Refusal cannot require more travel, disclosure, steps or cognitive work than acceptance.",
  },
  {
    rule: "Make remedy operational.",
    detail:
      "Review, record, expiry, withdrawal, correction and appeal are working paths — not reassurance copy.",
  },
] as const;
