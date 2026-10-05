// Seven references, five grammars (§00B).
//
// From the xCO Polyphonic Communication Style Guide v8.1. Five cinematic
// frames set colour and tone; four document references expose the score,
// evidence, atlas and argument structures. Each reference is kept as an
// observation, a transfer rule and a design limit — what was seen, what the
// guide takes from it, and what its appearance must not be taken to establish.
// The supplied images themselves are not reproduced here.

export const referencesIntro = {
  title: "Several sources. A deeper grammar.",
  line: "A sentence can become a score. A claim can open into evidence. A world can be felt through its material relations.",
  body: "These references extend the guide at five scales: the reading event, the exact phrase, the situated trajectory, the inspectable argument and the imagined world. Together they make a language in which emotional amplitude, analytical precision and unresolved possibility can coexist.",
  use: "Choose the relationship that gives the particular question more depth, then make its local meaning recoverable.",
} as const;

export interface ReferenceStudy {
  id: string;
  /** Reference number(s) in the source guide. */
  n: string;
  name: string;
  line: string;
  observed: string;
  transfer: string;
  limit: string;
  /** Where the grammar is worked in this site. */
  href: string;
}

export const referenceStudies: ReferenceStudy[] = [
  {
    id: "colour-tone",
    n: "01–03 + two frames",
    name: "Colour and tone",
    line: "Warmth acquires depth.",
    observed: "Concentrated orange surfaces meet blue undersides, blue atmospheric fields and pale mineral ground. Fine dark marks carry density inside a strong mass.",
    transfer: "Give warmth a cooler surround. Keep orange pigmented and blue substantial. Let a pale ground make the ink legible. Hold vitality and unease together: large quiet areas give the first encounter force; fine rules and layered relations reward a closer reading.",
    limit: "The five frames guide colour and atmosphere only. The exact values are authored translations, not claims about an original production palette.",
    href: "/colour",
  },
  {
    id: "situated-atlas",
    n: "04",
    name: "Situated atlas",
    line: "Several lives remain several trajectories.",
    observed: "Two differently coloured itineraries hold movement, pauses, borders, hospitality and institutional encounters. The ground recedes; routes and local annotations carry the reading.",
    transfer: "Hold distinct accounts in a common field. Attach duration, experience, material setting and institutional friction to the point where each matters. Preserve a route's source identity through every crossing.",
    limit: "A path is a situated account with gaps. Its coherence does not establish a complete life history, and the guide invents no testimony for the people in the reference.",
    href: "/grammar/atlas",
  },
  {
    id: "typographic-score",
    n: "05",
    name: "Typographic score",
    line: "The sentence is staged in time.",
    observed: "Silence precedes the sentence. Serif scale, italic stance, displaced fragments, a tagged word, side rails and a distant terminal term make reconstruction part of reading.",
    transfer: "Author the entry, hinge, pause, terminal recoding and aftermath. Give one complete sentence an accessible reading route. Reserve a fractured score for a question whose meaning benefits from it.",
    limit: "Syntax-like marks need a local purpose. A hidden authorising action cannot rely on delayed recognition.",
    href: "/grammar/page",
  },
  {
    id: "exact-span-evidence",
    n: "06",
    name: "Exact-span evidence",
    line: "The utterance keeps its world.",
    observed: "A full quotation remains central. Selected spans carry distinct highlight colours; dotted leaders connect them to small temporal views with peak markers and counts.",
    transfer: "Keep language intact while making its exact parts addressable. Evidence belongs to a specified span and performs a named function. Small views carry their own unit, denominator, period and source.",
    limit: "Word frequency describes representation within a corpus. It does not verify the quoted allegation, describe a person's character or measure how often an event occurs.",
    href: "/grammar/relations",
  },
  {
    id: "proof-block",
    n: "07",
    name: "Proof block and marginal inquiry",
    line: "The proposition has an exposed underside.",
    observed: "Ruled bands separate argument functions. Metadata declares block type, degree and option state. Highlighted phrases become handles; handwritten margins question legitimacy, coupling, failure, dependencies and escalation.",
    transfer: "Give the argument a stable spine and the inquiry an addressable margin. Every proposed realisation carries its prerequisites, foreclosed options, new dependencies and a test that could reopen it.",
    limit: "Axiom names, subscripts, degree labels and highlighter colour organise an argument. Their appearance confers no empirical verification, institutional authority or investment readiness.",
    href: "/grammar/proof",
  },
];

/** The source operation and the depth it adds. */
export const referenceGrammars = [
  { grammar: "Spatial score", unit: "Reading event", adds: "Authored attention, suspension and rereading", where: "Page grammar + score analysis", href: "/grammar/page" },
  { grammar: "Evidence constellation", unit: "Exact source span", adds: "Inspection without dissolving the utterance", where: "Evidence Mantle", href: "/grammar/relations" },
  { grammar: "Situated atlas", unit: "Account across encounters", adds: "Time, movement, maintenance and lived friction", where: "Two-route cooling atlas", href: "/grammar/atlas" },
  { grammar: "Proof block", unit: "Proposition and its conditions", adds: "Dependencies, thresholds, losses and contestation", where: "Ruled working sheet", href: "/grammar/proof" },
  { grammar: "Material world", unit: "Body within an inhabited field", adds: "Atmosphere, construction logic and cross-scale coherence", where: "World grammar", href: "/grammar/compose" },
] as const;

export const referenceDepths = [
  "Presence at first encounter.",
  "Relations on closer reading.",
  "Conditions under inspection.",
] as const;
