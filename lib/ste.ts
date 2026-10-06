// The plain register — Simplified Technical English, applied by licence.
//
// Adapted from asd-ste100-skill by Dustin Yuchen Teng (MIT, see
// licenses/asd-ste100-skill.LICENSE), which encodes the rule categories of
// ASD-STE100 Issue 9 (January 2025). Like that skill, this applies the
// structural rules and treats the lexical rules as a direction of travel: it
// does not reproduce ASD's approved dictionary, and it is not certified STE.
//
// How it meets the xCO voice: STE is flat and literal on purpose. It belongs
// where a wrong reading has a cost — a decision, an instruction, a prompt an
// agent will follow. The Polyphonic licences already draw that line, so the
// mode follows the licence. Encounter writing keeps its voice.
//
// One rule the two systems share outright: keep modality. A hedge carries the
// writer's confidence, and confidence is content. The linter never flags
// "may", "might" or "could", and a rewrite must never turn "may have failed"
// into "failed".

export type SteMode = "strict" | "flavoured" | "exempt";

export const steModes = [
  {
    mode: "strict" as const,
    licence: "decision",
    label: "Strict",
    applies: "Decision text, instructions and procedures, UI copy, error messages, consent and action labels, agent prompts and tool descriptions.",
    rule: "Apply every structural rule. Sentences of 20 words or fewer. One instruction per sentence. One word for one action, every time.",
    cap: 20,
  },
  {
    mode: "flavoured" as const,
    licence: "explanation",
    label: "STE-flavoured",
    applies: "Explanations, wiki pages, READMEs, changelogs, reports and briefings — the Method register.",
    rule: "Apply the structural rules: 25 words or fewer, active voice, no semicolons, no phrasal verbs, verbs not nominalizations. Vocabulary rules are advisory — prose needs some range.",
    cap: 25,
  },
  {
    mode: "exempt" as const,
    licence: "encounter",
    label: "Exempt",
    applies: "Encounter compositions — titles, scores, provocations, essays where voice is the point — and the Hunch register.",
    rule: "STE does not apply. The voice principles and the writing practices still do. Mark the move into explanation when a piece changes licence.",
    cap: null,
  },
] as const;

/** Rules this site can check without ASD's dictionary. */
export const steStructuralRules = [
  { id: "active-voice", name: "Active voice", do: "The steward reviews the change.", dont: "The change is reviewed.", note: "Passive is allowed in description when the actor is unknown or irrelevant." },
  { id: "phrasal-verb", name: "No phrasal verbs", do: "Start the inquiry. Contact the steward.", dont: "Kick off the inquiry. Reach out to the steward." },
  { id: "one-instruction", name: "One instruction per sentence", do: "Open the record. Read condition A2.", dont: "Open the record and read A2, then check whether it still holds." },
  { id: "length", name: "Sentence length", do: "≤ 20 words for instructions, ≤ 25 for descriptions.", dont: "Long chains of subordinate clauses." },
  { id: "semicolon", name: "No semicolons", do: "Split into two sentences.", dont: "Any semicolon. (The em dash is allowed, but often marks a sentence to split.)" },
  { id: "noun-cluster", name: "Short noun clusters", do: "the review of the cooling-room access condition", dont: "the cooling room access condition review record" },
  { id: "modality", name: "Keep modality", do: "The route may be unusable.", dont: "The route is unusable. — when the source said “may”." },
  { id: "lists", name: "Lists for sequences", do: "A numbered list for three or more steps or conditions.", dont: "A sequence buried in one sentence." },
  { id: "paragraph", name: "Short paragraphs", do: "One topic, six sentences or fewer.", dont: "Several topics in one block." },
] as const;

/** Lexical rules — a direction of travel, not a compliance claim. */
export const steLexicalRules = [
  { name: "One word, one meaning", detail: "Pick one verb for one action and reuse it. Do not rotate check / verify / confirm for the same act." },
  { name: "Verb, not noun", detail: "“Analyze the record”, not “perform an analysis of the record”. The noun hides who acts." },
  { name: "Define necessary terms", detail: "Keep a domain term the reader needs — optionality, licence, Inquiry Field — and define it once. STE allows a project glossary." },
] as const;

// ── Linter ───────────────────────────────────────────────────────────
// Regex heuristics, not a parser — ported from ste-lint.py. It flags places
// to look, and never hedges or modality.

export type SteLevel = "rule" | "advisory";

export interface SteFinding {
  rule: string;
  level: SteLevel;
  match: string;
  index: number;
  message: string;
}

const PARTICIPLES = "given|taken|made|done|found|seen|known|shown|written|built|sent|set|run|read|kept|held|left|put|begun|become|come|gone|lost|met|paid|said|told|thought|brought|chosen|broken|spoken|drawn|grown";

