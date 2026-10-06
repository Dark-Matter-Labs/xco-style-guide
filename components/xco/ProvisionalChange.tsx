import Link from "next/link";
import { isProvisional, statusLabel, type ChangeRecord } from "@/lib/provisional";
import { identityScales } from "@/lib/design-tokens";

// One suggested change, shown where a reader meets it. The status is written
// in words; the lavender fill (8.1's provisional-state highlight) supports the
// label and never carries it alone. The previous wording stays visible as a
// <del>, the proposal as an <ins>, each with a spoken prefix so the relation
// survives without colour or strikethrough.

const MONO = "font-mono font-medium text-[0.75rem] leading-[1.5]";
const HL_TEXT = identityScales.matter[900];

export function ProvisionalChange({ change, compact = false }: { change: ChangeRecord; compact?: boolean }) {
  const open = isProvisional(change.status);
  return (
    <aside
      aria-label={`${open ? "Provisional change" : "Change record"} ${change.id}: ${change.title}`}
      className="space-y-2 py-3 pl-4"
      style={{ borderLeft: `2px ${open ? "dashed" : "solid"} var(--xco-ink)` }}
    >
      <p className={`${MONO} text-xco-ink`}>
        [{open ? "PROVISIONAL" : "RECORD"} / {statusLabel(change.status).toLowerCase()}] {change.id} · proposed by {change.proposedBy} · {change.date}
      </p>
      {!compact && (
        <p className="font-body text-[20px] leading-[26px] text-xco-ink">
          {change.href ? (
            <Link href={change.href} className="underline underline-offset-2 hover:text-xco-dusk-ink">{change.title}</Link>
          ) : (
            change.title
          )}
          <span className={`${MONO} text-xco-ink-muted`}> · {change.target}</span>
        </p>
      )}
      {(change.previous || change.proposed) && (
        <p className="font-body text-[18px] leading-[28px] text-xco-ink">
          {change.previous && (
            <>
              <span className="sr-only">Current wording: </span>
              <del className="text-xco-ink-muted">{change.previous}</del>{" "}
              <span aria-hidden>→ </span>
            </>
          )}
          {change.proposed && (
            <>
              <span className="sr-only">{open ? "Proposed wording: " : "Adopted wording: "}</span>
              <ins
                className="no-underline px-1"
                style={open ? { backgroundColor: "var(--xco-hl-provisional)", color: HL_TEXT } : undefined}
              >
                {change.proposed}
              </ins>
            </>
          )}
        </p>
      )}
      <p className={`${MONO} text-xco-ink-muted`}>Why: {change.why}</p>
      {change.decision && <p className={`${MONO} text-xco-ink-muted`}>Decision: {change.decision}</p>}
      {change.respond && (
        <a href={change.respond.href} className={`${MONO} text-xco-ink underline underline-offset-2 hover:text-xco-dusk-ink inline-block py-1`}>
          {open ? "Respond" : "Record"} → {change.respond.label}
        </a>
      )}
    </aside>
  );
}
