import { colors } from "@/lib/design-tokens";

export interface ScaleRuleProps {
  y: number;
  x?: number;
  width?: number;
  label: string;
  labelX?: number;
}

/**
 * Horizontal scale boundary marker. When a diagram crosses scales
 * (macro → bioregional → urban → neighbourhood), draw this rule
 * with the scale label in the left margin.
 */
export function ScaleRule({
  y,
  x = 0,
  width = 400,
  label,
  labelX,
}: ScaleRuleProps) {
  const lx = labelX ?? x - 8;

  return (
    <g>
      <line
        x1={x}
        y1={y}
        x2={x + width}
        y2={y}
        stroke={colors.ink.hex}
        strokeWidth={0.5}
        strokeOpacity={0.25}
      />
      <text
        x={lx}
        y={y}
        textAnchor="end"
        dominantBaseline="middle"
        fill={colors.inkMuted.hex}
        fontSize={10}
        fontFamily="'DM Mono', monospace"
        fontStyle="italic"
      >
        {label}
      </text>
    </g>
  );
}

export const ScaleRuleSource = `// Scale boundary — macro to bioregional
<ScaleRule y={120} label="macro" x={40} width={320} />
<ScaleRule y={220} label="bioregional" x={40} width={320} />`;
