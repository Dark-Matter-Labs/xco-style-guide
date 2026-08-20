import Link from "next/link";
import { WIP } from "@/components/WIP";
import {
  operators,
  notationContract,
  operatorWalkthrough,
  spatialOperators,
  attentionBeats,
  readingProbes,
} from "@/lib/polyphonic";
import { LABEL, BODY, MONO, SMALL, DISPLAY, ROW, RULE } from "../styles";

export default function OperatorsPage() {
  return (
    <div className="max-w-6xl mx-auto px-8 py-12 space-y-24">
      <header className="space-y-4 pb-6">
        <Link href="/grammar" className={`${MONO} text-xco-ink-muted hover:text-xco-dusk transition-colors`}>
          ← Grammar
        </Link>
        <div className="flex items-baseline justify-between">
          <h1 className="doc-title text-xco-ink">Operators</h1>
          <WIP variant="version" />
        </div>
      </header>

      <section className="max-w-2xl space-y-4">
        <p className={BODY}>
          A mark has affordances, not a universal meaning. Angle brackets may tag,
          enclose, quote, type or capture. Italics may voice, move, doubt or
          perform. Their meaning arises from what they touch and what the
          composition asks the reader to do.
        </p>
        <p className={`${MONO} text-xco-ink`}>
          [rule] Operator + operand + context. A mark is an action upon a specific
          utterance — never an isolated token.
        </p>
      </section>

      {/* Operator table */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className={LABEL}>Eleven operations</h2>
          <p className={`${BODY} max-w-2xl`}>
            Each operation carries a possible enactment, a political risk, and a
            recovery obligation that must be met if it is used.
          </p>
        </div>

        <div className="space-y-0">
          {operators.map((op) => (
            <div key={op.id} className="py-6 space-y-4" style={{ borderTop: RULE }}>
              <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
                <p className={`${MONO} text-xco-ink`}>{op.operation}</p>
                <p className={DISPLAY}>{op.does}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:pl-[256px]">
                <div>
                  <p className={`${SMALL} text-xco-ink-muted uppercase tracking-widest mb-1`}>
                    Possible enactment
                  </p>
                  <p className={`${SMALL} text-xco-ink`}>{op.enactment}</p>
                </div>
                <div>
                  <p className={`${SMALL} uppercase tracking-widest mb-1`} style={{ color: "var(--xco-dusk)" }}>
                    Political risk
                  </p>
                  <p className={`${SMALL} text-xco-ink`}>{op.risk}</p>
                </div>
                <div>
                  <p className={`${SMALL} text-xco-ink-muted uppercase tracking-widest mb-1`}>
                    Recovery obligation
                  </p>
                  <p className={`${SMALL} text-xco-ink`}>{op.recovery}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Notation contract */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className={LABEL}>The local notation contract</h2>
          <p className={`${BODY} max-w-2xl`}>
            A connector has no inherent universal meaning. Once a composition
            declares its relation contract, each visual jurisdiction is exclusive
            and stable throughout that work.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {notationContract.map((c) => (
            <div key={c.n} className="space-y-1 pt-3" style={{ borderTop: "1.5px solid var(--xco-ink)" }}>
              <p className={`${SMALL} text-xco-ink-muted tracking-widest`}>{c.n}</p>
              <p className={`${MONO} text-xco-ink`}>{c.field}</p>
              <p className={`${SMALL} text-xco-ink-muted`}>{c.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Worked walkthrough */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className={LABEL}>Every relation needs a sentence transcript</h2>
          <p className={`${BODY} max-w-2xl`}>
            One utterance carried through five operations and recovered. The
            recovery step returns the whole without erasing the analysis.
          </p>
        </div>
        <div className="space-y-0 max-w-3xl">
          {operatorWalkthrough.map((w) => (
            <div
              key={w.step}
              className="grid grid-cols-[100px_1fr] sm:grid-cols-[100px_220px_1fr] gap-4 py-3"
              style={{ borderBottom: ROW }}
            >
              <p className={`${SMALL} text-xco-ink-muted uppercase tracking-widest pt-1`}>{w.step}</p>
              <p className={`${MONO} text-xco-ink`}>{w.form}</p>
              <p className={`${SMALL} text-xco-ink-muted col-span-2 sm:col-span-1`}>{w.meaning}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Spatial operators */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className={LABEL}>Space is an operator</h2>
          <p className={`${BODY} max-w-2xl`}>
            Whitespace, line breaks, position and scale all perform semantic work.
            Each carries a governing question that must be answerable.
          </p>
        </div>
        <div className="space-y-0">
          {spatialOperators.map((s) => (
            <div key={s.act} className="grid grid-cols-1 lg:grid-cols-[180px_1fr_1fr] gap-4 py-4" style={{ borderBottom: ROW }}>
              <p className={`${MONO} text-xco-ink`}>{s.act}</p>
              <p className={`${SMALL} text-xco-ink`}>{s.work}</p>
              <p className={`${SMALL} text-xco-ink-muted italic`}>{s.question}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Attention score */}
      <section className="space-y-8 pb-8">
        <div className="space-y-2">
          <h2 className={LABEL}>Attention score</h2>
          <p className={`${BODY} max-w-2xl`}>
            Hierarchy is not only a ladder. It is an attractor field controlling
            first sight, retrieval, interruption, suspension and rereading.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {readingProbes.map((p) => (
            <div key={p.at} className="space-y-1 pt-3" style={{ borderTop: "1.5px solid var(--xco-dusk)" }}>
              <p className={`${MONO} text-xco-ink`}>{p.at}</p>
              <p className={`${SMALL} text-xco-ink uppercase tracking-widest`}>{p.goal}</p>
              <p className={`${SMALL} text-xco-ink-muted`}>{p.detail}</p>
            </div>
          ))}
        </div>
        <p className={`${SMALL} text-xco-ink-muted`}>
          [heuristic] Design probes — validate with readers, not by assertion.
        </p>

        <div className="space-y-0 pt-4">
          {attentionBeats.map((b) => (
            <div key={b.n} className="grid grid-cols-[40px_140px_1fr] gap-4 py-3" style={{ borderBottom: ROW }}>
              <p className={`${SMALL} text-xco-ink-muted pt-1`}>{b.n}</p>
              <p className={`${MONO} text-xco-ink`}>{b.beat}</p>
              <p className={`${SMALL} text-xco-ink-muted`}>{b.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
