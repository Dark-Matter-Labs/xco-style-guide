// Communication licences — the consequence class of a composition.
//
// From the xCO Polyphonic Communication Style Guide v6.1, §03.
// The governing rule: licence follows consequence — what a composition enables:
// encountering a condition, inspecting an account or making a commitment. A
// mixed element inherits the STRICTEST licence it serves.

export const licences = [
  {
    id: "encounter",
    n: "01",
    name: "Encounter",
    subtitle: "provocation",
    task: "Create attention, tension and second reading",
    ambiguity: "Generative and bounded",
    landing: "Recoverable question or proposition; no hidden operative action",
    permits:
      "Controlled fracture, productive ambiguity, counterpoint, direct address and delayed recognition — when they deepen the question.",
    obligation:
      "Bounded readings + accessible recovery + no ambiguous operative consequence.",
  },
  {
    id: "explanation",
    n: "02",
    name: "Explanation",
    subtitle: "inquiry",
    task: "Frame, compare, evidence, relate and test",
    ambiguity: "Declared uncertainty only",
    landing: "Traceable logic and ordinary-language gloss",
    permits:
      "Use a Concept Field for what a proposition contains, an Evidence Mantle for what bears on exact spans, a Reasoning Lineage for what follows, and an Inquiry Field for what assumptions leave open.",
    obligation:
      "Keep semantic attachment, evidence, inference, mechanism and authority in separate relation jurisdictions.",
  },
  {
    id: "decision",
    n: "03",
    name: "Decision",
    subtitle: "interface",
    task: "Authorise, refuse, revise or commit",
    ambiguity: "None about the commitment, powers or rights; outcome uncertainty remains explicit",
    landing: "Clear action, authority, refusal, expiry and remedy",
    permits:
      "Authority, scope, default, refusal, reversibility, expiry, record, appeal and remedy must be legible before action.",
    obligation:
      "Equal clarity for acceptance, refusal and revision. Define the authorised state change exactly; disclose uncertainty about subsequent effects.",
  },
] as const;

export type Licence = (typeof licences)[number];
export type LicenceId = Licence["id"];

