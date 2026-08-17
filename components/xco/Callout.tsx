import type { Domain } from "./Mark";
import { Mark } from "./Mark";

const DOMAIN_LABELS: Record<Domain, string> = {
  bio:     "Biological",
  inst:    "Institutional",
  tech:    "Technology",
  culture: "Culture",
};

interface CalloutProps {
  domain: Domain;
  children: React.ReactNode;
  label?: string;
  className?: string;
}

export function Callout({ domain, children, label, className = "" }: CalloutProps) {
  const displayLabel = label ?? DOMAIN_LABELS[domain];

  return (
    <div
      className={`flex gap-4 py-4 px-5 ${className}`}
      style={{
        borderLeft: `3px solid var(--domain-${domain})`,
        background: `var(--${domain}-tint)`,
      }}
    >
      <div className="pt-1 shrink-0">
        <Mark domain={domain} size="sm" />
      </div>
      <div className="space-y-2 min-w-0">
        <p
          className="font-mono font-medium text-[0.75rem] leading-[1.4] uppercase tracking-widest"
          style={{ color: `var(--domain-${domain})` }}
        >
          {displayLabel}
        </p>
        <div className="font-body text-[24px] text-xco-ink leading-[26px]">
          {children}
        </div>
      </div>
    </div>
  );
}
