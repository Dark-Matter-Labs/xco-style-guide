"use client";

import { useState, useCallback } from "react";
import { bannedWords } from "@/lib/design-tokens";

interface BannedMatch {
  word: string;
  index: number;
  length: number;
}

interface LinterResult {
  bannedMatches: BannedMatch[];
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
      const wordBoundary = /\W/.test(before) && /\W/.test(after);
      if (wordBoundary || term.includes(" ")) {
        matches.push({ word: w.trim(), index: idx, length: term.length });
      }
      start = idx + 1;
    }
  }

  return matches;
}

function classifyRegister(text: string): Omit<LinterResult, "bannedMatches" | "clean"> {
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

// Render the input text with banned words highlighted
function HighlightedText({ text, matches }: { text: string; matches: BannedMatch[] }) {
  if (matches.length === 0) return <>{text}</>;

  const sorted = [...matches].sort((a, b) => a.index - b.index);
  const parts: React.ReactNode[] = [];
  let cursor = 0;

  for (const m of sorted) {
    if (m.index > cursor) {
      parts.push(<span key={`t-${cursor}`}>{text.slice(cursor, m.index)}</span>);
    }
    parts.push(
      <mark
        key={`m-${m.index}`}
        className="bg-xco-dusk/20 text-xco-dusk border-b border-xco-dusk"
      >
        {text.slice(m.index, m.index + m.length)}
      </mark>,
    );
    cursor = m.index + m.length;
  }
  if (cursor < text.length) {
    parts.push(<span key={`t-end`}>{text.slice(cursor)}</span>);
  }

  return <>{parts}</>;
}

export function ToneLinter() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<LinterResult | null>(null);

  const analyse = useCallback(() => {
    if (!text.trim()) { setResult(null); return; }
    const bannedMatches = findBannedWords(text);
    const { register, confidence, signals } = classifyRegister(text);
    setResult({ bannedMatches, register, confidence, signals, clean: bannedMatches.length === 0 });
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
          {result.bannedMatches.length > 0 && (
            <div className="space-y-3">
              <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
                Text with flags
              </p>
              <div className="font-body text-[24px] text-xco-ink leading-[26px] p-4 whitespace-pre-wrap">
                <HighlightedText text={text} matches={result.bannedMatches} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
