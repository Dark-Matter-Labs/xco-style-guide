interface NoteProps {
  tag?: string;
  children: React.ReactNode;
  className?: string;
}

// Side-rail annotation. Sharp corners — the guide states this is not a
// round-corner brand, so v5's rounded note card is squared off here.
export function Note({ tag, children, className = "" }: NoteProps) {
  return (
    <div className={`doc-note ${className}`}>
      {tag && (
        <p className="font-mono font-medium text-[0.75rem] leading-[1.4] uppercase tracking-widest text-xco-ink-muted mb-3">
          {tag}
        </p>
      )}
      <div className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
        {children}
      </div>
    </div>
  );
}
