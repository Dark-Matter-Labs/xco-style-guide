import Link from "next/link";
import { WIP } from "@/components/WIP";
import {
  generativeIntro,
  generativeFraming,
  generativeOperations,
  hopeConditions,
  legitimateOutcomes,
  registerAndVoice,
  situatedVoiceRules,
  workingForms,
  workingFormsNote,
} from "@/lib/polyphonic";
import { LABEL, BODY, MONO, SMALL, DISPLAY, ROW, RULE } from "../styles";

// v6.1 §02 and §00B — the generative centre. Every diagram here is drawn as
// a sentence transcript as well as a figure: the steps and their named edges
// read in order, so nothing is carried by position alone.

export default function GenerativePage() {
  return (
    <div className="doc-wrap py-12 space-y-24">
      <header className="space-y-4 pb-6">
        <Link href="/grammar" className={`${MONO} text-xco-ink-muted hover:text-xco-dusk-ink transition-colors`}>
          ← Grammar
        </Link>
        <div className="flex items-baseline justify-between">
          <h1 className="doc-display text-xco-ink">Generative relations</h1>
          <WIP variant="version" />
        </div>
      </header>

      <section className="max-w-2xl space-y-4">
        <p className={`${BODY} font-display text-[36px] leading-[40px]`}>What can a relation make possible?</p>
        <p className={BODY}>{generativeIntro.claim}</p>
        <p className={BODY}>{generativeIntro.method}</p>
        <p className={`${MONO} text-xco-ink`}>[rule] {generativeIntro.force}</p>
      </section>

      <section className="space-y-8">
        <h2 className={LABEL}>Hope, given a structure</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl">
          {generativeFraming.map((f) => (
            <div key={f.name} className="space-y-2 pt-3" style={{ borderTop: "1.5px solid var(--xco-ink)" }}>
              <p className={`${SMALL} text-xco-ink-muted uppercase tracking-widest`}>{f.name}</p>
              <p className={DISPLAY}>{f.rule}</p>
              <p className={`${SMALL} text-xco-ink-muted`}>{f.detail}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl">
          <div className="space-y-2">
            <p className={`${MONO} text-xco-ink`}>Conditions that keep a possibility available</p>
            <p className={`${SMALL} text-xco-ink-muted`}>{hopeConditions.join(" · ")}</p>
          </div>
          <div className="space-y-2">
            <p className={`${MONO} text-xco-ink`}>Legitimate outcomes, beside agreement</p>
            <p className={`${SMALL} text-xco-ink-muted`}>{legitimateOutcomes.join(" · ")}</p>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className={LABEL}>Four generative operations</h2>
          <p className={`${BODY} max-w-2xl`}>
            They extend the operator grammar. Each specimen below is an authored
            example of the operation; no measured effects, real testimony or
            achieved coordination are represented.
          </p>
        </div>
        <div className="space-y-0">
          {generativeOperations.map((op) => (
            <article key={op.id} className="py-8 space-y-5" style={{ borderTop: RULE }}>
              <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
                <div className="space-y-1">
                  <h3 className={`${MONO} text-xco-ink uppercase tracking-widest`}>{op.name}</h3>
                  <p className={`${SMALL} text-xco-ink-muted`}>{op.id}</p>
                </div>
                <div className="space-y-4 min-w-0">
                  <p className={DISPLAY}>{op.title}</p>
                  <p className={BODY}>{op.rule}</p>
                </div>
              </div>
              {/* The specimen, as an ordered sequence: step, named edge, step. */}
              <ol className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_auto_1fr] gap-3 items-stretch">
                {op.steps.map(([head, body], i) => (
                  <li key={head} className="contents">
                    <div className="p-4 space-y-1" style={{ border: RULE }}>
                      <p className={`${MONO} text-xco-ink`}>{head}</p>
                      <p className={`${SMALL} text-xco-ink-muted`}>{body}</p>
                    </div>
                    {i < op.edges.length && (
                      <p className={`${SMALL} text-xco-ink-muted self-center lg:max-w-[9rem] lg:text-center`}>
                        → {op.edges[i]}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
              <p className={`${SMALL} text-xco-ink max-w-3xl`}>[limit] {op.limit}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className={LABEL}>A situated voice can change the question</h2>
          <p className={`${BODY} max-w-2xl`}>
            Registers and voices are different things. Several exact accounts can
            change one shared question without being absorbed into compulsory
            agreement.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl">
          {registerAndVoice.map((r) => (
            <div key={r.name} className="space-y-2 pt-3" style={{ borderTop: "1.5px solid var(--xco-ink)" }}>
              <p className={DISPLAY}>{r.name}</p>
              <p className={`${SMALL} text-xco-ink-muted`}>{r.detail}</p>
            </div>
          ))}
        </div>
        <ul className="space-y-0 max-w-3xl">
          {situatedVoiceRules.map((rule) => (
            <li key={rule} className={`${SMALL} text-xco-ink py-3`} style={{ borderBottom: ROW }}>
              {rule}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-8 pb-8">
        <div className="space-y-2">
          <h2 className={LABEL}>Five working forms</h2>
          <p className={`${BODY} max-w-2xl`}>
            Five ways to make a relation readable. They can share a case without
            becoming interchangeable; each has its own relation contract and a
            sequential equivalent.
          </p>
        </div>
        <div className="space-y-0">
          {workingForms.map((f) => (
            <div key={f.n} className="grid grid-cols-[40px_1fr] sm:grid-cols-[40px_220px_1fr] gap-5 py-4" style={{ borderBottom: ROW }}>
              <p className={`${SMALL} text-xco-ink-muted pt-1`}>{f.n}</p>
              <div className="space-y-1">
                <p className={`${MONO} text-xco-ink`}>
                  {f.name} {f.code && <span className="text-xco-ink-muted">· {f.code}</span>}
                </p>
                <p className={`${SMALL} text-xco-ink-muted`}>{f.does}</p>
              </div>
              <p className={`${SMALL} text-xco-ink col-span-2 sm:col-span-1`}>{f.rule}</p>
            </div>
          ))}
        </div>
        <p className={`${SMALL} text-xco-ink-muted max-w-3xl`}>[source] {workingFormsNote}</p>
      </section>
    </div>
  );
}
