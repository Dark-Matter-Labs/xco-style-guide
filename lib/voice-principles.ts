// xCO voice principles — "Radical conjecture, held with care."
//
// From Indy Johar's proposition, annotated working edition 01 (October 2026).
// This is the governing layer of the tone of voice: who xCO is when it
// writes. The three registers in tone-templates.ts are how that one voice is
// set for a surface — a paper, a post, a caption — not three voices.
//
// Text is kept as Indy wrote it, with two house rules applied: the brand in
// house casing (xCO, not XCO), and US spelling (hypothesize, recognize). Each principle carries its editorial decision: the annotation that
// says why the wording was chosen, so the reasoning travels with the rule.
//
// The three strands are the source's highlight key. On the page they are
// carried by name as well as by tint — colour is never the only carrier.

export const voice = {
  title: "Radical conjecture, held with care.",
  eyebrow: "A voice for thinking into difficult futures",
  dek: "We follow difficult implications with seriousness, make our reasoning visible, and invite others to think with us inside the uncertainty.",
  status: "A working proposition. Open to question, and capable of changing.",
  source: "From Indy Johar's proposition · October 2026 · annotated working edition 01",
} as const;

export type StrandId = "radicality" | "conjecture" | "care";

export const strands: { id: StrandId; name: string; titleWord: string }[] = [
  { id: "radicality", name: "Radicality & consequence", titleWord: "Radical" },
  { id: "conjecture", name: "Conjecture & doubt", titleWord: "conjecture," },
  { id: "care", name: "Care & invitation", titleWord: "held with care." },
];

export interface VoicePrinciple {
  n: string;
  /** The move, e.g. "Preserve the radical edge". */
  move: string;
  /** The principle as a line — the part that is quoted. */
  line: string;
  body: string;
  strand: StrandId;
  decision: { name: string; title: string; rationale: string };
}

export const voicePrinciples: VoicePrinciple[] = [
  {
    n: "01",
    move: "Preserve the radical edge",
    line: "Friction is an invitation to think.",
    body: "xCO's voice follows an argument far enough to unsettle the assumptions through which a situation has become familiar, acceptable or apparently inevitable. We preserve the scale of the question and the force of its implications. Friction interrupts easy recognition and gives the reader a reason to pause. The language stays clear enough for the difficulty to live in the thought itself.",
    strand: "radicality",
    decision: {
      name: "Radicality",
      title: "Keep friction purposeful.",
      rationale: "“Invitation” gives the disruption a purpose: to open thought. The wording keeps the radical edge and gives clarity a precise job—making the challenge available to examination.",
    },
  },
  {
    n: "02",
    move: "Make the conjecture visible",
    line: "We offer a conjecture.",
    body: "Our work often concerns plausible interactions between forces unfolding into the future. We show the observations we begin with, the relationships we infer, and the futures we hypothesize. Each step has a different claim on confidence. Readers should be able to see which assumptions carry the argument, where important unknowns remain, and what would strengthen, weaken or change our account.",
    strand: "conjecture",
    decision: {
      name: "Conjecture",
      title: "Declare how the claim is made.",
      rationale: "“Conjecture” names the status of the work. Observation, inference and hypothesis become visible parts of the argument. This allows a strong proposition to remain open to challenge.",
    },
  },
  {
    n: "03",
    move: "Hold gently",
    line: "Hold the conclusion gently.",
    body: "Doubt belongs inside the voice. We give readers room to question a premise, identify an absent relationship and propose another trajectory. We hold our conclusions gently while attending fully to the consequences they imply. A reader can remain uncertain and still take the possibility seriously. The encounter leaves space for hesitation, disagreement and an understanding that is still forming.",
    strand: "care",
    decision: {
      name: "Care",
      title: "Place gentleness in how we hold a claim.",
      rationale: "This makes room for doubt without reducing the attention given to consequences. It gives the reader permission to think at their own pace and keeps the conclusion revisable.",
    },
  },
  {
    n: "04",
    move: "Follow the difficult implications",
    line: "Stay with the darkness.",
    body: "Where the evidence suggests loss, breakdown, exclusion or the erosion of future possibility, we allow those implications to register. We give them precise language and attend to who or what bears them. We allow ourselves to be affected by what we are examining. Curiosity includes the courage to investigate what frightens us, unsettles our commitments or threatens an account of the world we have come to depend on.",
    strand: "radicality",
    decision: {
      name: "Consequence",
      title: "Let difficult evidence register.",
      rationale: "“Stay” asks for sustained attention. The paragraph ties darkness to consequences suggested by evidence and to those who bear them. Specificity gives the discomfort substance.",
    },
  },
  {
    n: "05",
    move: "Let uncertainty open an inquiry",
    line: "Give doubt work to do.",
    body: "Uncertainty invites us to look again, listen, test and learn. We make our questions specific enough to investigate: which interaction matters, what would need to be true, whose experience could change our understanding, and what we may have failed to notice. We follow the inquiry beyond the answers we already know how to give. Doubt becomes a shared practice through which the account can deepen.",
    strand: "conjecture",
    decision: {
      name: "Doubt",
      title: "Make doubt generative.",
      rationale: "The verbs give uncertainty an active role. Specific questions make the invitation to learn concrete and allow disagreement to contribute to the inquiry.",
    },
  },
  {
    n: "06",
    move: "Make the encounter inhabitable",
    line: "Make care an invitation.",
    body: "Care gives this encounter room to breathe. We recognize the emotional demands of meeting a difficult proposition and the time it can take to understand its implications. Our warmth is in the patience, attention and respect with which we think together. Readers have permission to contribute something we have failed to see. The voice helps people remain present to difficulty long enough for another possibility to become perceptible.",
    strand: "care",
    decision: {
      name: "Invitation",
      title: "Locate warmth in the encounter.",
      rationale: "Care is expressed through patience, attention and the reader’s freedom to contribute. This makes a demanding inquiry possible to inhabit while preserving the seriousness of its implications.",
    },
  },
  {
    n: "07",
    move: "Remain capable of changing",
    line: "Let the inquiry change us.",
    body: "Our own framing remains open to challenge. We ask whose experience is missing, what our analysis obscures, and whether the futures we describe are becoming convenient to the responses we already prefer. The inquiry must be able to unsettle its authors. A claim that survives questioning may earn greater confidence; an account that changes has learned something.",
    strand: "conjecture",
    decision: {
      name: "Revision",
      title: "Make the invitation reciprocal.",
      rationale: "“Change us” places xCO’s own assumptions within the inquiry. Questioning can alter our position. That willingness gives doubt substance and makes learning consequential.",
    },
  },
];

