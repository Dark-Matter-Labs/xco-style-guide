import Link from "next/link";
import { WIP } from "@/components/WIP";
import { CopyButton } from "@/components/CopyButton";
import {
  materialAttention,
  materialPrinciples,
  materialTreatments,
  imageryContract,
  composeIntro,
  compositionSteps,
  failureIsInformative,
  compositionBrief,
  compositionBriefText,
} from "@/lib/polyphonic";
import { LABEL, BODY, MONO, SMALL, DISPLAY, ROW, RULE } from "../styles";

// v6.1 §08 and §12 — the material grammar (image, texture, light, motion)
// and the method that closes the guide: compose, test with readers, revise.

export default function ComposePage() {
  return (
    <div className="doc-wrap py-12 space-y-24">
      <header className="space-y-4 pb-6">
        <Link href="/grammar" className={`${MONO} text-xco-ink-muted hover:text-xco-dusk-ink transition-colors`}>
          ← Grammar
        </Link>
        <div className="flex items-baseline justify-between">
          <h1 className="doc-display text-xco-ink">Compose &amp; material</h1>
          <WIP variant="version" />
        </div>
      </header>

      {/* §08 */}
      <section className="max-w-2xl space-y-4">
        <p className={`${BODY} font-display text-[36px] leading-[40px]`}>{materialAttention.claim}</p>
        <p className={BODY}>{materialAttention.aim}</p>
      </section>

      <section className="space-y-8">
        <h2 className={LABEL}>Material attention</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl">
          {materialPrinciples.map((p) => (
            <div key={p.name} className="space-y-2 pt-3" style={{ borderTop: "1.5px solid var(--xco-ink)" }}>
              <p className={`${SMALL} text-xco-ink-muted uppercase tracking-widest`}>{p.name}</p>
              <p className={DISPLAY}>{p.rule}</p>
              <p className={`${SMALL} text-xco-ink-muted`}>{p.detail}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
          {materialTreatments.map((t) => (
            <div key={t.name} className="space-y-2">
              <p className={`${MONO} text-xco-ink uppercase tracking-widest`}>{t.name}</p>
              <p className={BODY}>{t.rule}</p>
              <p className={`${SMALL} text-xco-ink-muted`}>{t.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className={LABEL}>Working with imagery</h2>
          <p className={`${BODY} max-w-2xl`}>
            Every image declares its status. The system&apos;s own generators
            do: each event-series card carries [ IMAGE / PHOTOGRAPH,
            TRANSFORMED ] for the globes and [ IMAGE / GENERATED ] for the
            ASCII fields.
          </p>
        </div>
        <div className="space-y-0 max-w-4xl">
          {imageryContract.map((c) => (
            <div key={c.status} className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4 py-4" style={{ borderBottom: ROW }}>
              <p className={`${MONO} text-xco-ink`}>[{c.status.toUpperCase()}]</p>
              <p className={`${SMALL} text-xco-ink-muted`}>{c.detail}</p>
            </div>
          ))}
        </div>
        <p className={`${MONO} text-xco-ink whitespace-pre-line`}>{materialAttention.disposition.replace(/\. /g, ".\n")}</p>
      </section>

      {/* §12 */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className={LABEL}>Build a composition that can learn</h2>
          <p className={`${BODY} max-w-2xl`}>{composeIntro.method}</p>
        </div>
        <ol className="space-y-0">
          {compositionSteps.map((s) => (
            <li key={s.n} className="grid grid-cols-[40px_1fr] sm:grid-cols-[40px_300px_1fr] gap-5 py-4" style={{ borderBottom: ROW }}>
              <p className={`${SMALL} text-xco-ink-muted pt-1`}>{s.n}</p>
              <p className={`${MONO} text-xco-ink`}>{s.step}</p>
              <p className={`${SMALL} text-xco-ink-muted col-span-2 sm:col-span-1`}>{s.detail}</p>
            </li>
          ))}
        </ol>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <p className={`${SMALL} text-xco-ink`}>[failure] {failureIsInformative}</p>
          <p className={`${SMALL} text-xco-ink`}>[validation] {composeIntro.validation}</p>
          <p className={`${SMALL} text-xco-ink`}>[machine] {composeIntro.machine}</p>
        </div>
      </section>

      <section className="space-y-6 pb-8">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <h2 className={LABEL}>A compact composition brief</h2>
          <CopyButton text={compositionBriefText()} label="Copy the brief" />
        </div>
        <dl className="max-w-4xl space-y-0" style={{ borderTop: RULE }}>
          {compositionBrief.map((b) => (
            <div key={b.field} className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-3 py-3" style={{ borderBottom: ROW }}>
              <dt className={`${MONO} text-xco-ink`}>{b.field}</dt>
              <dd className={`${SMALL} text-xco-ink-muted`}>{b.prompt}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
