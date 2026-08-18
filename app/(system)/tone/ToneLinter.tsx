"use client";

import { useState, useCallback } from "react";
import {
  bannedWords,
  spellingCorrections,
  brandCasingErrors,
  BRAND_NAME,
} from "@/lib/design-tokens";

interface BannedMatch {
  word: string;
  index: number;
  length: number;
}

interface CasingMatch {
  found: string;
  index: number;
  length: number;
}

interface SpellingMatch {
  british: string;
  american: string;
  index: number;
  length: number;
}

interface LinterResult {
  bannedMatches: BannedMatch[];
  spellingMatches: SpellingMatch[];
  casingMatches: CasingMatch[];
  register: string | null;
  confidence: "low" | "medium" | "high";
  signals: string[];
  clean: boolean;
}

function findBannedWords(text: string): BannedMatch[] {
  const matches: BannedMatch[] = [];
  const lower = text.toLowerCase();

  for (const w of bannedWords) {
    const term = w.trim().toLowerCase();
    let start = 0;
    while (true) {
      const idx = lower.indexOf(term, start);
      if (idx === -1) break;
      // Whole-word check for single-word terms
      const before = idx > 0 ? lower[idx - 1] : " ";
      const after = idx + term.length < lower.length ? lower[idx + term.length] : " ";
      // Boundaries are required for phrases too: a phrase entry begins and ends
      // with a letter, so the same check correctly rejects "in this spaces".
      // Previously phrases bypassed this via `|| term.includes(" ")`.
      if (/\W/.test(before) && /\W/.test(after)) {
        matches.push({ word: w.trim(), index: idx, length: term.length });
      }
      start = idx + 1;
    }
  }

  return matches;
}

function findBritishSpellings(text: string): SpellingMatch[] {
  const matches: SpellingMatch[] = [];
  const lower = text.toLowerCase();

  for (const { british, american } of spellingCorrections) {
    const term = british.toLowerCase();
    let start = 0;
    while (true) {
      const idx = lower.indexOf(term, start);
      if (idx === -1) break;
      const before = idx > 0 ? lower[idx - 1] : " ";
      const after = idx + term.length < lower.length ? lower[idx + term.length] : " ";
      const wordBoundary = /\W/.test(before) && /\W/.test(after);
      if (wordBoundary) {
        matches.push({ british, american, index: idx, length: term.length });
      }
      start = idx + 1;
    }
  }

  return matches;
}

// Characters that can join the match into a slug, path, domain, or filename —
// "xco-style-guide" and "docs/xco.md" are identifiers, not prose casing errors.
const SLUG_CHARS = /[-/._@]/;
const WORD = /[A-Za-z0-9]/;

function findBrandCasing(text: string): CasingMatch[] {
  const matches: CasingMatch[] = [];

  for (const variant of brandCasingErrors) {
    let start = 0;
    while (true) {
      // Case-SENSITIVE: correct `xCO` must never be flagged.
      const idx = text.indexOf(variant, start);
      if (idx === -1) break;
      start = idx + 1;

      const end = idx + variant.length;
      const before = idx > 0 ? text[idx - 1] : " ";
      const after = end < text.length ? text[end] : " ";

      // Glued to a word character — we're inside a longer token ("Mexico").
      if (WORD.test(before) || WORD.test(after)) continue;

      // A preceding slug char always means an identifier: sentence punctuation
      // never sits flush before a word, so ".xco" / "docs/xco" are paths.
      if (SLUG_CHARS.test(before)) continue;

      // A trailing slug char only means an identifier when a word follows it.
      // "xco-style" and "xco.md" are identifiers; "xCo." and "xCo -" are prose
      // with a sentence-final period or a dash, and must still be flagged.
      if (SLUG_CHARS.test(after) && end + 1 < text.length && WORD.test(text[end + 1])) {
        continue;
      }

      matches.push({ found: variant, index: idx, length: variant.length });
    }
  }

  return matches.sort((a, b) => a.index - b.index);
}

