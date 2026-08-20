type Register = "default" | "quiet" | "inverse";

interface DocSectionProps {
  /** Left-column kicker, e.g. "01 / Domain colour". */
  kicker?: string;
  /** Section heading, set tight and negative in the serif face. */
  title?: string;
  /** Intro paragraphs — sit in the reading column, aligned to the label grid. */
  intro?: React.ReactNode;
  register?: Register;
  id?: string;
  children: React.ReactNode;
  className?: string;
}

// The v2 section: a 210px label column carrying the kicker, a reading column
// carrying the heading and intro, and body content that hangs from 252px —
// the label column plus its gutter.
export function DocSection({
  kicker,
  title,
  intro,
  register = "default",
  id,
  children,
  className = "",
}: DocSectionProps) {
  const inner = (
    <div className="doc-wrap">
      {(kicker || title) && (
        <div className="doc-head">
          <p className="doc-label mt-[7px]">{kicker}</p>
          {title && <h2 className="doc-h2 text-xco-ink">{title}</h2>}
        </div>
      )}
      {intro && <div className="doc-intro">{intro}</div>}
      {children}
    </div>
  );

  // A dark section sets the attribute the colour page documents, so the
  // surface tokens swap themselves rather than being overridden here.
  if (register === "inverse") {
    return (
      <section
        id={id}
        data-register="inverse"
        className={`doc-section ${className}`}
        style={{ background: "var(--xco-paper)", color: "var(--xco-ink)" }}
      >
        {inner}
      </section>
    );
  }

  return (
    <section
      id={id}
      className={`doc-section ${className}`}
      style={register === "quiet" ? { background: "var(--xco-paper-quiet)" } : undefined}
    >
      {inner}
    </section>
  );
}
