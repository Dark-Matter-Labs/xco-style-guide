// Material worlds (§08B) and choosing a form by the question (§12).
//
// From the xCO Polyphonic Communication Style Guide v8.1. A world becomes
// persuasive through relationships that hold from a seam to a horizon. The
// question-to-form guide closes the loop: begin with the question, choose a
// dominant form, then bring in a companion where it reveals another relation.

export const materialWorldIntro = {
  title: "Let the body and the field share a logic.",
  line: "A world becomes persuasive through relationships that hold from a seam to a horizon.",
  body: "Give a world an operating vocabulary. Decide how its forms enclose, connect, bear weight, move, weather and receive repair. A material relation repeated across scales gives the imagination something to inhabit. Leave enough unresolved for the world to remain capable of becoming.",
  status: "An authored world specimen describes no realised settlement, viable engineering or measured flow. Keep its status legible.",
} as const;

export const materialWorldSteps = [
  { id: "silhouette", line: "Begin with a legible body.", body: "Choose a few forms that stay recognisable at first glance. Give each a posture, a boundary and a relation to its setting. Large masses carry presence; detail can accumulate inside them." },
  { id: "anatomy", line: "Repeat a construction rule.", body: "Use seam, rib, compartment, membrane, joint and tether to make how a world holds together visible. Repetition means something when the parts share a local material logic." },
  { id: "field", line: "Let the whole remain inhabited.", body: "Use distant marks, ordinary activity and smaller linked forms to make the foreground belong to a wider world. Keep some marks unresolved." },
] as const;

/** World grammar — choices to establish before production. */
export const worldGrammar = [
  { dimension: "Body and agency", choice: "Living form, constructed form, landscape, collective or their entanglement", clear: "Which voices are sourced and which are imagined" },
  { dimension: "Material logic", choice: "Membrane, rib, weave, porous mass, joint, current, weathering or repair", clear: "Whether marks are expressive or assert an operating mechanism" },
  { dimension: "Warm–cool volume", choice: "Warm lit mass, cool underside, mineral background and one concentrated event", clear: "Hue and light do not encode temperature or risk without a declared scale" },
  { dimension: "Fine linework", choice: "Uneven, intricate local detail around a stable large silhouette", clear: "Detail is not a schematic specification unless produced and labelled as one" },
  { dimension: "Scale", choice: "Body, neighbourhood field and distant horizon share a repeated vocabulary", clear: "Apparent size does not become quantitative comparison without a reference" },
  { dimension: "Time", choice: "Continuation, unfolding, interruption, weathering or return", clear: "Still frames illustrate a reading; motion needs its own temporal contract" },
] as const;

/** A usable image brief — complete the relation, then choose the medium. */
export const imageBrief =
  "Show [a subject] within [an inhabited field]. Give both [a shared material vocabulary]. Use [warm and cool relationships] to make [volume or attention] perceptible. Let [the smallest detail] repeat in [the wider setting]. Keep [the central relation] legible and [the unresolved possibility] open. Declare the image as [observed / reconstructed / generated / expressive / modelled].";

export const imageBriefMedium =
  "Expressive raster imagery can carry texture and atmosphere; native vector or code can carry precise geometry and editable marks. Technical diagrams and measured data keep their own production and validation requirements.";

export const materialWorldClose = ["A seam belongs to a body.", "A body belongs to a field.", "The field remains unfinished."] as const;

// ── Choose by the question (§12) ─────────────────────────────────────

export const questionToForm = [
  { question: "What thought could open another future?", form: "Spatial score", licence: "Encounter", keep: "The complete proposition, reading hinge, delay and the question the encounter opens.", companion: "A Material World gives the possibility presence; a linked explanation exposes its grounds and conditions." },
  { question: "What bears on these exact words?", form: "Evidence constellation", licence: "Explanation", keep: "The source span, evidence function, method, units, scope and limits.", companion: "A Reasoning Lineage explains how evidence enters a claim and which inference remains open." },
  { question: "What changes as someone encounters a pathway?", form: "Situated Atlas", licence: "Explanation", keep: "Distinct accounts, sequence, waits, thresholds, missing steps and the work of continuation.", companion: "A Service Score shows who sustains each encounter; an Inquiry Field names the conditions to examine." },
  { question: "What must hold for a construction to become real?", form: "Proof Block", licence: "Explanation", keep: "Premises, dependencies, defined transitions, lost options, new burdens and a reopening test.", companion: "An addressable margin brings in an objection or alternative; the lineage keeps the grounds of the construction." },
  { question: "What kind of inhabited world could become imaginable?", form: "Material World", licence: "Encounter; Explanation when discussing its construction", keep: "The body–field relation, recurring material vocabulary, media status and accessible description.", companion: "A spatial score names the conjecture. Exact diagrams or sourced accounts can explain selected relations within it." },
  { question: "What concrete change is someone being asked to authorise?", form: "Decision Surface", licence: "Decision", keep: "The actor, action, authority, resources, consequences, alternatives, refusal and review.", companion: "The linked proof, atlas and inquiry record disclose the basis. Their expressive treatment gives way to a clear operative choice." },
] as const;

export const formCompositions = [
  { name: "A public proposition", line: "Keep the conjecture alive.", body: "A score opens the question; an inhabited image lets its possibility be felt. A linked proof block exposes what the proposition assumes and what it would foreclose. Mark the move into explanation so readers can approach the thought at more than one depth." },
  { name: "A lived capability", line: "Follow the encounter into its work.", body: "Keep an exact account central, then use the atlas to inspect a threshold. Link that step to the Service Score's handoff and the Inquiry Field's condition. If a commitment follows, give it a discrete Decision Surface and a named return to the contributors." },
] as const;
