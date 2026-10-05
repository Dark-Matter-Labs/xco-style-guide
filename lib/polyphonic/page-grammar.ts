// The page as visual grammar (§04D), and the questioning margin (AN).
//
// From the xCO Polyphonic Communication Style Guide v8.1. A spacious field, a
// precise spine, a living margin and a concentrated mark. The page's identity
// comes from these operations, not from a motif.

export const pageGrammarIntro = {
  title: "Make the page think in layers.",
  line: "A spacious field, a precise spine, a living margin and a concentrated mark.",
  body: "The editorial page holds a proposition long enough for someone to encounter it, then provides ways to inspect what supports, complicates or changes it. Its character comes from contrast between large language and fine structure, quiet ground and exact chromatic events, stable argument and unresolved inquiry.",
  operations: "Use whitespace to stage a relation. Use a rule to separate functions. Use a highlight to make a phrase addressable. Use the margin for a voice that changes how the spine is read.",
  edge: "Preserve the proposition's radical edge. Friction earns its place when it invites a different question, reveals an excluded relationship or makes a consequence harder to evade. A conjecture can be stated with force while its assumptions and grounds for doubt remain open to inspection.",
} as const;

/** The six layers, in the order a reader meets them. */
export const pageLayers = [
  {
    id: "field",
    line: "Give the thought room.",
    body: "Use a warm paper field for close reasoning and a cool deep field for material or systemic immersion. Establish a dominant quiet area before adding traces. Every increase in density needs a reader path.",
  },
  {
    id: "spine",
    line: "Keep the proposition recoverable.",
    body: "A score can displace its fragments; a working sheet keeps sentences in a dependable reading column. Compose the complete source or claim in the DOM before any spatial treatment. Titles, observations and commitments need different degrees of fracture.",
  },
  {
    id: "rule",
    line: "Separate a function.",
    body: "Thin horizontal rules distinguish axiom, construction, condition, transition and review. Orthogonal leaders connect a precise span to a satellite; curved trajectories carry movement through encounters. Declare each connector's local function.",
  },
  {
    id: "mark",
    line: "Make a phrase inspectable.",
    body: "Prefer a short rectangular highlight behind exact language, with dark text on a light fill. Highlight the whole semantic operand. A coloured block cannot substitute for the phrase's source, status or relation label.",
  },
  {
    id: "margin",
    line: "Let another reading intervene.",
    body: "A margin may carry a question, objection, dependency, affected account or failure condition. Give it a stable target and a source or authoring status. Essential conditions also remain in the sequential account.",
  },
  {
    id: "return",
    line: "Keep the object open to revision.",
    body: "Provide a path back to the exact sentence, node or condition. When an annotation changes the claim, show the change and keep the previous wording in the author record.",
  },
] as const;

/** P7 — the authored encounter specimen. Field → spine → margin → return. */
export const pageSpecimen = {
  id: "P7",
  lines: ["A shared future", "is", "held open", "through the work", "of remaining", "answerable."],
  /** Index of the line carrying the highlight (capability role). */
  marked: 2,
  /** Index of the italic terminal word. */
  terminal: 5,
  reading:
    "The highlight names the proposed capability; angle brackets make it available for examination. The final italic word changes holding from possession into continuing responsibility. An authored proposition, with no implied agreement from its reader.",
} as const;

/** AN — the questioning margin. Four parts make an intervention addressable. */
export const annotationContract = [
  {
    part: "Target",
    line: "Name the object.",
    body: "Attach the annotation to a stable proposition, exact span, condition, route step or transition, with its wording and version recoverable. Placement helps the eye; the address keeps the relation when the page changes.",
  },
  {
    part: "Voice",
    line: "Keep the speaker present.",
    body: "Record whose question this is and whether it is quoted, adapted or authored. If the source is handwritten, keep its words in a selectable transcription as well.",
  },
  {
    part: "Function",
    line: "Say what it opens.",
    body: "Declare the role: question, objection, missing account, dependency, alternative or proposed revision. The note's relation to the claim survives without its colour or position.",
  },
  {
    part: "Return",
    line: "Record what changes.",
    body: "An unanswered question remains a question. A response can add an account, amend an assumption or replace a construction; record it at the target, keeping the previous wording available.",
  },
] as const;

export const annotationRecord =
  "For reuse, keep an annotation ID, typed target, target version, exact quotation where relevant, voice and origin, role, text, source links, response state and revision effect.";

/** Typography and composition — practical starting values. */
export const pageStartingValues = [
  { layer: "Encounter title", treatment: "Editorial serif · 56–138 px wide, 43–86 px narrow · 0.94–1.1 line height", purpose: "One clear attractor, an authored hinge, a terminal reveal", constraint: "Explicit narrow composition; complete sentence recoverable" },
  { layer: "Reading spine", treatment: "Serif · 18–22 px · 1.55–1.7 line height · about 55–70 characters", purpose: "Sustained argument and situated speech", constraint: "Readable at the actual viewport and at zoom" },
  { layer: "Operations & captions", treatment: "Sans · 13–16 px · 1.5–1.7 line height", purpose: "Instructions, limits, handoffs and source context", constraint: "Core content uses body scale; captions stay legible" },
  { layer: "Identity & state", treatment: "Mono · 11–13 px · compact labels, modest tracking", purpose: "Stable IDs, declared state and local notation", constraint: "Important state also has an ordinary-language description" },
  { layer: "Marginal voice", treatment: "Italic serif · 17–20 px · separate rail or return block", purpose: "Questioning, stance and situated intervention", constraint: "Source and target explicit; nothing essential in image-only handwriting" },
  { layer: "Fine structure", treatment: "0.75–1.5 px rules; 2–3 px selected paths", purpose: "Orient the field without competing with the proposition", constraint: "Essential lines have sufficient contrast and a text equivalent" },
  { layer: "Space", treatment: "4 / 8 / 12 / 16 / 24 / 36 / 56 / 88 / 144 px", purpose: "Proximity, pause, separation and return", constraint: "Starting points; distance never silently encodes measured time" },
] as const;

/** How the page changes with the licence. */
export const pageByLicence = [
  { licence: "encounter", line: "One attractor. A bounded disruption. A terminal recoding. Enough silence for the relation to be felt." },
  { licence: "explanation", line: "A stable spine. Exact anchors. Selective satellites. Depth that unfolds while identity remains fixed." },
  { licence: "decision", line: "Ordinary-language action. Consequences nearby. Refusal and revision equally readable. Relevant uncertainty before commitment." },
] as const;

export const highlightKeyRule =
  "Identity, domain, route, phrase and status have different jurisdictions. Declare the key where it becomes relevant; if two must coexist in one diagram, separate their channels with labels, position, shape or line syntax. Colour never establishes truth or permission.";
