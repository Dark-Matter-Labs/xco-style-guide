type Register = "default" | "quiet" | "dotted" | "inverse";

interface DocSectionProps {
  /** Sticky serif numeral in the left rail, e.g. "01". Omit for no numeral. */
  n?: string;
  /** Small mono label above the heading. */
  kicker?: string;
  /** Section heading, set in the fluid display scale. */
  title?: string;
  /** Large serif standfirst under the heading. */
  lede?: string;
  /** Content for the right-hand rail. Only shown at ≥1200px. */
  side?: React.ReactNode;
  register?: Register;
  id?: string;
  children: React.ReactNode;
  className?: string;
}

// The three-column section: sticky numeral rail, reading column, side rail.
// `inverse` uses the guide's own data-register attribute rather than a bespoke
// dark class, so a dark section is literally the documented inverse register.
export function DocSection({
  n,
  kicker,
  title,
  lede,
  side,
  register = "default",
  id,
  children,
  className = "",
}: DocSectionProps) {
  const bg =
    register === "quiet" ? "doc-quiet"
    : register === "dotted" ? "doc-quiet doc-dotted"
    : register === "inverse" ? "" : "";

  const inner = (
    <div className={`doc-grid ${side ? "doc-grid-rail" : ""}`}>
      <div className="doc-index">
        {n && (
          <>
            <span className="doc-numeral">{n}</span>
            <span className="doc-numeral-rule" />
          </>
        )}
      </div>

      <div className="min-w-0 space-y-8">
        {(kicker || title || lede) && (
          <header className="space-y-4">
            {kicker && (
              <p className="font-mono font-medium text-[0.75rem] leading-[1.4] uppercase tracking-widest text-xco-ink-muted">
                {kicker}
              </p>
            )}
            {title && <h2 className="doc-h2 text-xco-ink">{title}</h2>}
            {lede && <p className="doc-lede max-w-[42ch]">{lede}</p>}
          </header>
        )}
        {children}
      </div>

      {side && (
        <aside className="doc-side doc-side-sticky hidden xl:grid">{side}</aside>
      )}
    </div>
  );

  if (register === "inverse") {
    // The attribute swaps the surface tokens; the element then paints with them.
    return (
      <section
        id={id}
        data-register="inverse"
        className={`doc-section ${className}`}
        style={{ background: "var(--xco-paper)", color: "var(--xco-ink)" }}
      >
        <div className="max-w-6xl mx-auto px-8">{inner}</div>
      </section>
    );
  }

  return (
    <section id={id} className={`doc-section ${bg} ${className}`}>
      <div className="max-w-6xl mx-auto px-8">{inner}</div>
    </section>
  );
}
