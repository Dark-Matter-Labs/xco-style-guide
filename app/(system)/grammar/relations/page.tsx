import Link from "next/link";
import { WIP } from "@/components/WIP";
import { RelationEdge, EvidenceCapsule } from "@/components/xco";
import {
  relationJurisdictions,
  epistemicFunctions,
  logicalDistinctions,
  evidenceContract,
  evidenceTypeDisclosures,
} from "@/lib/polyphonic";
import { LABEL, BODY, MONO, SMALL, DISPLAY, ROW, RULE } from "../styles";

export default function RelationsPage() {
  return (
    <div className="doc-wrap py-12 space-y-24">
      <header className="space-y-4 pb-6">
        <Link href="/grammar" className={`${MONO} text-xco-ink-muted hover:text-xco-dusk transition-colors`}>
          ← Grammar
        </Link>
        <div className="flex items-baseline justify-between">
          <h1 className="doc-display text-xco-ink">Relations</h1>
          <WIP variant="version" />
        </div>
      </header>

      <section className="max-w-2xl space-y-4">
        <p className={BODY}>
          Eight connector jurisdictions. Once a composition declares its relation
          contract, each becomes exclusive and stable throughout that work.
        </p>
        <p className={`${MONO} text-xco-ink`}>
          [rule] The line syntax carries the jurisdiction. Never ask colour to do
          it — a relation that exists only in colour fails release gate 06.
        </p>
      </section>

      {/* Jurisdictions */}
      <section className="space-y-8">
        <h2 className={LABEL}>Eight jurisdictions</h2>
        <div className="space-y-0">
          {relationJurisdictions.map((r) => (
            <div key={r.code} className="py-5 space-y-3" style={{ borderTop: RULE }}>
              <div className="grid grid-cols-1 lg:grid-cols-[40px_100px_1fr] gap-4 items-baseline">
                <p className={`${MONO} text-xco-ink`}>{r.code}</p>
                <div className="flex items-center h-4">
                  <RelationEdge code={r.code} />
                </div>
                <p className={DISPLAY}>{r.name}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:pl-[172px]">
                <div>
                  <p className={`${SMALL} text-xco-ink-muted uppercase tracking-widest mb-1`}>Syntax</p>
                  <p className={`${SMALL} text-xco-ink`}>{r.syntax}</p>
                </div>
                <div>
                  <p className={`${SMALL} text-xco-ink-muted uppercase tracking-widest mb-1`}>Means</p>
                  <p className={`${SMALL} text-xco-ink`}>{r.means}</p>
                </div>
                <div>
                  <p className={`${SMALL} uppercase tracking-widest mb-1`} style={{ color: "var(--xco-dusk)" }}>Never</p>
                  <p className={`${SMALL} text-xco-ink`}>{r.never}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Logical distinctions */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className={LABEL}>Three distinctions the grammar exists to hold</h2>
          <p className={`${BODY} max-w-2xl`}>
            Evidence function is a property of the declared relation — not of
            proximity, colour, scale or centrality. These are logical statements,
            not an empirical model.
          </p>
        </div>
        <div className="space-y-4 max-w-3xl">
          {logicalDistinctions.map((d) => (
            <div
              key={d.formula}
              className="p-4 space-y-2"
              style={{ background: "var(--xco-paper-quiet)" }}
            >
              <p className={`${MONO} text-xco-ink`}>{d.formula}</p>
              <p className={`${SMALL} text-xco-ink-muted`}>{d.gloss}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Epistemic function vocabulary */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className={LABEL}>Function vocabulary</h2>
          <p className={`${BODY} max-w-2xl`}>
            Use precise epistemic verbs. Reserve <em>proves</em> for deduction —
            most documentary and empirical relations support, constrain or contest
            rather than prove.
          </p>
        </div>
        <div className="space-y-0 max-w-3xl">
          {epistemicFunctions.map((f) => (
            <div key={f.verb} className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-4 py-3" style={{ borderBottom: ROW }}>
              <p className={`${MONO} text-xco-ink`}>{f.verb}</p>
              <p className={`${SMALL} text-xco-ink-muted`}>{f.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Worked evidence capsule */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className={LABEL}>Evidence capsule</h2>
          <p className={`${BODY} max-w-2xl`}>
            One evidence object joined to one exact span. The function verb states
            what the object does; the disclosure strip states how it was produced
            and where it stops.
          </p>
        </div>
        <p className={`${SMALL} text-xco-ink-muted`}>
          [ CONSTRUCTED EXAMPLE / NOT EMPIRICAL EVIDENCE ]
        </p>
        <div className="space-y-4 max-w-3xl">
          <EvidenceCapsule
            id="E1"
            fn="identifies"
            span="span S1"
            quoted="the neighbourhood"
            question="Which governed boundary and affected population does the source mean?"
            disclosure={["PLACE-ID", "BOUNDARY VERSION", "VALID INTERVAL", "RESOLUTION METHOD", "UNCERTAINTY"]}
          />
          <EvidenceCapsule
            id="E4"
            fn="tests absence"
            span="span S4"
            quoted="the contingency fund remained unreleased"
            question="Can absence be inferred from this ledger's scope, completeness and recording rules?"
            disclosure={["LEDGER SCOPE", "COMPLETENESS", "QUERY", "RESULT", "AUTHORITY", "LIMIT"]}
          />
        </div>
        <p className={`${MONO} text-xco-ink max-w-3xl`}>
          [rule] E1 identifies the intended place boundary. It does not establish
          who has standing, or who the source excludes.
        </p>
      </section>

      {/* Evidence contract */}
      <section className="space-y-8">
        <h2 className={LABEL}>The evidence-object contract</h2>
        <div className="space-y-0 max-w-3xl">
          {evidenceContract.map((c) => (
            <div key={c.field} className="grid grid-cols-1 sm:grid-cols-[240px_1fr] gap-4 py-3" style={{ borderBottom: ROW }}>
              <p className={`${MONO} text-xco-ink`}>{c.field}</p>
              <p className={`${SMALL} text-xco-ink-muted`}>{c.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Type disclosures */}
      <section className="space-y-8 pb-8">
        <div className="space-y-2">
          <h2 className={LABEL}>Additional disclosure by evidence type</h2>
          <p className={`${BODY} max-w-2xl`}>
            What each object type must declare, and what it must never be allowed
            to imply silently.
          </p>
        </div>
        <div className="space-y-0">
          {evidenceTypeDisclosures.map((e) => (
            <div key={e.type} className="grid grid-cols-1 lg:grid-cols-[200px_1fr_1fr] gap-4 py-4" style={{ borderBottom: ROW }}>
              <p className={`${MONO} text-xco-ink`}>{e.type}</p>
              <p className={`${SMALL} text-xco-ink`}>{e.required}</p>
              <p className={`${SMALL}`} style={{ color: "var(--xco-dusk)" }}>
                ✗ {e.neverImply}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
