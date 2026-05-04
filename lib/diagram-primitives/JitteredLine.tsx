import { jitteredLinePath } from "./jitter";
import { colors, diagram } from "@/lib/design-tokens";

export interface JitteredLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  amplitude?: number;
  strokeWidth?: number;
  stroke?: string;
  /** true = annotation/leader style (dashed, thin) */
  annotation?: boolean;
  seed?: number;
}

export function JitteredLine({
  x1,
  y1,
  x2,
  y2,
  amplitude = 1.8,
  strokeWidth,
  stroke = colors.ink.hex,
  annotation = false,
  seed = 42,
}: JitteredLineProps) {
  const sw = strokeWidth ?? (annotation ? diagram.lineWeights.texture : diagram.lineWeights.structural);
  const d = jitteredLinePath(x1, y1, x2, y2, amplitude, seed);

  return (
    <path
      d={d}
      stroke={stroke}
      strokeWidth={sw}
      fill="none"
      strokeDasharray={annotation ? "4 4" : undefined}
      strokeLinecap="round"
    />
  );
}

export const JitteredLineSource = `<JitteredLine
  x1={20} y1={100}
  x2={380} y2={100}
  amplitude={1.8}
  seed={42}
/>

// Annotation variant (thin, dashed):
<JitteredLine
  x1={20} y1={140}
  x2={380} y2={140}
  annotation
  seed={7}
/>`;
