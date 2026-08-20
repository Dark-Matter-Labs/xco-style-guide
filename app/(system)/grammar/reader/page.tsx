import Link from "next/link";
import { WIP } from "@/components/WIP";
import { AgentTag } from "@/components/xco";
import {
  readerPositions,
  politicalChecksum,
  agentTypes,
  addressHazards,
  institutionalActs,
  decisionObject,
  consentRules,
} from "@/lib/polyphonic";
import { LABEL, BODY, MONO, SMALL, DISPLAY, ROW, RULE } from "../styles";

export default function ReaderPage() {
  return (
    <div className="max-w-6xl mx-auto px-8 py-12 space-y-24">
      <header className="space-y-4 pb-6">
        <Link href="/grammar" className={`${MONO} text-xco-ink-muted hover:text-xco-dusk transition-colors`}>
          ← Grammar
        </Link>
        <div className="flex items-baseline justify-between">
          <h1 className="doc-title text-xco-ink">Reader &amp; power</h1>
          <WIP variant="version" />
        </div>
      </header>

      <section className="max-w-2xl space-y-4">
        <p className={BODY}>
          “I”, “we”, “you” and “they” do not merely identify voices. They allocate
          membership, burden, ownership and agency. A page may constitute its
          reader as witness, claimant, constituent, data subject, collaborator,
          customer or consenting party — and those roles carry different rights.
        </p>
      </section>

      {/* Five positions */}
      <section className="space-y-8">
        <h2 className={LABEL}>Five positions to name</h2>
        <div className="space-y-0">
          {readerPositions.map((p) => (
            <div key={p.n} className="grid grid-cols-[40px_1fr] sm:grid-cols-[40px_220px_1fr] gap-5 py-4" style={{ borderBottom: ROW }}>
              <p className={`${SMALL} text-xco-ink-muted pt-1`}>{p.n}</p>
              <p className={`${MONO} text-xco-ink`}>{p.role}</p>
              <div className="col-span-2 sm:col-span-1 space-y-1 min-w-0">
                <p className={BODY}>{p.question}</p>
                <p className={`${SMALL} text-xco-ink-muted`}>{p.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Political checksum */}
      <section className="space-y-6">
        <h2 className={LABEL}>The political checksum</h2>
        <p className={`${BODY} max-w-2xl`}>
          Every composition should disclose all six. If one cannot be answered,
          the composition is not ready.
        </p>
        <div className="flex flex-wrap gap-3">
          {politicalChecksum.map((c) => (
            <span
              key={c}
              className={`${MONO} px-3 py-1.5 text-xco-ink`}
              style={{ border: "1px solid var(--xco-ink)" }}
            >
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* Address hazards */}
      <section className="space-y-8">
        <h2 className={LABEL}>Address hazards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {addressHazards.map((h) => (
            <div key={h.name} className="space-y-1 pt-3" style={{ borderTop: "1.5px solid var(--xco-ink)" }}>
              <p className={`${MONO} text-xco-ink`}>{h.name}</p>
              <p className={`${SMALL} text-xco-ink uppercase tracking-widest`}>{h.rule}</p>
              <p className={`${SMALL} text-xco-ink-muted`}>{h.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Agent typing */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className={LABEL}>The passive-voice burden audit</h2>
          <p className={`${BODY} max-w-2xl`}>
            “May have been used” is epistemically cautious, but the acting party
            disappears. Opacity must be typed — and the last of these four is a
            defect, not a label to ship.
          </p>
        </div>
        <div className="space-y-4 max-w-3xl">
          {agentTypes.map((a) => (
            <div key={a.id} className="flex flex-col sm:flex-row sm:items-baseline gap-3 py-3" style={{ borderBottom: ROW }}>
              <div className="shrink-0">
                <AgentTag type={a.id} />
              </div>
              <p className={`${BODY} min-w-0`}>{a.meaning}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Decision object */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className={LABEL}>The decision object</h2>
          <p className={`${BODY} max-w-2xl`}>
            The Decision licence begins whenever a reader can consent, submit,
            disclose, waive, authorise, pay, enrol or allocate. At that boundary,
            rhetoric yields to agency and every field below must be exposed.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
          {decisionObject.map((d) => (
            <div key={d.field} className="space-y-1 pt-2" style={{ borderTop: ROW }}>
              <p className={`${MONO} text-xco-ink`}>{d.field}</p>
              <p className={`${SMALL} text-xco-ink-muted`}>{d.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Consent rules */}
      <section className="space-y-8">
        <h2 className={LABEL}>Consent at the point of state change</h2>
        <div className="space-y-0 max-w-3xl">
          {consentRules.map((c) => (
            <div key={c.rule} className="py-4 space-y-1" style={{ borderBottom: ROW }}>
              <p className={DISPLAY}>{c.rule}</p>
              <p className={`${SMALL} text-xco-ink-muted`}>{c.detail}</p>
            </div>
          ))}
        </div>
        <p className={`${MONO} text-xco-ink max-w-2xl`}>
          [rule] An encounter may simulate an interface. It may not simulate
          consent. Consent is a provenance-bearing state transition, not a mood.
        </p>
      </section>

      {/* Institutional acts */}
      <section className="space-y-8 pb-8">
        <div className="space-y-2">
          <h2 className={LABEL}>Institutional acts</h2>
          <p className={`${BODY} max-w-2xl`}>
            Minimum disclosure and required exit, by act. The exit is not
            optional — an act without one is not legible as a choice.
          </p>
        </div>
        <div className="space-y-0">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_1fr] gap-4 py-3" style={{ borderBottom: RULE }}>
            {["Act", "Minimum disclosure", "Required exit"].map((h) => (
              <p key={h} className={`${SMALL} text-xco-ink-muted uppercase tracking-widest`}>{h}</p>
            ))}
          </div>
          {institutionalActs.map((a) => (
            <div key={a.act} className="grid grid-cols-1 lg:grid-cols-[200px_1fr_1fr] gap-4 py-4" style={{ borderBottom: ROW }}>
              <p className={`${MONO} text-xco-ink`}>{a.act}</p>
              <p className={`${SMALL} text-xco-ink`}>{a.disclosure}</p>
              <p className={`${SMALL} text-xco-ink`}>{a.exit}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
