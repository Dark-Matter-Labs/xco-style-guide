import Link from "next/link";
import { WIP } from "@/components/WIP";
import { AmbiguityTag } from "@/components/xco";
import {
  ambiguityClasses,
  releaseTests,
  releaseGates,
  antiPatterns,
  compositionalProportion,
  channelJurisdictions,
} from "@/lib/polyphonic";
import { LABEL, BODY, MONO, SMALL, DISPLAY, ROW, RULE } from "../styles";

export default function IntegrityPage() {
  return (
    <div className="max-w-6xl mx-auto px-8 py-12 space-y-24">
      <header className="space-y-4 pb-6">
        <Link href="/grammar" className={`${MONO} text-xco-ink-muted hover:text-xco-dusk transition-colors`}>
          ← Grammar
        </Link>
        <div className="flex items-baseline justify-between">
          <h1 className="doc-title text-xco-ink">Integrity</h1>
          <WIP variant="version" />
        </div>
      </header>

      <section className="max-w-2xl space-y-4">
        <p className={BODY}>
          Difficulty is licensed only when it reveals a relation easier prose
          would conceal. Accidental ambiguity is a defect. Divergent consequence
          is a blocker.
        </p>
        <p className={`${MONO} text-xco-ink`}>
          [rule] Integrity is a release condition, not a review note.
        </p>
      </section>

      {/* Release tests */}
      <section className="space-y-8">
        <h2 className={LABEL}>Two tests every release passes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl">
          {releaseTests.map((t) => (
            <div key={t.n} className="space-y-2 pt-3" style={{ borderTop: "1.5px solid var(--xco-ink)" }}>
              <p className={`${SMALL} text-xco-ink-muted tracking-widest`}>{t.n}</p>
              <p className={DISPLAY}>{t.name}</p>
              <p className={`${SMALL} text-xco-ink-muted`}>{t.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ambiguity classes */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className={LABEL}>Ambiguity classes</h2>
          <p className={`${BODY} max-w-2xl`}>
            Record designed ambiguity as primary reading, alternate reading,
            purpose, resolution point and consequence if misread. A0–A3 are
            licensed under conditions. AX is always a reject.
          </p>
        </div>
        <div className="space-y-0 max-w-3xl">
          {ambiguityClasses.map((a) => (
            <div key={a.code} className="flex flex-col sm:flex-row sm:items-baseline gap-4 py-4" style={{ borderBottom: ROW }}>
              <div className="shrink-0">
                <AmbiguityTag code={a.code} />
              </div>
              <div className="space-y-1 min-w-0">
                <p className={BODY}>{a.rule}</p>
                <p className={`${SMALL} text-xco-ink-muted`}>{a.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Release gates */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className={LABEL}>Eight release gates</h2>
          <p className={`${BODY} max-w-2xl`}>
            No gate is “not applicable” without a written rationale. Release order:
            licence → recovery + surplus → reader + power → relations + evidence +
            lineage → consent → responsive + access.
          </p>
        </div>
        <div className="space-y-0">
          {releaseGates.map((g) => (
            <div key={g.n} className="py-5 space-y-2" style={{ borderTop: RULE }}>
              <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
                <div>
                  <p className={`${SMALL} text-xco-ink-muted tracking-widest`}>{g.n}</p>
                  <p className={`${MONO} text-xco-ink`}>{g.name}</p>
                </div>
                <div className="space-y-2 min-w-0">
                  <p className={BODY}>{g.action}</p>
                  <p className={`${SMALL} text-xco-ink-muted`}>{g.detail}</p>
                  <p className={`${SMALL} pt-1`} style={{ color: "var(--xco-dusk)" }}>
                    [block] {g.blocker}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Channel jurisdictions */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className={LABEL}>One jurisdiction per channel</h2>
          <p className={`${BODY} max-w-2xl`}>
            Never ask one hue to carry domain, status and sequence at once. This
            is the same rule the semantic meanings follow with shape — the channel
            is the carrier, and it can only carry one thing.
          </p>
        </div>
        <div className="space-y-0 max-w-3xl">
          {channelJurisdictions.map((c) => (
            <div key={c.channel} className="grid grid-cols-1 sm:grid-cols-[200px_1fr_1fr] gap-4 py-4" style={{ borderBottom: ROW }}>
              <p className={`${MONO} text-xco-ink`}>{c.channel}</p>
              <p className={`${SMALL} text-xco-ink`}>carries {c.carries}</p>
              <p className={`${SMALL}`} style={{ color: "var(--xco-dusk)" }}>✗ never {c.never}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Compositional proportion */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className={LABEL}>Chromatic discipline</h2>
          <p className={`${BODY} max-w-2xl`}>
            Area roles, not colour families. Signal derives its force from
            scarcity — this is the same discipline as the 5% dusk rule on the
            colour page, stated as a full-composition budget.
          </p>
        </div>
        <div className="max-w-3xl space-y-3">
          <div className="flex h-16 overflow-hidden" style={{ border: "1px solid var(--border-default)" }}>
            {compositionalProportion.map((p) => (
              <div
                key={p.role}
                style={{
                  width: `${p.pct}%`,
                  background:
                    p.role === "canvas" ? "var(--xco-paper)"
                    : p.role === "structure" ? "var(--xco-paper-structural)"
                    : p.role === "trace" ? "var(--domain-inst)"
                    : "var(--xco-dusk)",
                }}
                title={`${p.pct}% ${p.role}`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {compositionalProportion.map((p) => (
              <p key={p.role} className={`${SMALL} text-xco-ink`}>
                <span className="text-xco-ink-muted">{p.pct} /</span> {p.role} — {p.detail}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Anti-patterns */}
      <section className="space-y-8 pb-8">
        <div className="space-y-2">
          <h2 className={LABEL}>Anti-pattern index</h2>
          <p className={`${BODY} max-w-2xl`}>
            Named failures. Each one is a way a composition can look rigorous
            while doing something else.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          {antiPatterns.map((a) => (
            <div key={a.name} className="space-y-1 pl-4" style={{ borderLeft: "2px solid var(--xco-dusk)" }}>
              <p className={`${MONO} text-xco-ink`}>{a.name}</p>
              <p className={`${SMALL} text-xco-ink-muted`}>{a.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
