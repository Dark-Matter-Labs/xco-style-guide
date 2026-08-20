interface NoteProps {
  tag?: string;
  children: React.ReactNode;
  className?: string;
}

// Hairline annotation. Structure is drawn, never shadowed.
export function Note({ tag, children, className = "" }: NoteProps) {
  return (
    <div
      className={`p-[21px] ${className}`}
      style={{ border: "1px solid var(--rule)", background: "var(--panel, transparent)" }}
    >
      {tag && <p className="doc-label mb-3">{tag}</p>}
      <div className="doc-sans !text-xco-ink">{children}</div>
    </div>
  );
}
