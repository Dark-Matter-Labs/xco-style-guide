import type { LicenceId } from "@/lib/polyphonic";

// Encounter / Explanation / Decision carry escalating obligation, so the badge
// escalates weight with it: outlined, ruled, then filled. The border style is
// the channel — colour only reinforces, per the two-channel rule.
const STYLES: Record<LicenceId, { label: string; border: string; filled: boolean }> = {
  encounter:   { label: "Encounter",   border: "1px dashed",  filled: false },
  explanation: { label: "Explanation", border: "1px solid",   filled: false },
  decision:    { label: "Decision",    border: "2px solid",   filled: true  },
};

interface LicenceBadgeProps {
  licence: LicenceId;
  className?: string;
}

export function LicenceBadge({ licence, className = "" }: LicenceBadgeProps) {
  const s = STYLES[licence];
  return (
    <span
      className={`inline-block px-2 py-0.5 font-mono font-medium text-[0.75rem] leading-[1.4] uppercase tracking-widest ${className}`}
      style={{
        border: `${s.border} var(--xco-ink)`,
        background: s.filled ? "var(--xco-ink)" : "transparent",
        color: s.filled ? "var(--xco-paper)" : "var(--xco-ink)",
      }}
    >
      {s.label}
    </span>
  );
}
