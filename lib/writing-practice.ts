// Writing practice — what a writer does before an xCO text goes out.
//
// The voice principles (voice-principles.ts) say who xCO is when it writes.
// These practices are the working habits that get a draft there. They come
// from team feedback (Sarah, October 2026), with Indy's caveat on
// attribution, and are aligned with Dark Matter Labs' publishing standards —
// the Style & Standards, Attribution and AI Usage guides — so an xCO text
// meets Dm's bar as well as its own. Where Dm already has the practice, this
// points to it rather than restating it differently.
//
// One deliberate difference: Dm's house convention is British English; xCO's
// is US English (see the house rules). Everything else here follows Dm.

export interface WritingPractice {
  id: "brevity" | "audience" | "attribution" | "positionality" | "pause";
  name: string;
  line: string;
  body: string;
  /** Guard against the practice's own failure mode. */
  guard: string;
  /** The question the writer answers before the text goes out. */
  question: string;
  source: string;
}

export const writingPractices: WritingPractice[] = [
  {
    id: "brevity",
    name: "Brevity",
    line: "Say what we mean, and nothing more.",
    body: "Brevity is a structuring principle, not a final polish. Take a red pencil to every draft: cut what repeats, what restates, and what only sounds like thinking. Repeat only on purpose — a refrain, a recap the reader needs — never by accident.",
    guard: "Cut words, not complexity. If the edited text is tidier than the reality it describes, it has lost something: keep the uncertainty, the disagreement and the critical perspectives (Dm's complexity check).",
    question: "What can go without losing the argument?",
    source: "Team feedback (Sarah); Dm Style & Standards §2",
  },
  {
    id: "audience",
    name: "Audience",
    line: "Name the one reader.",
    body: "Decide who before how. Most pieces have several possible readers but one primary one — the person whose understanding or action the piece is meant to change. Name them when drafting and when substantially revising, and let them set the register, the length and the channel.",
    guard: "Writing for everyone serves no one. Answer Dm's four questions at the top of the draft, then delete them before publishing: who must this reach; what should they do, feel or question; what is at stake for them; where will they meet it, and with how much attention?",
    question: "Who is this for, and what should change for them?",
    source: "Team feedback (Sarah); Dm Style & Standards §1",
  },
  {
    id: "attribution",
    name: "Attribution",
    line: "Show the field we are part of.",
    body: "Link out to the work this builds on — Dm's own and the references we respect, are inspired by, trust or seek to challenge. It shows xCO as part of a wider field it contributes to, not a voice on its own. Hyperlink to originals; credit conversations and unpublished work that shaped the argument.",
    guard: "Full fairness is not possible in an age of mass proliferation of writing (Indy). Attribute in good faith, name what the work most directly draws on, say that the lineage is partial, and invite additions. Never invent a source to fill a gap: mark it [source needed].",
    question: "Whose work does this draw on that is not yet named?",
    source: "Team feedback (Sarah), with Indy's caveat; Dm Attribution Guide",
  },
  {
    id: "positionality",
    name: "Positionality",
    line: "For signed work, say where we write from.",
    body: "A signed piece is written by someone, from somewhere. Named authors consider their positionality and include it where it helps the reader place the argument — avoiding the quiet universalising of one largely Anglo-European worldview.",
    guard: "Declaring is the default for public-facing work, but a judgment, not a rule — and on contested questions it can carry real personal risk. Weigh it with others before publishing; it is not a burden for the author alone.",
    question: "Where am I writing from, and does the reader need to know?",
    source: "Team feedback (Sarah); Dm Style & Standards §4",
  },
  {
    id: "pause",
    name: "The pause",
    line: "Stop before it ships.",
    body: "Co-creating with AI should leave room for the people writing to stop and think critically about what they are producing. Every AI-assisted draft ends with questions for the writer, not answers — and a human reads it as a critical editor, not a recipient. This is the point at which the work becomes ours.",
    guard: "Fluency is not accuracy. Verify every citation, figure and claim against its source; check the argument is ours and not merely well structured; declare AI use in the credit block.",
    question: "Is this what we actually think — and would we stand behind every line?",
    source: "Team feedback (Sarah); Dm AI Usage Guide",
  },
];

export const practiceSource =
  "From team feedback (Sarah, October 2026), with Indy's caveat on attribution — aligned with Dark Matter Labs' Style & Standards, Attribution and AI Usage guides.";

/** The pause, as the questions an AI-assisted draft must end with. */
export function pauseQuestions(): string[] {
  return writingPractices.map((p) => p.question);
}

/** The practices as Markdown — appended to the voice export for the wiki. */
export function practiceMarkdown(): string {
  return [
    "## Writing practice — before it goes out",
    "",
    `*${practiceSource}*`,
    "",
    ...writingPractices.flatMap((p) => [
      `### ${p.name}: ${p.line}`,
      "",
      p.body,
      "",
      `> ${p.guard}`,
      "",
      `**Ask:** ${p.question}`,
      "",
    ]),
  ].join("\n");
}
