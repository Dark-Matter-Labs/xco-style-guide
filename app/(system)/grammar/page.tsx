import Link from "next/link";
import { WIP } from "@/components/WIP";
import { LicenceBadge } from "@/components/xco";
import {
  licences,
  constitutionSteps,
  principles,
  performedRelation,
  referencesIntro,
  referenceStudies,
  referenceGrammars,
  referenceDepths,
  GRAMMAR_SOURCE,
} from "@/lib/polyphonic";

const LABEL =
  "font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase";
const BODY = "font-body text-[24px] text-xco-ink leading-[26px]";
const MONO = "font-mono font-medium text-[0.9375rem] leading-[1.6]";
const SMALL = "font-mono font-medium text-[0.75rem] leading-[1.4]";

const pages = [
  { href: "/grammar/generative", label: "Generative relations", detail: "Differentiate, reciprocate, hold open, sustain — and situated voices." },
  { href: "/grammar/operators", label: "Operators", detail: "What marks do to exact utterances." },
  { href: "/grammar/relations", label: "Relations", detail: "Eight connector jurisdictions, kept exclusive." },
  { href: "/grammar/page", label: "Page & margin", detail: "Field, spine, rule, mark, margin, return — and the questioning margin." },
  { href: "/grammar/topologies", label: "Topologies", detail: "Thirteen modules, from situated accounts to annotation." },
  { href: "/grammar/proof", label: "Proof block", detail: "A proposition with its premises, thresholds, losses and reopening tests." },
  { href: "/grammar/atlas", label: "Situated atlas", detail: "Several accounts in motion through one field." },
  { href: "/grammar/reader", label: "Reader & power", detail: "Who speaks, who is recruited, who carries the consequence." },
  { href: "/grammar/commitment", label: "Commitment", detail: "A precise commitment; its effects kept open to inquiry." },
  { href: "/grammar/integrity", label: "Integrity", detail: "Ambiguity classes, release tests and gates, anti-patterns." },
  { href: "/grammar/compose", label: "Compose & material", detail: "Material worlds, choosing a form by the question, the brief." },
  { href: "/grammar/identity", label: "Identity & production", detail: "The local registry, reusable HTML/CSS and a portable record." },
];

export default function GrammarPage() {
  return (
    <div className="doc-wrap py-12 space-y-24">
      <header className="flex items-baseline justify-between pb-6">
        <h1 className="doc-display text-xco-ink">Grammar</h1>
        <WIP variant="version" />
      </header>

      <section className="max-w-2xl space-y-4">
        <p className={`${SMALL} text-xco-ink-muted uppercase tracking-widest`}>
          {GRAMMAR_SOURCE.subtitle}
        </p>
        <p className={`${BODY} font-display text-[36px] leading-[40px]`}>
          {GRAMMAR_SOURCE.opening}
        </p>
        <p className={`${BODY} font-display italic`}>{GRAMMAR_SOURCE.question}</p>
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
          [{GRAMMAR_SOURCE.version}] {GRAMMAR_SOURCE.constitutionalLine}
        </p>
        <p className={`${SMALL} text-xco-ink-muted`}>
          From the {GRAMMAR_SOURCE.title} {GRAMMAR_SOURCE.version}, {GRAMMAR_SOURCE.date}. It supersedes{" "}
          {GRAMMAR_SOURCE.supersedes} and keeps its foundations whole; its palette is the one on the{" "}
          <Link href="/colour" className="underline underline-offset-2">colour page</Link>.
        </p>
      </section>

      {/* Seven references, five grammars (§00B) */}
      <section className="space-y-8" aria-labelledby="references">
        <div className="space-y-3 max-w-2xl">
          <h2 id="references" className={LABEL}>Seven references, five grammars</h2>
          <p className={`${BODY} font-display text-[36px] leading-[40px]`}>{referencesIntro.title}</p>
          <p className={`${MONO} text-xco-ink`}>{referencesIntro.line}</p>
          <p className={BODY}>{referencesIntro.body}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className={`${SMALL} text-xco-ink-muted uppercase tracking-widest`}>
                <th className="py-2 pr-4 font-medium">Grammar</th>
                <th className="py-2 pr-4 font-medium">Unit</th>
                <th className="py-2 pr-4 font-medium">What it adds</th>
                <th className="py-2 font-medium">Worked in</th>
              </tr>
            </thead>
            <tbody>
              {referenceGrammars.map((g) => (
                <tr key={g.grammar} className={`${SMALL} text-xco-ink align-top`} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  <td className="py-3 pr-4">{g.grammar}</td>
                  <td className="py-3 pr-4">{g.unit}</td>
                  <td className="py-3 pr-4">{g.adds}</td>
                  <td className="py-3">
                    <Link href={g.href} className="underline underline-offset-2 hover:text-xco-dusk-ink">{g.where}</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          {referenceStudies.map((r) => (
            <article key={r.id} className="space-y-2 pt-3" style={{ borderTop: "1px solid var(--border-default)" }}>
              <p className={`${SMALL} text-xco-ink-muted uppercase tracking-widest`}>Reference {r.n} / {r.name}</p>
              <p className={`${BODY} font-display`}>{r.line}</p>
              <p className={`${SMALL} text-xco-ink`}><span className="text-xco-ink-muted">Observed — </span>{r.observed}</p>
              <p className={`${SMALL} text-xco-ink`}><span className="text-xco-ink-muted">Transfer — </span>{r.transfer}</p>
              <p className={`${SMALL} text-xco-ink`}><span className="text-xco-ink-muted">Design limit — </span>{r.limit}</p>
            </article>
          ))}
        </div>
        <p className={`${MONO} text-xco-ink max-w-2xl`}>[use] {referencesIntro.use}</p>
        <p className={`${BODY} font-display max-w-2xl`}>
          {referenceDepths.map((d) => (
            <span key={d} className="block">{d}</span>
          ))}
        </p>
      </section>

      {/* Performed relation */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className={LABEL}>The performed relation</h2>
          <p className={`${BODY} max-w-2xl`}>
            The fundamental unit is not the mark. It is the performed relation:
            what form does to an utterance, how voices encounter one another,
            what the reader can now notice or do, and with what consequence.
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
            The licence follows what a composition enables: encountering a
            condition, inspecting an account or making a commitment. A work may
            move between licences, but the transition must be legible. An
            element serving two licences inherits the stricter one.
          </p>
          <p className={`${MONO} text-xco-ink max-w-2xl`}>
            [maxim] {GRAMMAR_SOURCE.maxim}
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
        <nav className="space-y-0" aria-label="Grammar pages">
          {pages.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="group flex items-baseline justify-between gap-6 py-4 hover:text-xco-ocean-ink transition-colors"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <span className={`${BODY} group-hover:text-xco-ocean-ink transition-colors`}>
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
