// A red pencil — heuristics for the brevity practice (writing-practice.ts).
//
// These flag places to look, not errors: brevity is a judgment, and a long
// sentence or a repeated phrase can be deliberate. The guard from Dm's
// complexity check applies — cut words, not complexity.

export const LONG_SENTENCE_WORDS = 35;
const REPEAT_N = 4; // phrases of this many words or more

/** Wordy phrases with a shorter way to say them. */
export const wordyPhrases: { phrase: string; instead: string }[] = [
  { phrase: "in order to", instead: "to" },
  { phrase: "due to the fact that", instead: "because" },
  { phrase: "at this point in time", instead: "now" },
  { phrase: "it is important to note that", instead: "cut — say the thing" },
  { phrase: "it should be noted that", instead: "cut — say the thing" },
  { phrase: "a number of", instead: "several, or the number" },
  { phrase: "in terms of", instead: "name the relation" },
  { phrase: "with regard to", instead: "about" },
  { phrase: "in the context of", instead: "in, or for" },
  { phrase: "has the ability to", instead: "can" },
  { phrase: "is able to", instead: "can" },
];

export interface BrevityReport {
  words: number;
  sentences: number;
  meanSentence: number;
  longSentences: { words: number; start: string }[];
  repeats: { phrase: string; count: number }[];
  wordy: { phrase: string; instead: string; count: number }[];
}

function sentencesOf(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z“"‘'(\[])/)
    .map((s) => s.trim())
    .filter((s) => /\w/.test(s));
}

const words = (s: string) => s.toLowerCase().match(/[a-z0-9’']+/g) ?? [];

export function brevityReport(text: string): BrevityReport {
  const sents = sentencesOf(text);
  const all = words(text);
  const sentenceWords = sents.map((s) => words(s).length);

  const longSentences = sents
    .map((s, i) => ({ words: sentenceWords[i], start: s.split(" ").slice(0, 8).join(" ") }))
    .filter((s) => s.words > LONG_SENTENCE_WORDS);

  // Repeated phrases: find every REPEAT_N-word window seen more than once,
  // then merge consecutive repeated windows into the longest repeated run, so
  // "the system of care is fragile" is reported once, not as three overlaps.
  const gram = (i: number) => all.slice(i, i + REPEAT_N).join(" ");
  const counts = new Map<string, number>();
  for (let i = 0; i + REPEAT_N <= all.length; i++) counts.set(gram(i), (counts.get(gram(i)) ?? 0) + 1);
  const runs = new Set<string>();
  for (let i = 0; i + REPEAT_N <= all.length; i++) {
    if ((counts.get(gram(i)) ?? 0) < 2) continue;
    let j = i;
    while (j + 1 + REPEAT_N <= all.length && (counts.get(gram(j + 1)) ?? 0) > 1) j++;
    runs.add(all.slice(i, j + REPEAT_N).join(" "));
    i = j;
  }
  // Count by word position, so back-to-back repeats are both found.
  const occurrences = (phrase: string) => {
    const p = phrase.split(" ");
    let n = 0;
    for (let i = 0; i + p.length <= all.length; i++) if (p.every((w, k) => all[i + k] === w)) n++;
    return n;
  };
  const repeats = Array.from(runs)
    .map((phrase) => ({ phrase, count: occurrences(phrase) }))
    .filter((r, _, list) => r.count > 1 && !list.some((o) => o !== r && o.phrase.includes(r.phrase) && o.count >= r.count))
    .sort((a, b) => b.phrase.length * b.count - a.phrase.length * a.count)
    .slice(0, 5);

  const flat = text.toLowerCase().replace(/\s+/g, " ");
  const wordy = wordyPhrases
    .map((w) => ({ ...w, count: (flat.match(new RegExp(`\\b${w.phrase.replace(/ /g, "\\s+")}\\b`, "g")) ?? []).length }))
    .filter((w) => w.count > 0);

  return {
    words: all.length,
    sentences: sents.length,
    meanSentence: sents.length ? Math.round(all.length / sents.length) : 0,
    longSentences,
    repeats,
    wordy,
  };
}
