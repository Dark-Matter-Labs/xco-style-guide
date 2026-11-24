import { colors } from "@/lib/design-tokens";

export interface AnnotationProps {
  x: number;
  y: number;
  text: string;
  /** Max chars per line before wrapping — approximate */
  charsPerLine?: number;
}

/**
 * Marginalia annotation. Every diagram permits and visibly invites these —
 * showing the working, marking uncertainty.
 * Mark uncertainty inline with the system's markers (uncertaintyMarkers in lib/design-tokens).
 */
export function Annotation({
  x,
  y,
  text,
  charsPerLine = 40,
}: AnnotationProps) {
  // Simple word-wrap approximation for SVG
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if ((current + " " + word).trim().length > charsPerLine) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = current ? current + " " + word : word;
    }
  }
  if (current) lines.push(current);

  const lineHeight = 14;

  return (
    <g>
      {lines.map((line, i) => (
        <text
          key={i}
          x={x}
          y={y + i * lineHeight}
          fill={colors.inkMuted.hex}
          fontSize={10}
          fontFamily={`"Untitled Sans", system-ui, Arial, sans-serif`}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

export const AnnotationSource = `// Marginalia — always mark uncertainty inline
<Annotation
  x={20}
  y={160}
  text="[hypothesis] governance assumes legionella testing — not confirmed with Madrid water authority"
/>`;