function classifyRegister(text: string): Omit<LinterResult, "bannedMatches" | "spellingMatches" | "casingMatches" | "clean"> {
  const lower = text.toLowerCase();
  const signals: string[] = [];

  let mScore = 0; // Method
  let hScore = 0; // Hunch
  let aScore = 0; // Annotation

  // Method signals
  if (/\d+\.?\d*\s*(°c|km²|km|ha|%|gw|mw|m²|tco2|×)/i.test(text)) {
    mScore += 3; signals.push("measurements / units detected");
  }
  if (/\d+/.test(text)) {
    mScore += 1; signals.push("numbers detected");
  }
  if (/(madrid|santiago|arctic|london|nairobi|dhaka|berlin|sydney|jakarta)/i.test(text)) {
    mScore += 2; signals.push("named place detected");
  }
  if (/\b(combines|requires|produces|removes|fails|delivers|generates|reduces|increases)\b/i.test(text)) {
    mScore += 1; signals.push("specific action verbs");
  }

  // Hunch signals
  if (/\bif\b/.test(lower)) {
    hScore += 2; signals.push('"if" — tentative framing');
  }
  if (/\bwhether\b/.test(lower)) {
    hScore += 2; signals.push('"whether" — open question');
  }
  if (/we.re trying|trying to figure|trying to understand/i.test(lower)) {
    hScore += 3; signals.push('"trying to" — exploratory voice');
  }
  if (/\?/.test(text)) {
    hScore += 1; signals.push("question mark");
  }
  if (/\b(might|could be|seems|perhaps|probably)\b/i.test(lower)) {
    hScore += 1; signals.push("tentative language");
  }
  if (/\b(precondition|allocation|under-price|under-priced)\b/i.test(lower)) {
    hScore += 1; signals.push("xCO vocabulary");
  }
  if (/it.s about|the question is|the problem is/i.test(lower)) {
    hScore += 2; signals.push("problem-framing language");
  }

  // Annotation signals
  if (/\[/.test(text)) {
    aScore += 2; signals.push("bracket marker notation");
  }
  if (/\/\//.test(text)) {
    aScore += 3; signals.push("// annotation style");
  }
  if (/\bassumes?\b/i.test(lower)) {
    aScore += 2; signals.push('"assumes" — conditional claim');
  }
  if (/depends on/i.test(lower)) {
    aScore += 2; signals.push('"depends on" — dependency notation');
  }
  if (/\[(unverified|inference|speculation)\]/i.test(lower)) {
    aScore += 4; signals.push("explicit uncertainty marker");
  }

  const maxScore = Math.max(mScore, hScore, aScore);

  if (maxScore === 0) {
    return { register: null, confidence: "low", signals: [] };
  }

  const register =
    mScore === maxScore ? "A — Method"
    : hScore === maxScore ? "B — Hunch"
    : "C — Annotation";

  const total = mScore + hScore + aScore;
  const ratio = maxScore / total;
  const confidence: "low" | "medium" | "high" =
    ratio > 0.65 ? "high" : ratio > 0.4 ? "medium" : "low";

  // Deduplicate signals
  const seen = new Set<string>();
  const uniqueSignals = signals.filter((s) => {
    if (seen.has(s)) return false;
    seen.add(s);
    return true;
  });

  return { register, confidence, signals: uniqueSignals };
}

// Render the input text with banned words and British spellings highlighted
function HighlightedText({
  text,
  banned,
  spelling,
  casing,
}: {
  text: string;
  banned: BannedMatch[];
  spelling: SpellingMatch[];
  casing: CasingMatch[];
}) {
  if (banned.length === 0 && spelling.length === 0 && casing.length === 0) {
    return <>{text}</>;
  }

  type Highlight =
    | { kind: "banned"; index: number; length: number }
    | { kind: "spelling"; index: number; length: number }
    | { kind: "casing"; index: number; length: number };

  const all: Highlight[] = [
    ...banned.map((m) => ({ kind: "banned" as const, index: m.index, length: m.length })),
    ...spelling.map((m) => ({ kind: "spelling" as const, index: m.index, length: m.length })),
    ...casing.map((m) => ({ kind: "casing" as const, index: m.index, length: m.length })),
  ].sort((a, b) => a.index - b.index);

  const parts: React.ReactNode[] = [];
  let cursor = 0;

  for (const h of all) {
    if (h.index < cursor) continue; // overlapping — skip
    if (h.index > cursor) {
      parts.push(<span key={`t-${cursor}`}>{text.slice(cursor, h.index)}</span>);
    }
    const slice = text.slice(h.index, h.index + h.length);
    const markClass =
      h.kind === "banned"
        ? "bg-xco-dusk/20 text-xco-dusk border-b border-xco-dusk"
        : h.kind === "spelling"
          ? "bg-xco-ocean/15 text-xco-ocean border-b border-xco-ocean"
          : "bg-xco-teal/20 text-xco-teal border-b-2 border-xco-teal";
    parts.push(
      <mark key={`m-${h.index}`} className={markClass}>
        {slice}
      </mark>,
    );
    cursor = h.index + h.length;
  }
  if (cursor < text.length) {
    parts.push(<span key="t-end">{text.slice(cursor)}</span>);
  }

  return <>{parts}</>;
}

export function ToneLinter() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<LinterResult | null>(null);

  const analyse = useCallback(() => {
    if (!text.trim()) { setResult(null); return; }
    const bannedMatches = findBannedWords(text);
    const spellingMatches = findBritishSpellings(text);
    const casingMatches = findBrandCasing(text);
    const { register, confidence, signals } = classifyRegister(text);
    setResult({
      bannedMatches,
      spellingMatches,
      casingMatches,
      register,
      confidence,
      signals,
      clean:
        bannedMatches.length === 0 &&
        spellingMatches.length === 0 &&
        casingMatches.length === 0,
    });
  }, [text]);

  const confidenceColour = {
    low: "text-xco-dusk",
    medium: "text-xco-ink",
    high: "text-xco-ink",
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setResult(null); }}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) analyse(); }}
          placeholder="Paste a paragraph of draft text here — the linter will flag banned words and suggest which register it belongs to."
          rows={6}
          className="w-full bg-transparent border border-xco-ink font-body text-[24px] leading-[26px] text-xco-ink p-4 focus:outline-none transition-colors resize-none placeholder:text-xco-ink/40"
        />
        <div className="flex items-center gap-4">
          <button
            onClick={analyse}
            disabled={!text.trim()}
            className="font-mono font-medium text-[0.9375rem] leading-[1.6] border border-xco-ink px-4 py-2 text-xco-ink hover:bg-xco-ink hover:text-xco-paper transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Analyse ↵
          </button>
          <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">or ⌘↵ / Ctrl↵</p>
          {text && (
            <button
              onClick={() => { setText(""); setResult(null); }}
              className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink hover:text-xco-dusk transition-colors ml-auto"
            >
              clear
            </button>
          )}
        </div>
      </div>

      {result && (
        <div className="space-y-6 pt-6">
          {(result.bannedMatches.length > 0 ||
            result.spellingMatches.length > 0 ||
            result.casingMatches.length > 0) && (
            <div className="space-y-3">
              <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
                Text with flags
              </p>
              <div className="font-body text-[24px] text-xco-ink leading-[26px] p-4 whitespace-pre-wrap">
                <HighlightedText
                  text={text}
                  banned={result.bannedMatches}
                  spelling={result.spellingMatches}
                  casing={result.casingMatches}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
              <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
                Banned words
              </p>
              {result.bannedMatches.length === 0 ? (
                <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
                  ✓ No banned words found
                </p>
              ) : (
                <ul className="space-y-1">
                  {result.bannedMatches.map((m, i) => (
                    <li key={i} className="flex items-baseline gap-3">
                      <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-dusk">✗</span>
                      <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-dusk">{m.word}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-3">
              <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
                Spelling
              </p>
              {result.spellingMatches.length === 0 ? (
                <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
                  ✓ US English throughout
                </p>
              ) : (
                <ul className="space-y-1">
                  {result.spellingMatches.map((m, i) => (
                    <li key={i} className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ocean">✗ {m.british}</span>
                      <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">→</span>
                      <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">✓ {m.american}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-3">
              <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
                Brand casing
              </p>
              {result.casingMatches.length === 0 ? (
                <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
                  ✓ {BRAND_NAME} cased correctly
                </p>
              ) : (
                <ul className="space-y-1">
                  {result.casingMatches.map((m, i) => (
                    <li key={i} className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-teal">
                        ✗ {m.found}
                      </span>
                      <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">→</span>
                      <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
                        ✓ {BRAND_NAME}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-3">
              <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
                Register detected
              </p>
              {result.register ? (
                <div className="space-y-2">
                  <p className={`font-mono font-medium text-[0.9375rem] leading-[1.6] ${confidenceColour[result.confidence]}`}>
                    {result.register}{" "}
                    <span className="opacity-60">({result.confidence} confidence)</span>
                  </p>
                  {result.signals.length > 0 && (
                    <ul className="space-y-0.5">
                      {result.signals.map((s, i) => (
                        <li key={i} className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
                          — {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
                  — register unclear. Pick A, B, or C deliberately.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
