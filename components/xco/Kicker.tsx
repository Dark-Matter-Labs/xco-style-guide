import type { Domain } from "./Mark";

interface KickerProps {
  children: React.ReactNode;
  domain?: Domain;
  className?: string;
}

export function Kicker({ children, domain, className = "" }: KickerProps) {
  return (
    <p
      className={`font-mono font-medium text-[0.75rem] leading-[1.4] uppercase tracking-widest ${className}`}
      style={{ color: domain ? `var(--${domain}-ink)` : "var(--xco-ink-muted)" }}
    >
      {children}
    </p>
  );
}
