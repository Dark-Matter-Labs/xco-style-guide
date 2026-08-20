import Link from "next/link";
import { WIP } from "@/components/WIP";
import { LicenceBadge, RelationEdge } from "@/components/xco";
import {
  topologies,
  conceptFieldElements,
  lineageSteps,
  lineageTests,
  transpositionInvariants,
  transpositionRecomposable,
} from "@/lib/polyphonic";
import { LABEL, BODY, MONO, SMALL, DISPLAY, ROW, RULE } from "../styles";

export default function TopologiesPage() {
  return (
    <div className="max-w-6xl mx-auto px-8 py-12 space-y-24">
      <header className="space-y-4 pb-6">
        <Link href="/grammar" className={`${MONO} text-xco-ink-muted hover:text-xco-dusk transition-colors`}>
          ← Grammar
        </Link>
        <div className="flex items-baseline justify-between">
          <h1 className="doc-title text-xco-ink">Topologies</h1>
          <WIP variant="version" />
        </div>
      </header>

      <section className="max-w-2xl space-y-4">
        <p className={BODY}>
          A concept field shows what a proposition contains. An evidence mantle
          shows what bears upon it. A reasoning lineage shows what follows — and
          why. Choosing the wrong one is not a styling error; it makes a
          different claim.
        </p>
        <p className={`${MONO} text-xco-ink`}>
          [rule] Semantic topology ≠ evidential topology ≠ inferential topology.
        </p>
      </section>

      {/* Modules */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className={LABEL}>Five modules, typed at the boundary</h2>
          <p className={`${BODY} max-w-2xl`}>
            Each module imports named IDs and exports named IDs. The typed
            boundary is what lets an argument be inspected rather than trusted.
          </p>
        </div>
        <div className="space-y-0">
          {topologies.map((t) => (
            <div key={t.id} className="py-6 space-y-4" style={{ borderTop: RULE }}>
              <div className="flex flex-wrap items-baseline gap-4">
                <p className={`${MONO} text-xco-ink`}>{t.code}</p>
                <p className={DISPLAY}>{t.name}</p>
                <LicenceBadge licence={t.licence as "explanation" | "decision"} />
              </div>
              <p className={BODY}>{t.shows}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <p className={`${SMALL} text-xco-ink-muted uppercase tracking-widest mb-1`}>Imports</p>
                  <p className={`${SMALL} text-xco-ink`}>{t.imports}</p>
                </div>
                <div>
                  <p className={`${SMALL} text-xco-ink-muted uppercase tracking-widest mb-1`}>Exports</p>
                  <p className={`${SMALL} text-xco-ink`}>{t.exports}</p>
                </div>
              </div>
              <p className={`${SMALL} text-xco-ink-muted`}>{t.route}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Concept field elements */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className={LABEL}>Concept field — required function, automatic failure</h2>
          <p className={`${BODY} max-w-2xl`}>
            A concept field begins with one grammatically complete proposition.
            The sentence must be readable aloud without reconstructing it from
            fragments.
          </p>
        </div>
        <div className="space-y-0">
          {conceptFieldElements.map((e) => (
            <div key={e.element} className="grid grid-cols-1 lg:grid-cols-[200px_1fr_1fr] gap-4 py-4" style={{ borderBottom: ROW }}>
              <p className={`${MONO} text-xco-ink`}>{e.element}</p>
              <p className={`${SMALL} text-xco-ink`}>{e.required}</p>
              <p className={`${SMALL}`} style={{ color: "var(--xco-dusk)" }}>✗ {e.failure}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reasoning lineage */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className={LABEL}>Reasoning lineage</h2>
          <p className={`${BODY} max-w-2xl`}>
            Every node carries one proposition. Every edge states one defensible
            verb. Evidence, inference, value, assumption, authority, decision and
            consequence stay distinguishable even when they interact.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {lineageTests.map((t) => (
            <div key={t.test} className="space-y-1 pt-3" style={{ borderTop: "1.5px solid var(--xco-ink)" }}>
              <p className={`${MONO} text-xco-ink`}>{t.test}</p>
              <p className={`${SMALL} text-xco-ink uppercase tracking-widest`}>{t.rule}</p>
              <p className={`${SMALL} text-xco-ink-muted`}>{t.detail}</p>
            </div>
          ))}
        </div>

        <div className="space-y-0 max-w-3xl pt-4">
          {lineageSteps.map((s) => (
            <div key={s.id}>
              <div className="grid grid-cols-[60px_1fr] gap-4 py-4">
                <p className={`${MONO} text-xco-ink pt-0.5`}>{s.id}</p>
                <div className="space-y-1 min-w-0">
                  <p className={`${SMALL} text-xco-ink-muted uppercase tracking-widest`}>{s.node}</p>
                  <p className={BODY}>{s.proposition}</p>
                  <p className={`${SMALL} text-xco-ink-muted`}>{s.detail}</p>
                </div>
              </div>
              {s.edgeOut && s.edgeCode && (
                <div className="grid grid-cols-[60px_1fr] gap-4 pb-2">
                  <div />
                  <div className="flex items-center gap-3">
                    <RelationEdge code={s.edgeCode} width={56} />
                    <p className={`${SMALL} text-xco-ink-muted`}>{s.edgeOut}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="max-w-3xl p-5" style={{ background: "var(--xco-paper-quiet)" }}>
          <p className={BODY}>
            Because <strong>X</strong>, through mechanism <strong>Y</strong>, state{" "}
            <strong>Z</strong> changes; therefore <strong>Q</strong> follows —
            unless <strong>U</strong> — with gains and liabilities across{" "}
            <strong>V</strong>, implying <strong>R</strong>.
          </p>
        </div>
      </section>

      {/* Transposition */}
      <section className="space-y-8 pb-8">
        <div className="space-y-2">
          <h2 className={LABEL}>Transposition</h2>
          <p className={`${BODY} max-w-2xl`}>
            Responsive design is semantic transposition, not visual reduction.
            Coordinates may change; the proposition, relation types, authored
            pauses, reader roles and choice parity may not.
          </p>
          <p className={`${MONO} text-xco-ink pt-2`}>
            [rule] If the narrow version becomes a centred stack, the words
            survive but the argument may not.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-3">
            <p className={`${MONO} text-xco-ink uppercase tracking-widest`}>Must remain invariant</p>
            <ul className="space-y-2">
              {transpositionInvariants.map((i) => (
                <li key={i} className={`${SMALL} text-xco-ink pl-4`} style={{ borderLeft: "2px solid var(--xco-ink)" }}>
                  {i}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <p className={`${MONO} text-xco-ink-muted uppercase tracking-widest`}>May recompose</p>
            <ul className="space-y-2">
              {transpositionRecomposable.map((i) => (
                <li key={i} className={`${SMALL} text-xco-ink-muted pl-4`} style={{ borderLeft: "1px dashed var(--border-strong)" }}>
                  {i}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-0 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr_1fr_1fr] gap-4 py-3" style={{ borderBottom: RULE }}>
            {["Topology", "Wide", "Narrow", "Invariant"].map((h) => (
              <p key={h} className={`${SMALL} text-xco-ink-muted uppercase tracking-widest`}>{h}</p>
            ))}
          </div>
          {topologies.slice(0, 4).map((t) => (
            <div key={t.id} className="grid grid-cols-1 lg:grid-cols-[180px_1fr_1fr_1fr] gap-4 py-4" style={{ borderBottom: ROW }}>
              <p className={`${MONO} text-xco-ink`}>{t.name}</p>
              <p className={`${SMALL} text-xco-ink-muted`}>{t.wide}</p>
              <p className={`${SMALL} text-xco-ink-muted`}>{t.narrow}</p>
              <p className={`${SMALL} text-xco-ink`}>{t.invariant}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
