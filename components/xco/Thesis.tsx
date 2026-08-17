interface ThesisProps {
  children: React.ReactNode;
  attribution?: string;
  className?: string;
}

export function Thesis({ children, attribution, className = "" }: ThesisProps) {
  return (
    <blockquote
      className={`pl-6 space-y-3 ${className}`}
      style={{ borderLeft: "4px solid var(--xco-dusk)" }}
    >
      <p className="font-display text-[36px] leading-[40px] text-xco-ink text-balance">
        {children}
      </p>
      {attribution && (
        <cite className="block font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink-muted not-italic">
          — {attribution}
        </cite>
      )}
    </blockquote>
  );
}
