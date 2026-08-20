export type Domain = "bio" | "inst" | "tech" | "culture";

const LABELS: Record<Domain, string> = {
  bio: "circle — biophysical",
  inst: "square — institutional",
  tech: "triangle — technological",
  culture: "diamond — cultural",
};

const SIZES = { xs: 8, sm: 11, md: 16, lg: 26 } as const;

interface MarkProps {
  domain: Domain;
  size?: keyof typeof SIZES;
  className?: string;
}

// The shape channel. Drawn in CSS rather than set as a glyph (●■▲◆) so it
// stays crisp at 8px, survives forced-colors mode, and does not depend on a
// font being loaded. Colour reinforces; shape is what actually carries the
// domain — which is the whole point, since the four hues collapse under
// deuteranopia.
export function Mark({ domain, size = "sm", className = "" }: MarkProps) {
  const px = SIZES[size];
  return (
    <span
      role="img"
      aria-label={LABELS[domain]}
      className={`doc-mk doc-mk-${domain} ${className}`}
      style={{ width: px, height: px, color: `var(--domain-${domain})` }}
    />
  );
}
