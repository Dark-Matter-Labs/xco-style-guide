import { atlasRoutes, type AtlasStep } from "@/lib/polyphonic";
import { colors, routeColors } from "@/lib/design-tokens";

// AT-H1 drawn as a relational field: no geography, no time scale. Positions
// are arranged so the routes meet at the shared threshold (A3 ↔ B4) and both
// return to review. A solid segment is a proposed step; a dashed segment ends
// at an unresolved prerequisite; a ring marks a wait of unknown duration.
// Route identity is carried by colour and by the A/B step labels, so colour
// is never the only carrier. Routes are specified on paper, so the figure
// keeps a paper ground in both registers.

type Pt = { x: number; y: number };

const POS: Record<string, Pt> = {
  A1: { x: 70, y: 80 },  A2: { x: 230, y: 70 },  A3: { x: 450, y: 165 }, A4: { x: 610, y: 95 },  A5: { x: 770, y: 120 },
  B1: { x: 70, y: 290 }, B2: { x: 210, y: 300 }, B3: { x: 330, y: 250 }, B4: { x: 470, y: 205 }, B5: { x: 770, y: 270 },
};
const REVIEW: Pt = { x: 880, y: 195 };

const hexOf = (id: "a" | "b") => routeColors.find((r) => r.id === id)!.hex;

function curve(a: Pt, b: Pt): string {
  const mx = (a.x + b.x) / 2;
  return `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
}

function Node({ step, colour, below }: { step: AtlasStep; colour: string; below: boolean }) {
  const p = POS[step.id];
  return (
    <g>
      {step.wait && <circle cx={p.x} cy={p.y} r={13} fill="none" stroke={colour} strokeWidth={1} />}
      <circle cx={p.x} cy={p.y} r={5} fill={colour} />
      <text x={p.x} y={below ? p.y + 30 : p.y - 20} textAnchor="middle" fontSize={13} fontFamily="ui-monospace, monospace" fill={colors.ink.hex}>
        {step.id} / {step.name}
      </text>
    </g>
  );
}

export function AtlasFigure() {
  const ink = colors.ink.hex;
  return (
    <svg
      viewBox="0 0 940 380"
      className="w-full h-auto"
      style={{ backgroundColor: colors.paper.hex }}
      role="img"
      aria-label="Two hypothetical cooling pathways. Route A, the resident, runs home, route, threshold, remain, return. Route B, the care worker, runs rota, wait, accompany, handoff, return. They meet at the cooling-room threshold and both return to a shared review. The full sequence is written out below."
    >
      <defs>
        {(["a", "b"] as const).map((id) => (
          <marker key={id} id={`atlas-arrow-${id}`} viewBox="0 0 10 10" refX="16" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={hexOf(id)} />
          </marker>
        ))}
      </defs>

      {/* Shared threshold and review — permission is an independent condition. */}
      <rect x={418} y={150} width={86} height={72} fill="none" stroke={ink} strokeWidth={0.75} strokeDasharray="2 3" />
      <text x={460} y={258} textAnchor="middle" fontSize={12} fontFamily="ui-monospace, monospace" fill={ink}>shared threshold</text>
      <rect x={REVIEW.x - 36} y={REVIEW.y - 18} width={72} height={36} fill="none" stroke={ink} strokeWidth={1} />
      <text x={REVIEW.x} y={REVIEW.y + 4} textAnchor="middle" fontSize={12} fontFamily="ui-monospace, monospace" fill={ink}>Review</text>

      {atlasRoutes.map((route) => {
        const colour = hexOf(route.route);
        const pts = route.steps.map((s) => POS[s.id]);
        return (
          <g key={route.id}>
            {route.steps.slice(1).map((s, i) => (
              <path
                key={s.id}
                d={curve(pts[i], pts[i + 1])}
                fill="none"
                stroke={colour}
                strokeWidth={2.5}
                strokeDasharray={s.unresolved ? "7 5" : undefined}
                markerEnd={`url(#atlas-arrow-${route.route})`}
              />
            ))}
            <path d={curve(pts[pts.length - 1], { x: REVIEW.x - 38, y: REVIEW.y })} fill="none" stroke={colour} strokeWidth={1.5} markerEnd={`url(#atlas-arrow-${route.route})`} />
            {route.steps.map((s) => (
              <Node key={s.id} step={s} colour={colour} below={route.route === "b"} />
            ))}
          </g>
        );
      })}

      <text x={20} y={368} fontSize={11} fontFamily="ui-monospace, monospace" fill={ink}>
        AT-H1 / RELATIONAL FIELD · NO GEOGRAPHICAL OR TEMPORAL SCALE
      </text>
    </svg>
  );
}
