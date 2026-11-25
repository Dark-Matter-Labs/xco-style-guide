import { logoVariants, LOCKUP_FONT, type LogoVariant } from "@/lib/logo";
import { HALF_X, lockupLayout, lockupMarkup, type Guide, type Lockup } from "@/lib/logo-lockups";

// A lockup drawn with its logic exposed: the clear-space margin shaded, the
// ink box dashed, a ½x unit in the margin, and the lockup's own measured gaps
// and alignments. Everything comes from lib/logo-lockups.ts, the module the
// downloads are built from, so the figure cannot drift from the files.

const MARGIN = 40; // room around the frame for guide labels

export function LockupFigure({
  lockup,
  variant = "light",
  logic = true,
  className = "",
}: {
  lockup: Lockup;
  variant?: LogoVariant;
  /** Draw clear space and guides. Off shows the lockup as it ships. */
  logic?: boolean;
  className?: string;
}) {
  const v = logoVariants.find((x) => x.id === variant)!;
  const layout = lockupLayout(lockup, variant);
  const f = layout.frame;
  const ink = layout.ink;
  const pad = logic ? MARGIN : 0;
  const vb = { x: f.l - pad, y: f.t - pad, w: f.r - f.l + pad * 2, h: f.b - f.t + pad * 2 };

  const guide = v.mode === "light" ? "#335D76" : "#9EC3D6";
  const zone = v.mode === "light" ? "rgba(51, 93, 118, 0.12)" : "rgba(158, 195, 214, 0.16)";
  const text = { fontFamily: LOCKUP_FONT, fontSize: 8, fill: guide } as const;

  // The margin only: the frame with the ink box cut out (even-odd).
  const margin = `M ${f.l} ${f.t} H ${f.r} V ${f.b} H ${f.l} Z M ${ink.l} ${ink.t} V ${ink.b} H ${ink.r} V ${ink.t} Z`;
  // Parts whose own clear space is larger than ½x (Dark Matter Labs' logo).
  const ownRule = layout.parts.filter((p) => p.clear > HALF_X);

  return (
    <svg
      viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
      className={`w-full h-auto ${className}`}
      role="img"
      aria-label={`${layout.label}, ${v.label.toLowerCase()} mode${logic ? ", with its clear space and spacing guides" : ""}`}
    >
      <rect x={vb.x} y={vb.y} width={vb.w} height={vb.h} fill={v.bg} />
      {logic && (
        <g>
          <path d={margin} fill={zone} fillRule="evenodd" />
          <rect
            x={f.l}
            y={f.t}
            width={f.r - f.l}
            height={f.b - f.t}
            fill="none"
            stroke={guide}
            strokeWidth={0.75}
          />
          <rect
            x={ink.l}
            y={ink.t}
            width={ink.r - ink.l}
            height={ink.b - ink.t}
            fill="none"
            stroke={guide}
            strokeWidth={0.5}
            strokeDasharray="3 3"
          />
          {ownRule.map((p) => (
            <g key={p.name}>
              <rect
                x={p.ink.l - p.clear}
                y={p.ink.t - p.clear}
                width={p.ink.r - p.ink.l + p.clear * 2}
                height={p.ink.b - p.ink.t + p.clear * 2}
                fill="none"
                stroke={guide}
                strokeWidth={0.5}
                strokeDasharray="1 3"
              />
              <text {...text} x={p.ink.r + p.clear - 4} y={p.ink.t - p.clear + 10} textAnchor="end">
                {p.name}: 1 stamp
              </text>
            </g>
          ))}
          {/* The unit, shown once in the left margin. */}
          <rect x={f.l} y={ink.t} width={HALF_X} height={HALF_X} fill="none" stroke={guide} strokeWidth={0.75} />
          <text {...text} x={f.l + HALF_X / 2} y={ink.t + HALF_X / 2 + 3} textAnchor="middle">
            ½x
          </text>
          {layout.guides.map((gd, i) => (
            <GuideMark key={i} g={gd} color={guide} />
          ))}
        </g>
      )}
      <g dangerouslySetInnerHTML={{ __html: lockupMarkup(layout) }} />
    </svg>
  );
}

function GuideMark({ g, color }: { g: Guide; color: string }) {
  const t = { fontFamily: LOCKUP_FONT, fontSize: 8, fill: color } as const;
  const s = { stroke: color, strokeWidth: 0.75 } as const;
  switch (g.kind) {
    case "gapX":
      return (
        <g>
          <line x1={g.from} y1={g.y} x2={g.to} y2={g.y} {...s} />
          <line x1={g.from} y1={g.y - 3} x2={g.from} y2={g.y + 3} {...s} />
          <line x1={g.to} y1={g.y - 3} x2={g.to} y2={g.y + 3} {...s} />
          <text {...t} x={(g.from + g.to) / 2} y={g.y - 5} textAnchor="middle">
            {g.label}
          </text>
        </g>
      );
    case "gapY":
      return (
        <g>
          <line x1={g.x} y1={g.from} x2={g.x} y2={g.to} {...s} />
          <line x1={g.x - 3} y1={g.from} x2={g.x + 3} y2={g.from} {...s} />
          <line x1={g.x - 3} y1={g.to} x2={g.x + 3} y2={g.to} {...s} />
          <text {...t} x={g.x + 5} y={(g.from + g.to) / 2 + 3}>
            {g.label}
          </text>
        </g>
      );
    case "lineY":
      return (
        <g>
          <line x1={g.from} y1={g.y} x2={g.to} y2={g.y} {...s} strokeDasharray="2 2" />
          <text {...t} x={g.to + 3} y={g.y + 3}>
            {g.label}
          </text>
        </g>
      );
    case "lineX":
      return (
        <g>
          <line x1={g.x} y1={g.from} x2={g.x} y2={g.to} {...s} strokeDasharray="2 2" />
          <text {...t} x={g.x} y={g.from - 3} textAnchor="middle">
            {g.label}
          </text>
        </g>
      );
  }
}
