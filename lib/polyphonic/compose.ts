// Material attention and composing — how a composition is made, and learns.
//
// From the xCO Polyphonic Communication Style Guide v8.1, §08 and §12 (the
// material-world grammar of §08B and the question-to-form guide live in
// worlds.ts).
// §08 gives image, texture, light and motion an explicit grammar: a
// composition may carry a felt surplus that exceeds a verbal account, while
// every image declares its status. §12 turns the grammar into a method —
// compose, test with readers, revise — and a brief to copy.

// ── Material attention (§08) ─────────────────────────────────────────

export const materialAttention = {
  claim: "Let the world be felt as unfinished.",
  aim:
    "Compose for steadiness, receptivity, curiosity, tenderness or courage. Give attention somewhere to remain. These are intended effects to examine with readers; no texture or colour produces them reliably on its own.",
  disposition: "Steady enough to attend. Open enough to be changed. Capable enough to participate.",
} as const;

export const materialPrinciples = [
  {
    name: "Expressive purpose",
    rule: "A felt surplus",
    detail: "A composition may carry associations that exceed a complete verbal description. Discuss its purpose at the level of the encounter.",
  },
  {
    name: "Epistemic boundary",
    rule: "Name the image's status",
    detail: "Keep observed records, reconstructions, generated images and quantitative displays distinguishable.",
  },
] as const;

export const materialTreatments = [
  {
    name: "Image / integrity",
    rule: "Keep a subject recognisable.",
    detail:
      "When transforming a source image, preserve the subject's relevant identity, posture and material relationships unless the brief explicitly changes them. Keep the source and transformation history available. Fragmentation can disclose multiplicity while retaining a person's integrity.",
  },
  {
    name: "Texture / resolution",
    rule: "Let parts and wholes coexist.",
    detail:
      "Halftone, grain and pixel edges can invite movement between detail and a larger pattern. Decide what that change of attention contributes here. A beautiful point field remains expressive unless its values and method actually encode information.",
  },
  {
    name: "Light / possibility",
    rule: "Give an opening presence.",
    detail:
      "A local increase in intensity can make an emerging relationship encounterable. Keep enough quiet around it for the signal to have force. Hope can appear through maintained conditions, unfinished structures and the availability of further participation.",
  },
  {
    name: "Motion / time",
    rule: "Let movement explain its relation.",
    detail:
      "Use motion to reveal an ordered change, a delayed effect, a return or continuing work. Name whether time is measured, simulated or expressive. Prefer reader-controlled steps when order matters; provide a complete still account and respect reduced-motion preferences.",
  },
] as const;

/** Working with imagery — the practical contract, by image status. */
export const imageryContract = [
  {
    status: "Observed",
    detail:
      "Record source, date, place, author, relevant permissions and transformations. State what the frame excludes. An authentic image does not by itself establish a proposed mechanism or a person's interpretation.",
  },
  {
    status: "Reconstructed",
    detail:
      "Identify what was reconstructed, which sources informed it and what was inferred. Preserve an inspection route to the underlying material. Do not let documentary styling erase the reconstruction's status.",
  },
  {
    status: "Generated",
    detail:
      "Identify the work as generated where readers could otherwise take it as a record. Retain the brief and relevant source references in the author record. Describe its expressive purpose and avoid giving its imagined subjects the standing of real testimony.",
  },
  {
    status: "Modelled",
    detail:
      "State the data, model, transformations, units, scope, uncertainty and validation. Use line, labels and legends consistently. Make clear which visible marks encode values and which provide expressive framing.",
  },
] as const;

// ── Compose / test / revise (§12) ────────────────────────────────────

export const composeIntro = {
  claim: "Build a composition that can learn.",
  method:
    "Keep one accountable account of the material. Give readers several ways to encounter it. Form, pacing and depth may change while source fidelity, epistemic status and rights remain recoverable.",
  machine:
    "Machine assistance can help maintain exact references, explore alternative compositions, propagate declared dependencies and check consistency. It can propose a framing; the author remains responsible for adopting it, representing voices and judging what the work does in the world.",
  validation:
    "Technical checks can examine consistency. Actual reader understanding, affect and burden require evaluation with people.",
} as const;