/** The paragraph that closes principle 07 and describes the voice as a whole. */
export const voiceSynthesis =
  "The voice that emerges is direct, searching and consequential. It makes strong claims with visible reasoning and gives others a real opening to question them. It invites us to share responsibility for understanding what may be unfolding, what is at stake, and what possibilities remain available to construct.";

/** The editorial compass — one clause per strand. */
export const compass = {
  clauses: [
    { text: "Make the thought sharp,", strand: "radicality" as StrandId },
    { text: "the reasoning visible,", strand: "conjecture" as StrandId },
    { text: "and the conclusion revisable.", strand: "care" as StrandId },
  ],
  coda: "The edge, the doubt and the care belong together. Each gives the other a responsibility.",
} as const;

export const compassLine = compass.clauses.map((c) => c.text).join(" ");

/** The principles as a brief for a writer or a model — used by the prompt templates. */
export function voiceBrief(): string {
  return [
    `VOICE: ${voice.title} ${voice.dek}`,
    `COMPASS: ${compassLine}`,
    "PRINCIPLES:",
    ...voicePrinciples.map((p) => `- ${p.line} ${p.decision.title}`),
  ].join("\n");
}

/** The whole edition as Markdown — for the wiki and the website. */
export function voiceMarkdown(): string {
  const strandName = (id: StrandId) => strands.find((s) => s.id === id)?.name ?? id;
  return [
    `# ${voice.title}`,
    "",
    `*${voice.eyebrow}.*`,
    "",
    voice.dek,
    "",
    `> ${voice.status}`,
    "",
    `Three strands run through the voice: ${strands.map((s) => s.name).join("; ")}.`,
    "",
    ...voicePrinciples.flatMap((p) => [
      `## ${p.n} / ${p.move}`,
      "",
      `**${p.line}** *(${strandName(p.strand)})*`,
      "",
      p.body,
      "",
      `> **Decision ${p.n} · ${p.decision.name}: ${p.decision.title}** ${p.decision.rationale}`,
      "",
    ]),
    voiceSynthesis,
    "",
    "## The editorial compass",
    "",
    `> ${compassLine}`,
    "",
    compass.coda,
    "",
    `*${voice.source}.*`,
  ].join("\n");
}
