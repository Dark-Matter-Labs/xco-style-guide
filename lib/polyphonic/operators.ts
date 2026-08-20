// Operator grammar — marks have affordances, operations create effects.
//
// From the xCO Polyphonic Communication Style Guide v5, §03A.
// Replaces a universal punctuation dictionary with a contextual operator
// grammar. The primary rule: operator + operand + context. A mark must be
// interpreted as an action upon a specific utterance, never as an isolated
// token.

export const operators = [
  {
    id: "tag",
    operation: "TAG / ENCLOSE",
    does: "Makes a term typed, bounded or addressable",
    enactment: "Person becomes category, object or data field",
    risk: "Datafication; false closure",
    recovery: "Name who typed it, for what purpose and with what contestability",
  },
  {
    id: "index",
    operation: "INDEX / ADDRESS",
    does: "Makes an exact span joinable without rewriting it",
    enactment:
      "A source phrase becomes the target of semantic or evidential inspection",
    risk: "Addressability mistaken for truth, support or consent",
    recovery:
      "Preserve exact wording, assign a stable span ID and declare every relation function",
  },
  {
    id: "protocolise",
    operation: "PROTOCOLISE / ROUTE",
    does: "Converts speech or affect into a processable state",
    enactment: "Concern becomes input, ticket or executable condition",
    risk: "Depoliticisation; procedural capture",
    recovery: "Preserve the human claim and identify the receiving institution",
  },
  {
    id: "voice",
    operation: "VOICE / PERFORM",
    does: "Changes cadence, embodiment or stance",
    enactment: "A word performs movement, doubt or intimacy",
    risk: "Generic emphasis; aestheticised vulnerability",
    recovery: "Explain the voiced position where it affects interpretation",
  },
  {
    id: "fragment",
    operation: "FRAGMENT / TOKENISE",
    does: "Makes a whole separable and reassemblable",
    enactment: "Identity becomes voice + face + performance",
    risk: "Reproducing the extraction being criticised",
    recovery: "Restore the whole subject and disclose why decomposition matters",
  },
  {
    id: "isolate",
    operation: "ISOLATE / SUSPEND",
    does: "Withholds completion across space or time",
    enactment: "A stranded preposition delays cause, purpose or beneficiary",
    risk: "Obscured agency; accidental confusion",
    recovery: "Reward the delay with a defensible terminal reveal",
  },
  {
    id: "scale",
    operation: "SCALE / WEIGHT",
    does: "Creates an attractor or enacts relative force",
    enactment: "A terminal agent looms over preceding fragments",
    risk: "Unsupported importance or intimidation",
    recovery: "Declare whether scale means attention, power, scope or quantity",
  },
  {
    id: "rotate",
    operation: "ROTATE / MARGINALISE",
    does: "Moves a voice onto another orientation or control plane",
    enactment: "Institutional instruction frames a human question from the edge",
    risk: "Hidden consequence; illegible control",
    recovery: "Never rotate indispensable rights, actions or refusal",
  },
  {
    id: "erase",
    operation: "ERASE / PASSIVISE",
    does: "Withholds actor, source or responsibility",
    enactment: "Uncertainty becomes visible — or agency disappears",
    risk: "Burden shifting; manufactured opacity",
    recovery:
      "Label agent unknown, contested, withheld or deliberately out of scope",
  },
  {
    id: "reveal",
    operation: "REVEAL / RECODE",
    does: "Introduces a late term that changes prior meaning",
    enactment: "The endpoint makes earlier syntax readable as capture",
    risk: "Cheap twist; retrospective confusion",
    recovery: "The second reading must deepen rather than invalidate the first",
  },
  {
    id: "connect",
    operation: "CONNECT / ENTANGLE",
    does: "Makes dependency, recursion or mutual constitution visible",
    enactment: "A claim enters a field of constraints and feedbacks",
    risk: "False causality; decorative systems language",
    recovery: "Name every relation and distinguish evidence from inference",
  },
] as const;

export type Operator = (typeof operators)[number];

// The six-part local notation contract every composition must declare (§03A).
export const notationContract = [
  { n: "01", field: "Operation", detail: "The visible sign, type shift, spatial move or line." },
  { n: "02", field: "Exact operand", detail: "The word, claim, actor or state transformed." },
  { n: "03", field: "Performed meaning", detail: "What the operation does to that object here." },
  { n: "04", field: "Licensed resonance", detail: "Compatible secondary readings activated by context." },
  { n: "05", field: "Prohibited implication", detail: "What the treatment must not be taken to mean." },
  { n: "06", field: "Recoverable route", detail: "Accessible sentence, note, caption or relation transcript." },
] as const;

// Worked transcript — every visible relation also needs a sentence transcript.
export const operatorWalkthrough = [
  { step: "Utterance", form: "a living system", meaning: "The starting semantic object" },
  { step: "Tag", form: "<living_system>", meaning: "Made typed and addressable" },
  { step: "Fragment", form: "soil / water / labour", meaning: "Made separable" },
  { step: "Route", form: "risk → ledger", meaning: "Made institutionally processable" },
  { step: "Question", form: "what disappeared?", meaning: "Exposes semantic loss" },
  { step: "Recover", form: "restore the relations", meaning: "Returns the whole without erasing the analysis" },
] as const;

// ── Spatial operators (§03B, Reference A) ────────────────────────────
// Space is an operator too. Each spatial act carries a governing question.

export const spatialOperators = [
  {
    act: "Whitespace",
    work: "Latency, absence, vulnerability, causal distance, exclusion, withheld agency",
    question: "What is being delayed, separated or made the reader search for?",
  },
  {
    act: "Line break",
    work: "Suspend, detach, reclassify, accelerate, bind retrospectively",
    question: "What logical relationship changes because the phrase breaks here?",
  },
  {
    act: "Peripheral term",
    work: "Foreshadowing, control, institutional authority, dissent",
    question: "Does it cast an anticipatory shadow or hide an operative consequence?",
  },
  {
    act: "Terminal term",
    work: "Release, beneficiary, cause, agent, reinterpretation",
    question: "Does it deepen the second reading rather than merely surprise?",
  },
  {
    act: "Rotation",
    work: "Different jurisdiction, orientation or authority",
    question:
      "Can the reader recover it without physically struggling to access a right or action?",
  },
  {
    act: "Scale",
    work: "Attraction, force, scope, power, proximity",
    question: "Which meaning is intended — and is it declared?",
  },
] as const;

// ── Attention score (§03B) ───────────────────────────────────────────
// Hierarchy is an attractor field, not only a ladder.

export const attentionBeats = [
  { n: "01", beat: "Entry", detail: "Silence and first address establish exposure, latency or scale." },
  { n: "02", beat: "Attractor", detail: "One or two elements disclose the stakes and recruit retrieval." },
  { n: "03", beat: "Hinge", detail: "Registers interfere; the conceptual relation changes state." },
  { n: "04", beat: "Terminal recode", detail: "Suspension resolves and the endpoint reframes what came before." },
  { n: "05", beat: "Aftermath", detail: "Countervoice, institutional action, refusal or repair route becomes visible." },
] as const;

// Design probes — validate with readers; these are heuristics, not laws.
export const readingProbes = [
  { at: "One second", goal: "Reveal the stakes", detail: "The dominant attractors identify the tension or terminal object." },
  { at: "Five seconds", goal: "Recover the proposition", detail: "The reader can reconstruct the sentence and recognise its hinge." },
  { at: "Twenty seconds", goal: "Expose the politics", detail: "Countervoice, absent actor, institutional rail and requested action become legible." },
] as const;