export const compositionSteps = [
  {
    n: "01",
    step: "Set a generative purpose.",
    detail:
      "Name the intended audience and what the composition could help them notice, distinguish, question, imagine or undertake. Include legitimate outcomes such as disagreement, rest or a considered pause. Identify who could carry new burdens.",
  },
  {
    n: "02",
    step: "Declare the question and commitments.",
    detail:
      "State what gives the inquiry direction, who established the scope and what remains open. Distinguish a normative commitment from an empirical claim, a strategic hunch or an authorised action.",
  },
  {
    n: "03",
    step: "Preserve the accounts.",
    detail:
      "Give exact sources and situated claims stable identities. Record who speaks, what supports the account, its limits and any represented absence. Preserve disagreement when composing the shared framing.",
  },
  {
    n: "04",
    step: "Choose the relation and its form.",
    detail:
      "Use the question-to-form guide to select a dominant grammar and any useful companion. Name the licence and the unit each form handles. Establish a local reading for type, image, colour, space and interaction. Compose an accessible route alongside the expressive surface, keeping shared addresses steady.",
  },
  {
    n: "05",
    step: "Make inquiry inspectable.",
    detail:
      "Name assumptions, warrants, operating conditions, counterconditions and authority boundaries. A proof block exposes a proposed construction; an atlas locates encounters and waits; a marginal inquiry gives a question its exact target and voice. Any interactive change follows an explicit rule and reports what it changed. A hypothetical branch retains its hypothetical status.",
  },
  {
    n: "06",
    step: "Bound any commitment.",
    detail:
      "Specify actor, authority, action, resource change, scope, duration, affected parties, uncertain effects and remedy. Keep refusal and revision legible. Inquiry itself requires appropriate authority and resources when it changes institutional state.",
  },
  {
    n: "07",
    step: "Test with intended readers.",
    detail:
      "Ask what they understood and how they reached it before explaining the intended reading. Examine omissions, unexpected meanings, emotional effects, burden and ease of return. Compare the benefit of the expressive composition with a straightforward account of the same material.",
  },
  {
    n: "08",
    step: "Revise the form and the question.",
    detail:
      "Record what the encounter changed. It may require a different composition, a new source, a revised model or a reframed purpose. Changes to commitments follow the applicable decision rights. Preserve previous interpretations in the revision history.",
  },
  {
    n: "09",
    step: "Release for use, then learn from use.",
    detail:
      "Content and implementation checks: confirm exact targets, declared relation types, dependency consistency, source status, accessible equivalents and action boundaries; inspect narrow and wide compositions, keyboard behaviour, print and the absence of scripts. Reader evaluation: ask someone to recover the question, distinguish source from inference, explain a dependency, recognise what remains uncertain and identify their actual choices. Discuss what the composition invited them to feel or attend to. Record differences across readers without inventing a universal reading.",
  },
] as const;

export const failureIsInformative =
  "If the work produces intimidation, confusion, false confidence or pressure to participate, identify what creates that effect. Revise the composition or its premise. Fluency, aesthetic coherence and software correctness cannot establish legitimacy or reader benefit.";

/** The compact composition brief — copy and adapt (§12). 7.1 added form, addresses, keys, margin, proof, atlas and world. */
export const compositionBrief = [
  { field: "Purpose", prompt: "What could someone become more capable of?" },
  { field: "People", prompt: "Who encounters this, who speaks, who is affected or absent?" },
  { field: "Question", prompt: "What is shared, and what may change?" },
  { field: "Commitments", prompt: "Which purposes hold the inquiry; who established them?" },
  { field: "Accounts", prompt: "Exact sources, claims, distinct positions and limits." },
  { field: "Relations", prompt: "Semantic, evidential, inferential, material or institutional?" },
  { field: "Generative operation", prompt: "What does this composition make possible?" },
  { field: "Licence", prompt: "Encounter, Explanation, Decision — and visible transitions." },
  { field: "Form", prompt: "Dominant grammar, companion form and the question each reveals." },
  { field: "Addresses", prompt: "Scoped source, span, condition, route, block and annotation IDs." },
  { field: "Local keys", prompt: "The roles of highlight, line, position, scale and image." },
  { field: "Margin", prompt: "Exact versioned target, voice, origin, question and response state." },
  { field: "Proof", prompt: "Premises, construction, defined degree, losses, burdens and fallback." },
  { field: "Atlas", prompt: "Distinct routes, encounters, waits, gaps, scale and return." },
  { field: "World", prompt: "Subject, field, shared material language and unresolved possibility." },
  { field: "Media", prompt: "Source or generated status; what the treatment contributes." },
  { field: "Inquiry", prompt: "Assumptions, warrants, dependencies and revision triggers." },
  { field: "Commitment boundary", prompt: "Authority, resources, rights and uncertain effects." },
  { field: "Recovery", prompt: "Linear, narrow, non-visual, still and print routes." },
  { field: "Reader evaluation", prompt: "Intended benefit, unexpected readings and burden." },
  { field: "Stewardship", prompt: "Owner, review date, version, corrections and supersession." },
] as const;

/** The brief as plain text, for copying into a document. */
export function compositionBriefText(): string {
  return ["COMPOSITION / ID / VERSION / DATE", ...compositionBrief.map((b) => `${b.field}: ${b.prompt}`)].join("\n");
}