// The five-step authoring sequence that opens any composition (§01).
// 6.1 widens the nucleus and the topologies to situated accounts and inquiry,
// and adds reader benefit and expressive surplus to what release examines.
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
      "Name the exact claim or source, the shared question and its distinct accounts, or the proposed commitment.",
  },
  {
    n: "03",
    name: "Topology",
    instruction: "Choose the form the question requires.",
    detail:
      "Attention score, situated accounts, Concept Field, Evidence Mantle, Reasoning Lineage, Inquiry Field or Decision surface.",
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
      "Recoverability, reader benefit, expressive surplus, evidence, power, consent and access must be examined.",
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
      "Type, image, space and interaction can enact capture, uncertainty, reciprocity, difference, maintenance or emergence.",
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
    detail:
      "A register supplies expressive affordances. A situated voice brings a source, experience, interests, reasoning and limits.",
  },
  {
    axis: "Operator",
    question: "What is being done?",
    detail:
      "Tagging, fragmenting, revealing, differentiating, reciprocating, sustaining or holding open.",
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

// Institutional acts and their minimum disclosure / exit requirements (§07, Ref C).
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

// The decision object — every field must be exposed before commitment (§07).
export const decisionObject = [
  { field: "Actor / capacity", detail: "Who acts, and in what capacity." },
  { field: "Authority / mandate", detail: "Mandate reference, scope and expiry." },
  { field: "Decision basis", detail: "Policy, evidence bundle and reasoning-lineage version." },
  { field: "Prior state", detail: "What is true before the transition." },
  { field: "Requested transition", detail: "The exact action being asked for." },
  { field: "Resulting state / consequence", detail: "What becomes true, and what does not." },
  { field: "Data / purpose / recipients", detail: "What is collected, why, and who may access it." },
  { field: "Duration / reversibility", detail: "Retention, withdrawal window and thresholds." },
  { field: "Alternatives / refusal", detail: "Leave, defer, save or revise — at equal reach." },
  { field: "Review / receipt", detail: "Preview before action; durable timestamped record." },
  { field: "Appeal / remedy", detail: "Correction, withdrawal, deletion or escalation." },
  { field: "Owner / correction", detail: "Named steward and versioned correction route." },
] as const;

// Consent rules at the point of state change (§07).
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

// ── Precise commitments (§07) ────────────────────────────────────────
// 6.1 replaces v5's "interpretive meaning may remain open; institutional
// consequence may not" with a maxim that separates two kinds of certainty.

export const commitmentMaxim = {
  line: "Make the commitment precise. Make uncertainty about its effects explicit.",
  boundary:
    "The Decision licence begins whenever a reader can consent, submit, disclose, waive, authorise, pay, enrol, allocate or otherwise change state.",
  separation:
    "A Concept Field, Evidence Mantle or Reasoning Lineage remains explanatory. None may itself solicit commitment until a separate, visibly gated Decision surface begins.",
  reversal:
    "Reversing permission does not reverse every material consequence. Name what can be withdrawn, what persists and how repair is resourced.",
} as const;

/** The state change and its effects have different kinds of certainty. */
export const commitmentCertainty = [
  {
    kind: "Determinate commitment",
    states:
      "Who authorises what, the resources and powers involved, the scope, duration, records, rights and route to revision.",
  },
  {
    kind: "Uncertain effects",
    states:
      "The expected mechanism, conditional outcomes, distribution, possible harms, limits of reversibility and what observations would reopen the decision.",
  },
] as const;

export const decisionRules = [
  { name: "Strictest licence", rule: "Function outranks appearance", detail: "An element serving both encounter and decision inherits the Decision obligations." },
  { name: "Action language", rule: "Name the outcome", detail: '"Submit report" or "Accept terms" is accountable. "Proceed" conceals the state change.' },
  { name: "Choice parity", rule: "Refusal is part of agency", detail: "Refuse, defer and revise remain as legible and reachable as accept." },
] as const;

/**
 * A commitment can begin before the pathway is known (§06, H-D). The guide's
 * worked specimen: a bounded inquiry with its own mandate, resource ceiling,
 * participant rights, expiry and remedy. Non-operative; quantities illustrative.
 */
export const boundedInquiry = {
  id: "DS-H1",
  proposal: "Allocate six staff hours over seven days to an access inquiry.",
  note: "This describes a possible decision. The guide has no mandate to allocate resources or recruit participants.",
  fields: [
    { field: "Actor and authority", detail: "A locally mandated access team, acting under a verified, scoped mandate M-H01. The mandate and the employing body's resource authority must be established independently." },
    { field: "Prior state", detail: "No staff time is assigned to this inquiry; no residents have agreed to participate." },
    { field: "Proposed state change", detail: "Reallocate six already-budgeted staff hours within seven days to verify operating hours and invite voluntary accounts of access barriers for the two listed rooms." },
    { field: "Purpose and scope", detail: "Produce a scoped account of operating and access conditions, evidence gaps and questions for review. Any later service trial requires its own decision." },
    { field: "Participation and data", detail: "Offer a plain-language invitation with a separate, specific information and consent process. Seek no identifiable account without that process. Name recipients, retention and correction routes before collection." },
    { field: "Expected effects and uncertainty", detail: "Better understanding may reveal feasible arrangements, further dependencies or an unsuitable pathway. No improvement in cooling access is promised by this allocation." },
    { field: "Distribution and burden", detail: "The reallocation may displace other staff work; disclose what is deferred. Participation may cost residents time. Offer accessible ways to contribute or decline and resource those arrangements." },
    { field: "Review and expiry", detail: "Review the account with participating residents and the mandate holder at day seven. The allocation expires then; continuation requires a fresh decision. Public claims must identify the limits of the inquiry." },
    { field: "Record and remedy", detail: "Record the authorised scope, resource change and review date. Permit correction of accounts, pause the inquiry if its scope or rights are breached, and disclose what records may lawfully be withdrawn or must remain. Completed work cannot be undone." },
  ],
  separate:
    "An institution's authority to allocate staff time and an individual's agreement to participate are separate decisions.",
} as const;
