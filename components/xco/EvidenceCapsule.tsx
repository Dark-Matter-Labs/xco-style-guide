interface EvidenceCapsuleProps {
  id: string;
  fn: string;
  span: string;
  quoted: string;
  question: string;
  disclosure: string[];
  className?: string;
}

// One evidence object joined to one exact span. The heading carries the
// epistemic function verb, never "proves" — the function IS the claim about
// what this object does, and it has to be readable without the connector.
export function EvidenceCapsule({
  id,
  fn,
  span,
  quoted,
  question,
  disclosure,
  className = "",
}: EvidenceCapsuleProps) {
  return (
    <div
      className={`p-4 space-y-3 ${className}`}
      style={{
        border: "1px solid var(--border-default)",
        background: "var(--xco-paper-raised)",
      }}
    >
      <p className="font-mono font-medium text-[0.75rem] leading-[1.4] uppercase tracking-widest text-xco-ink-muted">
        {id} / {fn} / {span}
      </p>

      <p
        className="font-body text-[24px] leading-[26px] text-xco-ink pl-3"
        style={{ borderLeft: "2px dotted var(--xco-ink)" }}
      >
        “{quoted}”
      </p>

      <p className="font-body text-[24px] leading-[26px] text-xco-ink-muted">
        {question}
      </p>

      <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
        {disclosure.map((d) => (
          <span
            key={d}
            className="font-mono font-medium text-[0.75rem] leading-[1.4] uppercase tracking-wider text-xco-ink-muted"
          >
            {d}
          </span>
        ))}
      </div>
    </div>
  );
}
