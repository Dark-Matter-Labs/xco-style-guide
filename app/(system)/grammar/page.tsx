import Link from "next/link";
import { WIP } from "@/components/WIP";
import { LicenceBadge } from "@/components/xco";
import {
  licences,
  constitutionSteps,
  principles,
  performedRelation,
  GRAMMAR_SOURCE,
} from "@/lib/polyphonic";

const LABEL =
  "font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase";
const BODY = "font-body text-[24px] text-xco-ink leading-[26px]";
const MONO = "font-mono font-medium text-[0.9375rem] leading-[1.6]";
const SMALL = "font-mono font-medium text-[0.75rem] leading-[1.4]";

const pages = [
  { href: "/grammar/operators", label: "Operators", detail: "What marks do to exact utterances." },
  { href: "/grammar/relations", label: "Relations", detail: "Eight connector jurisdictions, kept exclusive." },
  { href: "/grammar/topologies", label: "Topologies", detail: "Concept field, evidence mantle, reasoning lineage, decision surface." },
  { href: "/grammar/reader", label: "Reader & power", detail: "Who speaks, who is recruited, who carries the consequence." },
  { href: "/grammar/integrity", label: "Integrity", detail: "Ambiguity classes, release gates, anti-patterns." },
];

export default function GrammarPage() {
  return (
    <div className="max-w-6xl mx-auto px-8 py-12 space-y-24">
      <header className="flex items-baseline justify-between pb-6">
        <h1 className="doc-title text-xco-ink">Grammar</h1>
        <WIP variant="version" />
      </header>

      <section className="max-w-2xl space-y-4">
        <p className={BODY}>
          {GRAMMAR_SOURCE.governingProposition}
        </p>
        <p className={BODY}>
          The visual system governs how a thing looks. This governs what it{" "}
          <em>does</em> — to a reader, with what consequence, and under whose
          authority. Colour, serif, italic and orientation are affordances here,
          not semantic laws.
        </p>
        <p className={`${MONO} text-xco-ink pt-2`}>
          [{GRAMMAR_SOURCE.version}] {GRAMMAR_SOURCE.maxim}
        </p>
      </section>

      {/* Performed relation */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className={LABEL}>The performed relation</h2>
          <p className={`${BODY} max-w-2xl`}>
            The fundamental unit is not the mark. It is what form does to an exact
            utterance, when the reader meets it, how it positions them, and with
            what consequence.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {performedRelation.map((r) => (
            <div key={r.axis} className="space-y-2 pt-3" style={{ borderTop: "1.5px solid var(--xco-ink)" }}>
              <p className={`${MONO} text-xco-ink`}>{r.axis}</p>
              <p className={`${BODY} font-display`}>{r.question}</p>
              <p className={`${SMALL} text-xco-ink-muted`}>{r.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Licences */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className={LABEL}>Licence follows consequence</h2>
          <p className={`${BODY} max-w-2xl`}>
            The same composition cannot be equally ambiguous when opening a
            question, proving a claim and obtaining consent. A work may move
            between licences, but the transition must be legible. An element
            serving two licences inherits the stricter one.
          </p>
        </div>

        <div className="space-y-6">
          {licences.map((l) => (
            <div
              key={l.id}
              className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 pt-5"
              style={{ borderTop: "1px solid var(--border-default)" }}
            >
              <div className="space-y-3">
                <p className={`${SMALL} text-xco-ink-muted tracking-widest`}>{l.n}</p>
                <LicenceBadge licence={l.id} />
                <p className={`${SMALL} text-xco-ink-muted`}>{l.subtitle}</p>
              </div>
              <div className="space-y-3 min-w-0">
                <p className={`${BODY} font-display text-[36px] leading-[40px]`}>{l.task}</p>
                <p className={BODY}>{l.permits}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className={`${SMALL} text-xco-ink-muted uppercase tracking-widest mb-1`}>
                      Permitted ambiguity
                    </p>
                    <p className={`${MONO} text-xco-ink`}>{l.ambiguity}</p>
                  </div>
                  <div>
                    <p className={`${SMALL} text-xco-ink-muted uppercase tracking-widest mb-1`}>
                      Required landing
                    </p>
                    <p className={`${MONO} text-xco-ink`}>{l.landing}</p>
                  </div>
                </div>
                <p className={`${MONO} text-xco-ink pt-1`}>
                  [obligation] {l.obligation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Constitution steps */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className={LABEL}>Authoring sequence</h2>
          <p className={`${BODY} max-w-2xl`}>
            Five steps, in order. Release tests consequence — not polish alone.
          </p>
        </div>
        <div className="space-y-0">
          {constitutionSteps.map((s) => (
            <div
              key={s.n}
              className="grid grid-cols-[40px_1fr] sm:grid-cols-[40px_180px_1fr] gap-5 py-4"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <p className={`${SMALL} text-xco-ink-muted pt-1`}>{s.n}</p>
              <p className={`${MONO} text-xco-ink`}>{s.name}</p>
              <div className="col-span-2 sm:col-span-1 space-y-1 min-w-0">
                <p className={BODY}>{s.instruction}</p>
                <p className={`${SMALL} text-xco-ink-muted`}>{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Principles */}
      <section className="space-y-8">
        <h2 className={LABEL}>Six principles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {principles.map((p) => (
            <div key={p.n} className="space-y-2">
              <p className={`${SMALL} text-xco-ink-muted tracking-widest`}>
                {p.n} / {p.name.toUpperCase()}
              </p>
              <p className={`${MONO} text-xco-ink`}>{p.claim}</p>
              <p className={`${SMALL} text-xco-ink-muted`}>{p.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sub-pages */}
      <section className="space-y-8 pb-8">
        <h2 className={LABEL}>In detail</h2>
        <nav className="space-y-0">
          {pages.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="group flex items-baseline justify-between gap-6 py-4 hover:text-xco-ocean transition-colors"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <span className={`${BODY} group-hover:text-xco-ocean transition-colors`}>
                {p.label}
              </span>
              <span className={`${SMALL} text-xco-ink-muted text-right shrink-0 max-w-xs`}>
                {p.detail}
              </span>
            </Link>
          ))}
        </nav>
      </section>
    </div>
  );
}
