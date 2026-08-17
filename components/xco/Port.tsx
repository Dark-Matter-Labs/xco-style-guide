import type { Domain } from "./Mark";
import { Mark } from "./Mark";

interface PortProps {
  domain: Domain;
  children: React.ReactNode;
  showMark?: boolean;
  className?: string;
}

export function Port({ domain, children, showMark = true, className = "" }: PortProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 font-mono font-medium text-[0.9375rem] leading-[1.6] ${className}`}
      style={{
        background: `var(--${domain}-tint)`,
        borderLeft: `2px solid var(--domain-${domain})`,
        color: "var(--xco-ink)",
      }}
    >
      {showMark && <Mark domain={domain} size="xs" />}
      {children}
    </span>
  );
}
