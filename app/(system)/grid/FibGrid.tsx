"use client";

import { useState, useEffect } from "react";

const PHI   = 1.618033988749895;
const BASE  = 300;
const VW    = PHI * BASE; // ~485.4
const VH    = BASE;
const FIB   = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233];
const INK   = "#1C1B17";
const PAPER = "#FFFFFF";
const DUSK  = "#ff5a00";
const MAX_DEPTH = 8;
const FONT  = `"Untitled Sans", "Inter", Arial, sans-serif`;

interface Sq { x: number; y: number; s: number; i: number }

function subdivide(depth: number) {
  const sqs: Sq[] = [];
  let x = 0, y = 0, w = VW, h = VH;
  for (let i = 0; i < depth; i++) {
    const d = i % 4;
    let sqX = 0, sqY = 0, sqS = 0;
    if (d === 0) { sqS = h; sqX = x;       sqY = y;       x += sqS; w -= sqS; }
    if (d === 1) { sqS = w; sqX = x;       sqY = y;       y += sqS; h -= sqS; }
    if (d === 2) { sqS = h; sqX = x+w-sqS; sqY = y;       w -= sqS; }
    if (d === 3) { sqS = w; sqX = x;       sqY = y+h-sqS; h -= sqS; }
    sqs.push({ x: sqX, y: sqY, s: sqS, i });
  }
  return { sqs, rem: { x, y, w, h } };
}

// All arcs: sweep=0 (CCW in SVG coords), quarter-circle, endpoints chain correctly.
// d%4=0: (x, y+s) → (x+s, y)  center (x, y)
// d%4=1: (x, y)   → (x+s, y+s) center (x+s, y)
// d%4=2: (x+s, y) → (x, y+s)  center (x+s, y+s)
// d%4=3: (x+s,y+s)→ (x, y)    center (x, y+s)
function buildSpiral(sqs: Sq[]): string {
  const cmds: string[] = [];
  sqs.forEach(({ x, y, s }, i) => {
    const d = i % 4;
    const [sx, sy, ex, ey] =
      d === 0 ? [x,   y+s, x+s, y  ] :
      d === 1 ? [x,   y,   x+s, y+s] :
      d === 2 ? [x+s, y,   x,   y+s] :
               [x+s, y+s, x,   y  ];
    if (i === 0) cmds.push(`M ${sx} ${sy}`);
    cmds.push(`A ${s} ${s} 0 0 0 ${ex} ${ey}`);
  });
  return cmds.join(" ");
}

export function FibGrid() {
  const [depth, setDepth] = useState(1);
  const [auto, setAuto]   = useState(false);

  // Stop auto when max reached
  useEffect(() => {
    if (depth >= MAX_DEPTH) setAuto(false);
  }, [depth]);

  // Each step fires 800 ms after previous; dependency on depth means the effect
  // re-registers cleanly with every subdivision.
  useEffect(() => {
    if (!auto || depth >= MAX_DEPTH) return;
    const t = setTimeout(() => setDepth((d) => d + 1), 800);
    return () => clearTimeout(t);
  }, [auto, depth]);

  const { sqs, rem } = subdivide(depth);
  const spiral = buildSpiral(sqs);

  return (
    <div className="space-y-6">
      <svg
        viewBox={`0 0 ${VW.toFixed(3)} ${VH}`}
        className="w-full max-w-xl"
        style={{ display: "block" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={VW} height={VH} fill={PAPER} />

        {/* Squares — alternating paper / ink */}
        {sqs.map(({ x, y, s, i }) => (
          <rect
            key={i}
            x={x} y={y} width={s} height={s}
            fill={i % 2 === 0 ? PAPER : INK}
            stroke={INK} strokeWidth={0.75}
          />
        ))}

        {/* Remaining golden rectangle — dusk dashed */}
        <rect
          x={rem.x} y={rem.y} width={rem.w} height={rem.h}
          fill="none"
          stroke={DUSK} strokeWidth={1} strokeDasharray="4 3"
        />

        {/* Fibonacci labels */}
        {sqs.map(({ x, y, s, i }) => {
          if (s < 18) return null;
          const fs = Math.min(s * 0.3, 44);
          return (
            <text
              key={`t${i}`}
              x={x + s / 2} y={y + s / 2}
              textAnchor="middle" dominantBaseline="middle"
              fontFamily={FONT} fontWeight="400" fontSize={fs}
              fill={i % 2 === 0 ? INK : PAPER}
            >
              {FIB[i] ?? ""}
            </text>
          );
        })}

        {/* Golden spiral */}
        {sqs.length > 0 && (
          <path d={spiral} fill="none" stroke={DUSK} strokeWidth={1.5} />
        )}
      </svg>

      {/* Controls */}
      <div className="flex items-center gap-8 flex-wrap">
        <button
          onClick={() => setDepth((d) => Math.min(d + 1, MAX_DEPTH))}
          disabled={depth >= MAX_DEPTH || auto}
          className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink hover:text-xco-dusk transition-colors disabled:opacity-30"
        >
          Subdivide →
        </button>
        <button
          onClick={() => { setDepth(1); setAuto(false); }}
          className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink hover:text-xco-dusk transition-colors"
        >
          Reset
        </button>
        <button
          onClick={() => setAuto((a) => !a)}
          disabled={depth >= MAX_DEPTH}
          className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink hover:text-xco-dusk transition-colors disabled:opacity-30"
        >
          {auto ? "Pause" : "Auto"}
        </button>
        <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
          {depth} / {MAX_DEPTH}
        </span>
      </div>
    </div>
  );
}
