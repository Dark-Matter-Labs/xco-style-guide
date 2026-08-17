import type { Domain } from "./Mark";

interface StatProps {
  value: string;
  label: string;
  domain?: Domain;
  className?: string;
}

export function Stat({ value, label, domain, className = "" }: StatProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <p
        className="font-display text-[60px] leading-[60px]"
        style={{ color: domain ? `var(--domain-${domain})` : "var(--xco-ink)" }}
      >
        {value}
      </p>
      <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink-muted">
        {label}
      </p>
    </div>
  );
}

interface StatGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatGrid({ children, columns = 3, className = "" }: StatGridProps) {
  const colClass = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" }[columns];
  return (
    <div className={`grid ${colClass} gap-8 ${className}`}>
      {children}
    </div>
  );
}
