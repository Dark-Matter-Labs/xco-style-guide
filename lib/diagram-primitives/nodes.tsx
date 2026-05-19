import { jitteredRectPath } from "./jitter";
import { colors, diagram } from "@/lib/design-tokens";

// ── Shared node internals ─────────────────────────────────────────────

interface NodeTextProps {
  cx: number;
  cy: number;
  label: string;
  sublabel?: string;
  fill?: string;
  fontSize?: number;
}

function NodeText({ cx, cy, label, sublabel, fill = colors.ink.hex, fontSize = 13 }: NodeTextProps) {
  const lines = label.split("\n");
  const lineHeight = fontSize * 1.3;
  const totalHeight = lines.length * lineHeight;
  const startY = cy - totalHeight / 2 + lineHeight / 2 + (sublabel ? -8 : 0);

  return (
    <g>
      {lines.map((line, i) => (
        <text
          key={i}
          x={cx}
          y={startY + i * lineHeight}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={fill}
          fontSize={fontSize}
          fontFamily={`"Suisse Int'l", "Helvetica Neue", Arial, sans-serif`}
          fontWeight={400}
        >
          {line}
        </text>
      ))}
      {sublabel && (
        <text
          x={cx}
          y={startY + lines.length * lineHeight + 6}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={fill}
          fontSize={10}
          fontFamily={`"Suisse Int'l", "Helvetica Neue", Arial, sans-serif`}
        >
          {sublabel}
        </text>
      )}
    </g>
  );
}

// ── Shared prop type ──────────────────────────────────────────────────

export interface NodeProps {
  /** Center x */
  cx: number;
  /** Center y */
  cy: number;
  width?: number;
  height?: number;
  label: string;
  sublabel?: string;
  amplitude?: number;
  seed?: number;
}

// ── Risk Node — ember fill, paper text ───────────────────────────────

export function RiskNode({
  cx, cy,
  width = 160, height = 60,
  label, sublabel,
  amplitude = 1.8,
  seed = 42,
}: NodeProps) {
  const d = jitteredRectPath(cx, cy, width, height, amplitude, seed);
  return (
    <g>
      <path d={d} fill={colors.dusk.hex} stroke={colors.ink.hex} strokeWidth={diagram.lineWeights.structural} strokeLinecap="round" />
      <NodeText cx={cx} cy={cy} label={label} sublabel={sublabel} fill={colors.paper.hex} />
    </g>
  );
}

// ── Option Node — paper fill, ink stroke ─────────────────────────────

export function OptionNode({
  cx, cy,
  width = 160, height = 60,
  label, sublabel,
  amplitude = 1.8,
  seed = 42,
}: NodeProps) {
  const d = jitteredRectPath(cx, cy, width, height, amplitude, seed);
  return (
    <g>
      <path d={d} fill={colors.paper.hex} stroke={colors.ink.hex} strokeWidth={diagram.lineWeights.structural} strokeLinecap="round" />
      <NodeText cx={cx} cy={cy} label={label} sublabel={sublabel} fill={colors.ink.hex} />
    </g>
  );
}

// ── Field Node — paper fill, cool stroke, dashed ─────────────────────

export function FieldNode({
  cx, cy,
  width = 160, height = 60,
  label, sublabel,
  amplitude = 1.8,
  seed = 42,
}: NodeProps) {
  const d = jitteredRectPath(cx, cy, width, height, amplitude, seed);
  return (
    <g>
      <path d={d} fill={colors.paper.hex} stroke={colors.ocean.hex} strokeWidth={diagram.lineWeights.structural} strokeDasharray="6 4" strokeLinecap="round" />
      <NodeText cx={cx} cy={cy} label={label} sublabel={sublabel} fill={colors.ink.hex} />
    </g>
  );
}

// ── Usage source strings ──────────────────────────────────────────────

export const RiskNodeSource = `// Triggers the response — ember fill, paper text
<RiskNode cx={200} cy={80} label="Arctic destabilisation" />`;

export const OptionNodeSource = `// The response — paper fill, ink stroke (default node)
<OptionNode cx={200} cy={80} label="Frontier" />`;

export const FieldNodeSource = `// Systemic precondition — cool stroke, dashed border
<FieldNode cx={200} cy={80} label="Field" sublabel="precondition" />`;
