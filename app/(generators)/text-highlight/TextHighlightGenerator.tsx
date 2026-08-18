"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { paletteHex } from "@/lib/design-tokens";

const { sand: SAND, dusk: DUSK, teal: TEAL, ocean: OCEAN, navy: NAVY, ink: INK, paper: PAPER } = paletteHex;

// ── Types ───────────────────────────────────────────────────────────

type Level = 1 | 2 | 3 | 4 | 5;
type HighlightMode = "block" | "size";

interface Annotation {
  id: number;
  term: string;
  note: string;
  level: Level;
}

type Token =
  | { type: "plain"; text: string }
  | { type: "annotated"; text: string; ann: Annotation };

// ── Colour + size maps ──────────────────────────────────────────────

const LEVEL_COLORS: Record<Level, { bg: string; fg: string; name: string }> = {
  1: { bg: SAND, fg: INK, name: "Sand — critical" },
  2: { bg: DUSK, fg: INK, name: "Dusk — important" },
  3: { bg: TEAL, fg: PAPER, name: "Teal — contextual" },
  4: { bg: OCEAN, fg: PAPER, name: "Ocean — reference" },
  5: { bg: NAVY, fg: PAPER, name: "Navy — peripheral" },
};

const LEVEL_SIZE: Record<Level, { em: number; weight: number }> = {
  1: { em: 2.0,  weight: 600 },
  2: { em: 1.4,  weight: 500 },
  3: { em: 1.0,  weight: 400 },
  4: { em: 0.85, weight: 400 },
  5: { em: 0.7,  weight: 300 },
};

// ── Sample content ──────────────────────────────────────────────────

const SAMPLE_TEXT =
  "xCO operates across three distinct regimes — Field, Frontier, and Fortress — each with its own logic of value creation and risk. The Field is the systemic foundation, the shared substrate on which all other activity depends. Without healthy Field conditions, neither Frontier exploration nor Fortress consolidation can sustain itself over generational timescales. The Fortress represents concentrated optionality — positions of structural advantage that compound over time through network effects and switching costs. The Frontier is where new possibility space opens, always in relation to what the Field affords and what the Fortress can leverage. Navigating between these regimes requires a different grammar than conventional strategy.";

const SAMPLE_ANNOTATIONS: Annotation[] = [
  {
    id: 1,
    term: "Field",
    level: 1,
    note: "The systemic ground — shared substrate, infrastructure, ecology. Neither extractable nor excludable. The precondition for all other value creation.",
  },
  {
    id: 2,
    term: "Fortress",
    level: 2,
    note: "Concentrated positions of structural advantage. High barriers to entry, predictable compounding returns over time.",
  },
  {
    id: 3,
    term: "Frontier",
    level: 3,
    note: "Open territory where new forms can emerge. High uncertainty, first-mover optionality — inherently relational.",
  },
  {
    id: 4,
    term: "concentrated optionality",
    level: 4,
    note: "Maximum strategic flexibility held within a defensible position — rare and powerful combination.",
  },
  {
    id: 5,
    term: "generational timescales",
    level: 5,
    note: "Planning horizons of 25–100 years, well beyond typical institutional memory or capital cycle.",
  },
];

// ── Tokeniser ───────────────────────────────────────────────────────

function tokenize(text: string, anns: Annotation[]): Token[] {
  // Longest match first to avoid partial overlaps
  const sorted = [...anns].sort((a, b) => b.term.length - a.term.length);
  const matched = new Set<number>();
  const tokens: Token[] = [];
  let i = 0;

  while (i < text.length) {
    let found = false;
    for (const ann of sorted) {
      if (matched.has(ann.id)) continue;
      const slice = text.slice(i, i + ann.term.length);
      if (slice.toLowerCase() === ann.term.toLowerCase()) {
        tokens.push({ type: "annotated", text: slice, ann });
        matched.add(ann.id);
        i += ann.term.length;
        found = true;
        break;
      }
    }
    if (!found) {
      const last = tokens[tokens.length - 1];
      if (last?.type === "plain") {
        last.text += text[i];
      } else {
        tokens.push({ type: "plain", text: text[i] });
      }
      i++;
    }
  }
  return tokens;
}

// ── Generator ───────────────────────────────────────────────────────

