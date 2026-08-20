// Reader position and power — the page produces a reader-position.
//
// From the xCO Polyphonic Communication Style Guide v5, §03C.
// "I", "we", "you" and "they" do not merely identify voices. They allocate
// membership, burden, ownership and agency. A polyphonic page is a speech act
// inside an institutional field.

export const readerPositions = [
  {
    n: "01",
    role: "Speaker",
    question: "Who authorises the address?",
    detail: "Author, institution, coalition, machine or composite voice.",
  },
  {
    n: "02",
    role: "Addressee",
    question: "Who is being recruited?",
    detail: "Reader, claimant, constituent, customer, witness or decision-maker.",
  },
  {
    n: "03",
    role: "Represented subject",
    question: "Who is spoken about?",
    detail: "Person, community, living system, future generation or absent actor.",
  },
  {
    n: "04",
    role: "Consequence holder",
    question: "Who carries what follows?",
    detail: "Benefits, burdens, liabilities, loss of option space and duties of repair.",
  },
  {
    n: "05",
    role: "Institutional actor",
    question: "Who can select, classify, record, decide or remedy?",
    detail: "Curator, ontology owner, data holder, authority, duty-bearer, reviewer and enforcer.",
  },
] as const;

export type ReaderPosition = (typeof readerPositions)[number];

// The political checksum — every composition must disclose these six things.
export const politicalChecksum = [
  "who speaks",
  "who is addressed",
  "who is transformed into an object",
  "who may act",
  "who may refuse",
  "who carries the consequence",
] as const;

// ── Agent typing (§03C) ──────────────────────────────────────────────
// Opacity must be typed. Unknown, contested, withheld and out of scope are
// different epistemic conditions — and "erased" is a defect, not a type.

export const agentTypes = [
  {
    tag: "AGENT UNKNOWN",
    id: "unknown",
    meaning: "The evidence does not yet identify who acted.",
    legitimate: true,
  },
  {
    tag: "AGENT CONTESTED",
    id: "contested",
    meaning: "Competing accounts assign responsibility differently.",
    legitimate: true,
  },
  {
    tag: "AGENT WITHHELD",
    id: "withheld",
    meaning: "An institution possesses but does not disclose attribution.",
    legitimate: true,
  },
  {
    tag: "AGENT ERASED",
    id: "erased",
    meaning: "The grammar displaces responsibility onto the affected person.",
    legitimate: false,
  },
] as const;

export type AgentType = (typeof agentTypes)[number];

// Direct-address hazards (§03C).
export const addressHazards = [
  {
    name: "Direct address",
    rule: "Recruitment is an act",
    detail: '"Are you?" invites; "your" asserts relation; "we" may create solidarity — or annex the reader.',
  },
  {
    name: "Absent agent",
    rule: "Opacity must be typed",
    detail: "Unknown, contested, withheld or out of scope are different epistemic conditions.",
  },
  {
    name: "Interface power",
    rule: "The action allocates agency",
    detail: "Defaults, refusal, time, record and remedy are part of the communication.",
  },
] as const;