const RULES: { id: string; level: SteLevel; re: RegExp; message: string }[] = [
  { id: "semicolon", level: "rule", re: /;/g, message: "STE does not allow the semicolon. Split into two sentences." },
  { id: "phrasal-verb", level: "rule", re: /\b(spin(?:ning|s)? up|spun up|reach(?:ing|es|ed)? out|div(?:e|es|ing|ed) into|dove into|kick(?:ing|s|ed)? off|circl(?:e|es|ing|ed) back|touch(?:ing|es|ed)? base|follow(?:ing|s|ed)? up|figur(?:e|es|ing|ed) out|set(?:ting|s)? up)\b/gi, message: "Phrasal verb. Use one plain verb: start, contact, read, begin, find, create." },
  { id: "marketing-adjective", level: "rule", re: /\b(seamless(?:ly)?|robust(?:ly)?|cutting-edge|effortless(?:ly)?|blazing[- ]fast|world-class|state-of-the-art|game-chang(?:ing|er)|powerful)\b/gi, message: "A claim of quality. Delete it, or give the measure that earns it." },
  { id: "nominalization", level: "rule", re: /\b(perform|performs|performed|conduct|conducts|conducted|carry out|carries out|carried out|undertake|undertakes|undertook)\s+(?:a|an|the)\s+\w+(?:tion|sion|ment|ance|ence|ysis)\b/gi, message: "An action turned into a noun. Use the verb." },
  { id: "passive-voice", level: "advisory", re: new RegExp(`\\b(is|are|was|were|been|being)\\s+(\\w+ed|${PARTICIPLES})\\b`, "gi"), message: "Possible passive. Name who acts, unless the actor is unknown or irrelevant." },
  { id: "present-perfect", level: "advisory", re: new RegExp(`(?<!\\b(?:may|might|could|should|would|must) )\\b(has|have|had)\\s+(?:been\\s+)?(?:\\w+ed|${PARTICIPLES})\\b`, "gi"), message: "Compound tense. Use a simple tense, unless current relevance is the point." },
];

const SYNONYM_GROUPS = [
  ["check", "verify", "confirm", "validate"],
  ["delete", "remove", "erase"],
  ["start", "launch", "begin", "initiate"],
  ["show", "display"],
  ["use", "utilize", "employ"],
  ["change", "modify", "alter"],
  ["get", "retrieve", "fetch", "obtain"],
];

function sentences(text: string): { text: string; index: number }[] {
  const out: { text: string; index: number }[] = [];
  const re = /[^.!?\n]+(?:[.!?]+|$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) if (/\w/.test(m[0])) out.push({ text: m[0], index: m.index });
  return out;
}

const wordCount = (s: string) => (s.match(/[A-Za-z0-9’'-]+/g) ?? []).length;

/** Lint text for the structural rules of a mode. Exempt text returns no findings. */
export function steLint(text: string, mode: SteMode): SteFinding[] {
  if (mode === "exempt") return [];
  const cap = mode === "strict" ? 20 : 25;
  const findings: SteFinding[] = [];

  for (const r of RULES) {
    r.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = r.re.exec(text))) findings.push({ rule: r.id, level: r.level, match: m[0], index: m.index, message: r.message });
  }

  for (const s of sentences(text)) {
    const n = wordCount(s.text);
    if (n > cap) {
      findings.push({ rule: "long-sentence", level: "rule", match: `${n} words`, index: s.index, message: `${n} words — the ${mode === "strict" ? "strict" : "descriptive"} cap is ${cap}. Split it.` });
    }
  }

  // One word, one meaning — strict mode only; advisory in flavoured prose.
  for (const group of SYNONYM_GROUPS) {
    const present = group
      .map((w) => ({ w, m: new RegExp(`\\b${w}(?:s|es|ed|d|ing)?\\b`, "i").exec(text) }))
      .filter((p): p is { w: string; m: RegExpExecArray } => p.m !== null)
      .sort((a, b) => a.m.index - b.m.index);
    for (const p of present.slice(1)) {
      findings.push({ rule: "synonym-rotation", level: mode === "strict" ? "rule" : "advisory", match: p.m[0], index: p.m.index, message: `“${p.w}” and “${present[0].w}” name the same action. Pick one.` });
    }
  }

  return findings.sort((a, b) => a.index - b.index);
}

// ── Exports for the wiki and the website ─────────────────────────────

export const steSource =
  "Adapted from asd-ste100-skill (Dustin Yuchen Teng, MIT), after ASD-STE100 Issue 9. Structural rules applied; vocabulary rules advisory; not certified STE.";

/** The plain register as an instruction block for an agent writing wiki or site text. */
export function stePrompt(): string {
  return [
    "PLAIN REGISTER (Simplified Technical English, by licence):",
    "- Decide the licence first. Decision text, instructions, UI copy and agent prompts are STRICT. Explanations, wiki pages and changelogs are STE-FLAVOURED. Encounter writing is EXEMPT.",
    "- STRICT: 20 words or fewer per sentence. One instruction per sentence. Active voice. Use one word for one action every time.",
    "- STE-FLAVOURED: 25 words or fewer per sentence. Active voice unless the actor is unknown. Vocabulary may vary.",
    "- Both: no semicolons. No phrasal verbs (start, not kick off). Verbs, not nominalizations. Noun clusters of three words or fewer. Use a list for three or more steps. One topic per paragraph.",
    "- Keep every hedge. Never change “may” to “is”. Never add a fact, cause or number the source did not state.",
    "- Keep a necessary term and define it once.",
  ].join("\n");
}

/** The plain register as Markdown, for the wiki. */
export function steMarkdown(): string {
  return [
    "## The plain register — Simplified Technical English, by licence",
    "",
    `*${steSource}*`,
    "",
    ...steModes.flatMap((m) => [`### ${m.label} — ${m.licence}`, "", `**Applies to:** ${m.applies}`, "", m.rule, ""]),
    "### Structural rules",
    "",
    "| Rule | Do | Don't |",
    "|---|---|---|",
    ...steStructuralRules.map((r) => `| ${r.name} | ${r.do} | ${r.dont} |`),
    "",
    "### Vocabulary (advisory)",
    "",
    ...steLexicalRules.map((r) => `- **${r.name}.** ${r.detail}`),
    "",
    "> Keep modality. A hedge carries the writer's confidence, and confidence is content.",
    "",
  ].join("\n");
}
