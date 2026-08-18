import { logoGeometry, cPath, oPath, xPaths } from "@/lib/logo";

const TEXTURE = 0.75;    // texture weight — guides, per the two-weight system
const STRUCTURAL = 1.5;  // structural weight — measured extents

/**
 * The mark with its construction grid exposed: shared radius, cap and x-height
 * rules, and the aperture angle. Guides use the texture weight, measured
 * extents the structural weight — the same two-weight rule as every xCO diagram.
 */
export function ConstructionDiagram() {
  const g = logoGeometry;
  const [x1, x2] = xPaths();
  const guide = "var(--xco-ocean)";
  const [xTop] = [g.baseline - g.xHeight];

  return (
    <svg
      viewBox={`0 0 ${g.width} ${g.height}`}
      className="w-full h-auto"
      role="img"
      aria-label="Construction grid for the xCO logotype, showing shared circle radius, cap height, x-height and aperture angle"
    >
      {/* Horizontal rules: cap top, x-height, baseline, midline */}
      <g stroke={guide} strokeWidth={TEXTURE} opacity={0.55}>
        <line x1={0} y1={g.capTop} x2={g.width} y2={g.capTop} />
        <line x1={0} y1={xTop} x2={g.width} y2={xTop} strokeDasharray="3 3" />
        <line x1={0} y1={g.baseline} x2={g.width} y2={g.baseline} />
        <line x1={0} y1={g.midY} x2={g.width} y2={g.midY} strokeDasharray="1 4" />
      </g>

      {/* Shared construction circles — same radius for C and O */}
      <g stroke={guide} strokeWidth={TEXTURE} fill="none" opacity={0.5}>
        <circle cx={g.cCx} cy={g.midY} r={g.radius} strokeDasharray="4 3" />
        <circle cx={g.oCx} cy={g.midY} r={g.radius} strokeDasharray="4 3" />
        <line x1={g.cCx} y1={g.midY} x2={g.cCx + g.radius} y2={g.midY} />
        <line x1={g.oCx} y1={g.midY} x2={g.oCx + g.radius} y2={g.midY} />
      </g>

      {/* The mark itself */}
      <g fill="none" strokeWidth={g.stroke} stroke="var(--xco-ink)" strokeLinecap="butt">
        <path d={x1} />
        <path d={x2} />
        <path d={cPath()} />
        <path d={oPath()} />
      </g>

      {/* Measured extents */}
      <g stroke="var(--xco-dusk)" strokeWidth={STRUCTURAL} fill="none">
        <line x1={12} y1={g.capTop} x2={12} y2={g.baseline} />
        <line x1={8} y1={g.capTop} x2={16} y2={g.capTop} />
        <line x1={8} y1={g.baseline} x2={16} y2={g.baseline} />
      </g>

      <g
        fill="var(--xco-ink-muted)"
        fontFamily="var(--font-dm-mono), monospace"
        fontSize={7}
        fontWeight={500}
      >
        {/* Labels sit in the margins and counters — never over a stroke. */}
        <text x={20} y={g.capTop - 4}>cap {g.cap}</text>
        <text x={20} y={xTop - 4}>x-height {g.xHeight}</text>
        <text x={g.cCx + 6} y={g.midY - 6}>r {g.radius}</text>
        <text x={g.oCx + 6} y={g.midY - 6}>r {g.radius}</text>
        <text x={20} y={g.baseline + 12}>
          baseline · stroke {g.stroke} · aperture {g.aperture}°
        </text>
      </g>
    </svg>
  );
}
