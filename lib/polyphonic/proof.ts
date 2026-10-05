// Proof block and marginal inquiry (§05D).
//
// From the xCO Polyphonic Communication Style Guide v8.1. A working form
// between the Reasoning Lineage and the Decision Surface: an adopted premise,
// a construction, its dependencies, the threshold for realisation and the
// optionality it changes. "Proof-carrying" names an inspectable record of
// those elements; the label does not establish that any claim is proven.

export type HighlightRole = "premise" | "capability" | "condition" | "provisional" | "transition";

export const proofIntro = {
  title: "Expose what a proposition carries.",
  line: "A stable argument spine. Conditions in view. A margin that can reopen the claim.",
  body: "PB-1 develops the supplied note's optionality argument as a typographic specimen. It keeps the note's questions about legitimacy, coupling and capture. The text illustrates a record structure; it does not establish an investment instrument.",
  degree: "A degree label identifies a declared level or kind of institutional construction. It is separate from certainty, readiness and mandate.",
} as const;

/** A line of a band. `mark` is an exact phrase inside `text` carrying a highlight role. */
export interface ProofLine {
  id?: string;
  label?: string;
  text: string;
  mark?: { phrase: string; role: HighlightRole };
}

export interface ProofBand {
  id: string;
  band: string;
  state?: string;
  lines: ProofLine[];
  note?: string;
}

/**
 * PB-1 — design specimen adapted from supplied reference 07. The five
 * highlight roles follow the 8.1 key (premise, capability, condition,
 * provisional state, transition); which phrase carries each is this site's
 * reading of the specimen.
 */
export const proofSpecimen = {
  id: "PB-1",
  meta: [
    "[BLOCK TYPE: Axiom + Construction]",
    "[DEGREE: 1 → 2 / definitions require an explicit local record]",
    "[OPTION STATE: Open → Conditioned / proposed]",
  ],
  title: "Optionality as an institutional investment object",
  subtitle: "From funding a project to forming a capability that can hold and exercise options.",
  bands: [
    {
      id: "PB-A",
      band: "Axiom block / adopted premises",
      lines: [
        { label: "A0 / Optionality thesis", text: "In a high-volatility world, a scarce asset is the availability of legitimate institutional pathways.", mark: { phrase: "legitimate institutional pathways", role: "premise" } },
        { label: "A1 / Instrument thesis", text: "A capital structure can function as an option-exercising machine." },
        { label: "A2 / Inspection thesis", text: "Keep every claim inspectable through its assumptions, degree and irreversibilities." },
      ],
      note: "These premises organise the specimen. Adopting them does not validate them; a substantive publication would give each its grounds and contesting account.",
    },
    {
      id: "PB-C",
      band: "Construction block",
      lines: [
        { text: "Define the proposed object as an Institution-Seeding Option." },
        { label: "Seed capital", text: "Resources to form an operator and its working capacity." },
        { label: "Mandate surface", text: "A specified domain and an inspectable basis for permission.", mark: { phrase: "an inspectable basis for permission", role: "condition" } },
        { label: "Capability scaffold", text: "A minimal operating core that can continue learning.", mark: { phrase: "minimal operating core", role: "capability" } },
        { label: "Legitimacy gradient", text: "The proposed movement from voluntary initiative towards appropriately authorised action." },
      ],
      note: "The object is constructed by this definition. Its practicality, legitimacy and resource requirements remain questions for inquiry.",
    },
    {
      id: "PB-V",
      band: "Escalation block",
      lines: [
        { text: "Degree 1 / local and feasible is the source note's starting description. A further degree must be specified before it can govern a real transition." },
        { label: "V0 / Coupling requirement", text: "The option would need to bind public, private and civic actors through arrangements whose authority, costs and responsibilities are explicit." },
        { label: "Prior state / open", text: "Several forms remain in consideration; authorisation and coupling are unresolved.", mark: { phrase: "unresolved", role: "provisional" } },
        { label: "Proposed transition / conditioned", text: "A form can become a conditional pathway when its named prerequisites are established. A discrete authorised decision is still required.", mark: { phrase: "become a conditional pathway", role: "transition" } },
      ],
    },
    {
      id: "PB-R",
      band: "Realisation block",
      state: "Conditioned",
      lines: [
        { label: "What would become real?", text: "An institution with a repeatable pipeline, within a declared scope." },
        { label: "Lost optionality", text: "Elements of pure voluntarism, neutrality and a single-beneficiary logic, as the supplied note identifies." },
        { label: "New dependencies", text: "Civic legitimacy, data reliance and conflict resolution." },
        { label: "Fallback", text: "If the institutional pathway fails, returning to project finance would change the kind of option held. Record the loss and ask whether another construction is possible." },
        { label: "Tests", text: "How would legitimacy be ensured? What would fail at the next degree? What mechanism would reopen or terminate the construction?" },
      ],
    },
  ] as ProofBand[],
  /** Typed adaptations of the supplied marginal inquiry, each with its target band. */
  margin: [
    { target: "PB-A", text: "Depends on: declared root premises, with their grounds still inspectable." },
    { target: "PB-C", text: "Legitimacy risk: who authorises? Whose standing remains absent?" },
    { target: "PB-C", text: "Capability scaffold: what can the operating core actually maintain?" },
    { target: "PB-V", text: "Coordination burden: who carries the coupling costs, and for how long?" },
    { target: "PB-V", text: "Escalation: what changes between local feasibility and wider coupling?" },
    { target: "PB-R", text: "Failure mode: institutional capture. What constrains it, and who can contest it?" },
    { target: "PB-R", text: "If this fails: name the fallback, including the options it loses." },
  ],
  status: "An authored design specimen adapted from reference 07. Marginal questions are typed adaptations of the supplied inquiry. No capital is allocated and no mandate is created.",
} as const;

/** Argument bands and their permitted function. */
export const proofBands = [
  { band: "Axiom / premise", can: "Declare an adopted starting proposition", expose: "Grounds, scope, objections and adoption status", cannot: "Self-evident truth" },
  { band: "Construction", can: "Define an object and its operating parts", expose: "Resources, mandate and capability requirements", cannot: "Existence or availability" },
  { band: "Escalation", can: "Describe a threshold between defined degrees", expose: "Changed coupling, authority, burden and reversibility", cannot: "A confidence score" },
  { band: "Realisation", can: "Name the proposed new capability and changed option set", expose: "Losses, new dependencies, failure and fallback", cannot: "An authorised action" },
  { band: "Marginal inquiry", can: "Question or constrain an exact proposition", expose: "Target, voice, standing and material effect on the claim", cannot: "Verification through visual presence" },
] as const;

export const proofMinimumRecord =
  "Keep the exact proposition, source and status; its dependencies and warrant; the action or construction it proposes; the defined degree and transition; what becomes possible; what is foreclosed; new dependencies and burden holders; failure and fallback; and a question that can reopen it.";

export const proofNeighbours =
  "The Reasoning Lineage keeps the grounds and typed relations of the proposition. The Inquiry Field explores declared conditional branches. PB exposes the proposed construction and its costs; the Decision Surface records any discrete authorised commitment.";

export const proofClose = ["What becomes possible?", "What becomes binding?", "What must remain reopenable?"] as const;
