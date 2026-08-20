import { relationJurisdictions, type RelationCode } from "@/lib/polyphonic";

const BY_CODE = Object.fromEntries(
  relationJurisdictions.map((r) => [r.code, r]),
) as Record<RelationCode, (typeof relationJurisdictions)[number]>;

interface RelationEdgeProps {
  code: RelationCode;
  width?: number;
  className?: string;
}

// Renders one relation jurisdiction as its actual line syntax. The dash
// pattern, arrowhead, doubling and terminator ARE the meaning — this is why a
// legend can never be colour-only.
export function RelationEdge({ code, width = 72, className = "" }: RelationEdgeProps) {
  const r = BY_CODE[code];
  const line = r.line;
  const h = 16;
  const mid = h / 2;
  const dash = line.dash === "none" ? undefined : line.dash;
  const endX = line.arrow ? width - 7 : width;
  const markerId = `arrow-${code}`;

  return (
    <svg
      width={width}
      height={h}
      viewBox={`0 0 ${width} ${h}`}
      className={className}
      role="img"
      aria-label={`${r.name}: ${r.syntax}`}
    >
      {line.arrow && (
        <defs>
          <marker
            id={markerId}
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="7"
            markerHeight="7"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8 z" fill="var(--xco-ink)" />
          </marker>
        </defs>
      )}

      {/* Doubled edge — the authority gate reads as a gate, not a line */}
      {"doubled" in line && line.doubled ? (
        <>
          <line x1="0" y1={mid - 2.5} x2={endX} y2={mid - 2.5}
            stroke="var(--xco-ink)" strokeWidth={line.weight} />
          <line x1="0" y1={mid + 2.5} x2={endX} y2={mid + 2.5}
            stroke="var(--xco-ink)" strokeWidth={line.weight}
            markerEnd={line.arrow ? `url(#${markerId})` : undefined} />
        </>
      ) : (
        <line
          x1="0" y1={mid} x2={endX} y2={mid}
          stroke="var(--xco-ink)"
          strokeWidth={line.weight}
          strokeDasharray={dash}
          markerEnd={line.arrow ? `url(#${markerId})` : undefined}
        />
      )}

      {/* Contestation terminates rather than arrives */}
      {"terminator" in line && line.terminator && (
        <line x1={width - 2} y1={mid - 6} x2={width - 2} y2={mid + 6}
          stroke="var(--xco-ink)" strokeWidth={2} />
      )}

      {/* Review returns — a hooked tail marks the return path */}
      {"returns" in line && line.returns && (
        <path
          d={`M2,${mid} L2,${mid + 5}`}
          stroke="var(--xco-ink)"
          strokeWidth={line.weight}
          fill="none"
        />
      )}
    </svg>
  );
}
