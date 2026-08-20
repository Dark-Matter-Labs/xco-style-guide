import { ambiguityClasses } from "@/lib/polyphonic";

const BY_CODE = Object.fromEntries(ambiguityClasses.map((a) => [a.code, a]));

interface AmbiguityTagProps {
  code: (typeof ambiguityClasses)[number]["code"];
  className?: string;
}

// A0–A3 are licensed; AX is always a reject. The unlicensed class is the only
// one that takes dusk, which is the system's earned accent — a release blocker
// is exactly the "operative hinge" dusk is reserved for.
export function AmbiguityTag({ code, className = "" }: AmbiguityTagProps) {
  const a = BY_CODE[code];
  return (
    <span
      className={`inline-flex items-baseline gap-2 px-2 py-0.5 font-mono font-medium text-[0.75rem] leading-[1.4] tracking-widest ${className}`}
      style={{
        border: `1px solid ${a.licensed ? "var(--xco-ink)" : "var(--xco-dusk)"}`,
        color: a.licensed ? "var(--xco-ink)" : "var(--xco-dusk)",
      }}
      title={a.detail}
    >
      <span>{a.code}</span>
      <span className="opacity-70 normal-case tracking-normal">{a.name}</span>
    </span>
  );
}
