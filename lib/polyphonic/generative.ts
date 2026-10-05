// Generative relations — what a relation can make possible.
//
// From the xCO Polyphonic Communication Style Guide v6.1, §02 and §00B.
// v6.1's generative centre: reader capability joins accountability as a
// governing purpose, and four generative operations extend the operator
// grammar. A generative operation changes the conditions under which
// something can be noticed, questioned or undertaken. Its purpose is local and
// inspectable — a visual association does not establish that people have
// cooperated, that a capability exists or that a future will occur.

export const generativeIntro = {
  claim: "Difference, reciprocity, openness and maintenance can become compositional operations.",
  method:
    "Begin with the relation that matters. Give it form across language, space, time or interaction. Ask what the treatment helps someone perceive, and what it might conceal.",
  force:
    "The relation has generative force when it changes what can be perceived, asked or undertaken.",
} as const;

/** The two questions that frame every generative operation. */
export const generativeFraming = [
  { name: "Purpose", rule: "Give hope a structure", detail: "Show what keeps a possibility available, who sustains it and what remains uncertain." },
  { name: "Distribution", rule: "Ask whose capacity grows", detail: "An opening for one actor may impose maintenance, risk or closure on another." },
] as const;

/** Hope as conditions, not a tone (§01). */
export const hopeConditions = [
  "attention",
  "imagination",
  "mutual support",
  "maintained capability",
  "the freedom to revise",
] as const;

/** Outcomes the guide counts as legitimate, beside agreement (§01). */
export const legitimateOutcomes = [
  "closer understanding",
  "a better question",
  "more precise disagreement",
  "a deliberate pause",
] as const;

export const generativeOperations = [
  {
    id: "differentiate",
    name: "Differentiate",
    title: "Let differences remain consequential.",
    rule:
      "Preserve distinct accounts, sources, concerns and limits. Let their relationship change the shared question. A common referent gives orientation; agreement must be stated rather than inferred from shared placement.",
    limit:
      "Distinct visual positions indicate different accounts. They do not rank people or imply equal evidential support.",
    steps: [
      ["Resident", "Can I reach, enter and remain?"],
      ["Care worker", "What enables accompaniment?"],
      ["Facility steward", "What is listed, operating and maintained?"],
    ],
    edges: ["alongside / at the same event", "alongside / at the same event"],
  },
  {
    id: "reciprocate",
    name: "Reciprocate",
    title: "Let a contribution return changed.",
    rule:
      "Show a contribution changing a shared arrangement and the consequences returning to affect its contributors. Name who can respond, who owes a response and who carries its labour. A drawn return edge requires an explicit review mechanism.",
    limit:
      "A return line represents a specified response and review relation. The diagram does not establish that anyone has been heard, that repair has occurred or that duties are fairly distributed.",
    steps: [
      ["An access barrier is described", "The account enters with its source and limits."],
      ["An arrangement is reconsidered", "Name the responder and the labour of responding."],
      ["The consequence returns for review", "The contributor may challenge the response and change the question."],
    ],
    edges: ["prompts reconsideration of", "returns to the contributor through review"],
  },
  {
    id: "hold-open",
    name: "Hold open",
    title: "Keep more than one pathway in view.",
    rule:
      "Keep several plausible pathways visible, together with what each requires, what it could foreclose and why it remains in consideration. A visible option is not necessarily feasible or available. Declared differences are more useful than an invented score.",
    limit:
      "These are illustrative possibilities, not recommendations or available services. Equal space does not imply equal feasibility, priority or benefit.",
    steps: [
      ["Arrange accompaniment", "Requires willing participants, people, time and a funded arrangement."],
      ["Reconsider opening hours", "Requires staffing, permissions and fit with residents' needs."],
      ["Reframe the service", "If both are unsuitable, investigate another way to provide cooling."],
    ],
    edges: ["an alternative to examine alongside", "if these are inadequate, reconsider"],
  },
  {
    id: "sustain",
    name: "Sustain",
    title: "Make the work of continuation visible.",
    rule:
      "Make repeated work, resources, intervals, wear and succession perceptible. Name who maintains the capability and how that responsibility can be renewed or transferred. Repetition in a composition is a reading of maintenance, not proof of durability.",
    limit:
      "A repeated score expresses maintenance across time. It does not guarantee durability. Name interruptions, succession, wear and the people carrying the work.",
    steps: [
      ["Observe conditions", "Listen for changing needs and inspect the material provision."],
      ["Resource and maintain", "Assign responsibility, time and resources through legitimate decisions."],
      ["Review and renew", "Examine consequences, revise the arrangement and provide for succession."],
    ],
    edges: ["informs a bounded maintenance decision", "returns through observation to the next cycle"],
  },
] as const;

export type GenerativeOperation = (typeof generativeOperations)[number];

// ── Situated polyphony (§02) ─────────────────────────────────────────
// Registers and voices are distinguished. Several exact accounts can change
// one shared question without being absorbed into compulsory agreement.

export const registerAndVoice = [
  {
    name: "Register",
    detail:
      "Offers expressive affordances: institutional language, code, embodied speech, a margin or a spatial rhythm.",
  },
  {
    name: "Situated voice",
    detail:
      "Brings an identifiable source or declared construction, experience, interests, reasoning, standing and limits.",
  },
] as const;

export const situatedVoiceRules = [
  "Hold each account intact and addressable.",
  "Identify the shared referent, actual agreement and unresolved disagreement.",
  "Readers should be able to inspect how a contribution altered the framing.",
  "The author's synthesis remains one accountable interpretation.",
  "Represent ecological conditions through stated observations, models and accountable interpretation.",
  "Attribute an institutional representative's position to that representative.",
  "Clearly mark an imagined nonhuman voice as a creative construction.",
] as const;

// ── Five working forms (§00B) ────────────────────────────────────────
// Five supplied reference images developed into working forms, each with a
// local relation contract and a sequential equivalent. They can share a case
// without becoming interchangeable.

export const workingForms = [
  {
    n: "01",
    name: "Spatial score",
    code: null,
    does: "Conducts attention",
    rule: "Compose entry, collision, suspension and a terminal reveal. Recover the complete sentence. Keep operative choices close to their consequences.",
  },
  {
    n: "02",
    name: "Expandable lineage",
    code: "RL",
    does: "Exposes derivation",
    rule: "Keep node identity stable. Label relations, preserve branch structure and recalculate connections as content expands. Lane membership never confers truth.",
  },
  {
    n: "03",
    name: "Evidence constellation",
    code: "EM",
    does: "Locates what bears on an exact phrase",
    rule: "Bind each display to an exact span. Declare corpus, query, denominator and method. Language frequency cannot verify the event or characterise a person.",
  },
  {
    n: "04",
    name: "Purpose field",
    code: "PF",
    does: "Relates concerns to a proposed commitment",
    rule: "Distinguish expressed concerns, operating constraints and chosen values. Explain how each motivates or constrains a purpose that remains open to contestation.",
  },
  {
    n: "05",
    name: "Service score",
    code: "SS",
    does: "Shows who and what enables it through time",
    rule: "Show participant experience, human work, institutional authority, machine support and material conditions together. Expose the handoffs and conditions that make a pathway practicable.",
  },
] as const;

export const workingFormsNote =
  "The supplied images are preserved with observations in the guide's reference studies. Their original source context has not been independently established.";
