import Link from "next/link";
import { WIP } from "@/components/WIP";
import { LicenceBadge } from "@/components/xco";
import { commitmentMaxim, commitmentCertainty, decisionRules, boundedInquiry } from "@/lib/polyphonic";
import { LABEL, BODY, MONO, SMALL, DISPLAY, ROW, RULE } from "../styles";

// v6.1 §07 — precise commitments. The decision object, consent rules and
// institutional acts stay on the Reader & power page, where v5 put them; this
// page carries what 6.1 adds: the split between a determinate commitment and
// its uncertain effects, and the bounded-inquiry specimen.

export default function CommitmentPage() {
  return (
    <div className="doc-wrap py-12 space-y-24">
      <header className="space-y-4 pb-6">
        <Link href="/grammar" className={`${MONO} text-xco-ink-muted hover:text-xco-dusk-ink transition-colors`}>
          ← Grammar
        </Link>
        <div className="flex items-baseline justify-between">
          <h1 className="doc-display text-xco-ink">Commitment</h1>
          <WIP variant="version" />
        </div>
      </header>

      <section className="max-w-2xl space-y-4">
        <p className={`${BODY} font-display text-[36px] leading-[40px]`}>{commitmentMaxim.line}</p>
        <p className={BODY}>{commitmentMaxim.boundary}</p>
        <p className={`${SMALL} text-xco-ink-muted`}>{commitmentMaxim.separation}</p>
        <p className={`${SMALL} text-xco-ink-muted`}>
          [v5] Interpretive meaning may remain open; institutional consequence may not. — superseded by the line above.
        </p>
      </section>

      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className={LABEL}>Two kinds of certainty</h2>
          <p className={`${BODY} max-w-2xl`}>The state change and its effects have different kinds of certainty.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl">
          {commitmentCertainty.map((c) => (
            <div key={c.kind} className="space-y-2 pt-3" style={{ borderTop: "1.5px solid var(--xco-ink)" }}>
              <p className={DISPLAY}>{c.kind}</p>
              <p className={`${SMALL} text-xco-ink-muted`}>State {c.states.charAt(0).toLowerCase() + c.states.slice(1)}</p>
            </div>
          ))}
        </div>
        <p className={`${MONO} text-xco-ink max-w-3xl`}>[reversal] {commitmentMaxim.reversal}</p>
      </section>

      <section className="space-y-8">
        <h2 className={LABEL}>At the decision boundary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {decisionRules.map((r) => (
            <div key={r.name} className="space-y-2">
              <p className={`${SMALL} text-xco-ink-muted uppercase tracking-widest`}>{r.name}</p>
              <p className={`${MONO} text-xco-ink`}>{r.rule}</p>
              <p className={`${SMALL} text-xco-ink-muted`}>{r.detail}</p>
            </div>
          ))}
        </div>
        <p className={`${SMALL} text-xco-ink-muted`}>
          The full decision object, consent rules and institutional-act disclosures are on{" "}
          <Link href="/grammar/reader" className="underline underline-offset-2 text-xco-ink">
            Reader &amp; power
          </Link>
          .
        </p>
      </section>

      <section className="space-y-8 pb-8">
        <div className="space-y-2">
          <h2 className={LABEL}>A commitment can begin before the pathway is known</h2>
          <p className={`${BODY} max-w-2xl`}>
            An authorised group could commit to investigating while the service
            hypotheses remain unresolved. The inquiry has its own purpose,
            resource limit, mandate and participant rights; the hypotheses inform
            what to investigate, they do not authorise the work.
          </p>
        </div>
        <article className="max-w-4xl p-6 space-y-5" style={{ border: RULE, background: "var(--panel)" }}>
          <div className="flex flex-wrap items-center gap-3">
            <LicenceBadge licence="decision" />
            <p className={`${SMALL} text-xco-ink-muted`}>
              {boundedInquiry.id} / non-operative · all quantities and mandates illustrative
            </p>
          </div>
          <p className={DISPLAY}>{boundedInquiry.proposal}</p>
          <p className={`${SMALL} text-xco-ink-muted`}>{boundedInquiry.note}</p>
          <dl className="space-y-0">
            {boundedInquiry.fields.map((f) => (
              <div key={f.field} className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-3 py-3" style={{ borderTop: ROW }}>
                <dt className={`${MONO} text-xco-ink`}>{f.field}</dt>
                <dd className={`${SMALL} text-xco-ink-muted`}>{f.detail}</dd>
              </div>
            ))}
          </dl>
          <p className={`${MONO} text-xco-ink`}>[separate] {boundedInquiry.separate}</p>
        </article>
      </section>
    </div>
  );
}
