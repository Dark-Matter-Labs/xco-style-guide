import { colors } from "@/lib/design-tokens";

export interface MultiSolveTicksProps {
  /** Center x — same as parent node */
  cx: number;
  /** Y position (typically: node bottom + small gap) */
  y: number;
  /** Number of solution contributions shown, 1–6 */
  count: number;
  /** Width of the tick group */
  width?: number;
  stroke?: string;
}

/**
 * Stack of horizontal ticks below a node — the visual signature of
 * multi-solving. When a node carries multiple contributions (food forest
 * cools AND recharges aquifer AND provides nutrition), each contribution
 * gets one tick.
 */
export function MultiSolveTicks({
  cx,
  y,
  count,
  width = 40,
  stroke = colors.dusk.hex,
}: MultiSolveTicksProps) {
  const tickHeight = 5;
  const tickGap = 4;
  const clamped = Math.max(1, Math.min(count, 6));

  return (
    <g>
      {Array.from({ length: clamped }, (_, i) => {
        const ty = y + i * (tickHeight + tickGap);
        const w = width * (1 - i * 0.08); // slight taper
        return (
          <line
            key={i}
            x1={cx - w / 2}
            y1={ty}
            x2={cx + w / 2}
            y2={ty}
            stroke={stroke}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
}

export const MultiSolveTicksSource = `// A food forest cools AND recharges aquifer AND provides nutrition
// → 3 ticks
<OptionNode cx={200} cy={80} label="Peri-urban food forest" />
<MultiSolveTicks cx={200} y={112} count={3} />`;
