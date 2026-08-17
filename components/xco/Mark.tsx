export type Domain = "bio" | "inst" | "tech" | "culture";

const SHAPES: Record<Domain, { char: string; label: string }> = {
  bio:     { char: "●", label: "circle — biological" },
  inst:    { char: "■", label: "square — institutional" },
  tech:    { char: "▲", label: "triangle — technology" },
  culture: { char: "◆", label: "diamond — culture" },
};

interface MarkProps {
  domain: Domain;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export function Mark({ domain, size = "sm", className = "" }: MarkProps) {
  const shape = SHAPES[domain];
  const sizeStyle: Record<typeof size, string> = {
    xs: "text-[10px]",
    sm: "text-[14px]",
    md: "text-[20px]",
    lg: "text-[28px]",
  };

  return (
    <span
      role="img"
      aria-label={shape.label}
      className={`font-body leading-none select-none ${sizeStyle[size]} ${className}`}
      style={{ color: `var(--domain-${domain})` }}
    >
      {shape.char}
    </span>
  );
}