export function TextHighlightGenerator() {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [annotations, setAnnotations] = useState<Annotation[]>(SAMPLE_ANNOTATIONS);
  const [mode, setMode] = useState<HighlightMode>("block");
  const [positions, setPositions] = useState<Record<number, number>>({});

  const containerRef  = useRef<HTMLDivElement>(null);
  const textRef       = useRef<HTMLDivElement>(null);
  const sidenoteRefs  = useRef<Record<number, HTMLDivElement>>({});

  const tokens = tokenize(text, annotations);

  // Measure term positions then push sidenotes apart (waterfall) to prevent overlap.
  useLayoutEffect(() => {
    if (!containerRef.current || !textRef.current) return;
    const cTop = containerRef.current.getBoundingClientRect().top;

    const measured = annotations
      .map((ann) => {
        const termEl = textRef.current!.querySelector(
          `[data-ann="${ann.id}"]`,
        ) as HTMLElement | null;
        if (!termEl) return null;
        const noteEl = sidenoteRefs.current[ann.id];
        return {
          id:     ann.id,
          rawTop: termEl.getBoundingClientRect().top - cTop,
          height: noteEl ? noteEl.getBoundingClientRect().height : 42,
        };
      })
      .filter(Boolean) as { id: number; rawTop: number; height: number }[];

    // Sort by natural position, then push each note down if it would overlap the previous.
    measured.sort((a, b) => a.rawTop - b.rawTop);
    const adjusted: Record<number, number> = {};
    let cursor = 0;
    for (const item of measured) {
      const top = Math.max(item.rawTop, cursor);
      adjusted[item.id] = top;
      cursor = top + item.height + 10;
    }

    setPositions((prev) =>
      JSON.stringify(prev) === JSON.stringify(adjusted) ? prev : adjusted,
    );
  }, [text, annotations, mode]);

  const updateAnn = (id: number, patch: Partial<Annotation>) =>
    setAnnotations((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* ── Controls ── */}
      <aside className="w-full lg:w-72 shrink-0 space-y-6">

        {/* Mode toggle */}
        <div className="space-y-2">
          <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
            Highlight mode
          </h2>
          <div className="flex gap-0">
            {(["block", "size"] as HighlightMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 font-mono font-medium text-[0.9375rem] leading-[1.6] px-3 py-2 border transition-colors ${
                  mode === m
                    ? "bg-xco-ink text-xco-paper border-xco-ink"
                    : "text-xco-ink border-xco-ink"
                }`}
              >
                {m === "block" ? "Colour block" : "Font size"}
              </button>
            ))}
          </div>
          <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink leading-snug">
            {mode === "block"
              ? "Warm background = critical. Cold background = peripheral."
              : "Large scale = critical. Small scale = peripheral — creates holes in the text mass."}
          </p>
        </div>

        {/* Legend */}
        <div className="space-y-2 pt-4">
          <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
            Warm → Cold
          </h2>
          {([1, 2, 3, 4, 5] as Level[]).map((lvl) => (
            <div key={lvl} className="flex items-center gap-2">
              <div
                className="w-4 h-4 shrink-0 border border-xco-ink"
                style={{ backgroundColor: LEVEL_COLORS[lvl].bg }}
              />
              <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
                {lvl} — {LEVEL_COLORS[lvl].name}
              </span>
            </div>
          ))}
        </div>

        {/* Annotation editor */}
        <div className="space-y-5 pt-4">
          <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
            Annotations
          </h2>
          {annotations.map((ann) => (
            <div key={ann.id} className="space-y-1.5">
              <div className="flex items-center gap-2">
                {/* Colour chip + number */}
                <span
                  className="font-mono font-medium text-[0.9375rem] leading-[1.6] w-5 h-5 flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: LEVEL_COLORS[ann.level].bg,
                    color: LEVEL_COLORS[ann.level].fg,
                  }}
                >
                  {ann.id}
                </span>
                {/* Term */}
                <input
                  type="text"
                  value={ann.term}
                  onChange={(e) => updateAnn(ann.id, { term: e.target.value })}
                  className="flex-1 bg-transparent border-b border-xco-ink font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink py-0.5 focus:outline-none focus:border-xco-ink"
                />
                {/* Level */}
                <select
                  value={ann.level}
                  onChange={(e) =>
                    updateAnn(ann.id, { level: Number(e.target.value) as Level })
                  }
                  className="bg-transparent border border-xco-ink font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink px-1 py-0.5 focus:outline-none"
                >
                  {([1, 2, 3, 4, 5] as Level[]).map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                value={ann.note}
                onChange={(e) => updateAnn(ann.id, { note: e.target.value })}
                rows={2}
                className="w-full bg-transparent border border-xco-ink font-body text-[24px] leading-[26px] text-xco-ink py-1 px-2 focus:outline-none focus:border-xco-ink resize-none"
              />
            </div>
          ))}
        </div>

        {/* Body text */}
        <div className="space-y-2 pt-4">
          <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
            Body text
          </h2>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={7}
            className="w-full bg-transparent border border-xco-ink font-body text-[24px] leading-[26px] text-xco-ink py-2 px-2 focus:outline-none focus:border-xco-ink resize-none leading-snug"
          />
          <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
            Terms are matched case-insensitively on first occurrence.
          </p>
        </div>
      </aside>

      {/* ── Preview ── */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="border border-xco-ink bg-xco-paper p-12 overflow-hidden">
          {/* Inner wrapper — reference point for absolute sidenote positions */}
          <div ref={containerRef} style={{ position: "relative" }}>

            {/* Main text — 58% width, leaving room for sidenotes */}
            <div
              ref={textRef}
              className="font-body text-[24px] leading-[26px]"
              style={{ width: "58%" }}
            >
              {tokens.map((tok, i) => {
                if (tok.type === "plain") return <span key={i}>{tok.text}</span>;

                const { ann } = tok;
                const c = LEVEL_COLORS[ann.level];
                const s = LEVEL_SIZE[ann.level];

                if (mode === "block") {
                  return (
                    <span
                      key={i}
                      data-ann={ann.id}
                      style={{
                        backgroundColor: c.bg,
                        color: c.fg,
                        padding: "0 3px 1px",
                        borderRadius: "1px",
                      }}
                    >
                      {tok.text}
                      <span
                        style={{
                          position: "relative",
                          top: "-0.42em",
                          fontSize: "0.62em",
                          marginLeft: "2px",
                          lineHeight: 0,
                          fontWeight: 600,
                        }}
                      >
                        {ann.id}
                      </span>
                    </span>
                  );
                }

                // Size mode — importance as scale, creates open holes
                return (
                  <span
                    key={i}
                    data-ann={ann.id}
                    style={{
                      fontSize: `${s.em}em`,
                      fontWeight: s.weight,
                      color: c.bg,
                      lineHeight: 1.1,
                      display: "inline",
                    }}
                  >
                    {tok.text}
                    <span
                      style={{
                        position: "relative",
                        top: "-0.42em",
                        fontSize: "0.5em",
                        marginLeft: "2px",
                        lineHeight: 0,
                        fontWeight: 600,
                      }}
                    >
                      {ann.id}
                    </span>
                  </span>
                );
              })}
            </div>

            {/* Sidenotes — absolutely positioned at term height */}
            <div
              style={{
                position: "absolute",
                left: "61%",
                top: 0,
                width: "37%",
              }}
            >
              {annotations.map((ann) => {
                const top = positions[ann.id] ?? 0;
                const c = LEVEL_COLORS[ann.level];
                return (
                  <div
                    key={ann.id}
                    ref={(el) => {
                      if (el) sidenoteRefs.current[ann.id] = el;
                      else delete sidenoteRefs.current[ann.id];
                    }}
                    style={{
                      position: "absolute",
                      top,
                      width: "100%",
                      transition: "top 0.15s ease",
                    }}
                    className="font-mono font-medium text-[0.9375rem] leading-[1.6] leading-snug text-xco-ink"
                  >
                    <span
                      style={{ color: c.bg, fontWeight: 700, marginRight: "5px" }}
                    >
                      {ann.id}
                    </span>
                    {ann.note}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
          {mode === "block"
            ? "Colour temperature encodes importance — sand (critical) → navy (peripheral). Sidenotes align to term height."
            : "Scale encodes importance — 2× for critical, 0.7× for peripheral. Irregular sizes create open holes in the text rhythm."}
        </p>
      </div>
    </div>
  );
}
