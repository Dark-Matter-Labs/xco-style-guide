import Link from "next/link";
import {
  materialWorldIntro,
  materialWorldSteps,
  worldGrammar,
  imageBrief,
  imageBriefMedium,
  materialWorldClose,
  questionToForm,
  formCompositions,
} from "@/lib/polyphonic";
import { LABEL, BODY, MONO, SMALL, DISPLAY, ROW, RULE } from "../styles";

// v8.1 §08B (material worlds) and the §12 question-to-form guide.

/** Where each dominant form is worked on this site. */
const FORM_HREF: Record<string, string> = {
  "Spatial score": "/grammar/page",
  "Evidence constellation": "/grammar/relations",
  "Situated Atlas": "/grammar/atlas",
  "Proof Block": "/grammar/proof",
  "Decision Surface": "/grammar/commitment",
};

export function MaterialWorlds() {
  return (
    <section className="space-y-8" aria-labelledby="worlds">
      <div className="space-y-4 max-w-2xl">
        <h2 id="worlds" className={LABEL}>08B / Material worlds</h2>
        <p className={DISPLAY}>{materialWorldIntro.title}</p>
        <p className={`${MONO} text-xco-ink`}>{materialWorldIntro.line}</p>
        <p className={BODY}>{materialWorldIntro.body}</p>
        <p className={`${SMALL} text-xco-ink-muted`}>[status] {materialWorldIntro.status}</p>
      </div>

      <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {materialWorldSteps.map((s, i) => (
          <li key={s.id} className="space-y-2 pt-3" style={{ borderTop: "1.5px solid var(--xco-ink)" }}>
            <p className={`${MONO} text-xco-ink`}>{String(i + 1).padStart(2, "0")} / {s.id}</p>
            <p className={`${BODY} font-display`}>{s.line}</p>
            <p className={`${SMALL} text-xco-ink-muted`}>{s.body}</p>
          </li>
        ))}
      </ol>

      <div className="space-y-4">
        <h3 className={`${SMALL} text-xco-ink-muted uppercase tracking-widest`}>World grammar — choices to make before production</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className={`${SMALL} text-xco-ink-muted uppercase tracking-widest`}>
                <th className="py-2 pr-4 font-medium">Dimension</th>
                <th className="py-2 pr-4 font-medium">Author&apos;s choice</th>
                <th className="py-2 font-medium">What must remain clear</th>
              </tr>
            </thead>
            <tbody>
              {worldGrammar.map((w) => (
                <tr key={w.dimension} className={`${SMALL} text-xco-ink align-top`} style={{ borderTop: ROW }}>
                  <td className="py-3 pr-4">{w.dimension}</td>
                  <td className="py-3 pr-4">{w.choice}</td>
                  <td className="py-3">{w.clear}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="max-w-3xl p-6 space-y-3" style={{ border: RULE, background: "var(--panel)" }}>
        <p className={`${SMALL} text-xco-ink-muted uppercase tracking-widest`}>A usable image brief</p>
        <p className={`${BODY} font-display italic`}>&ldquo;{imageBrief}&rdquo;</p>
        <p className={`${SMALL} text-xco-ink-muted`}>{imageBriefMedium}</p>
      </div>

      <p className={`${DISPLAY} max-w-2xl`}>
        {materialWorldClose.map((l) => (
          <span key={l} className="block">{l}</span>
        ))}
      </p>
    </section>
  );
}

export function QuestionToForm() {
  return (
    <section className="space-y-8" aria-labelledby="question-to-form">
      <div className="space-y-2 max-w-2xl">
        <h2 id="question-to-form" className={LABEL}>Choose the form by the question</h2>
        <p className={BODY}>
          Begin with the question and the reader&apos;s possible next encounter.
          Choose a dominant form, then bring in another where it reveals a
          different relation. Each form keeps its own unit.
        </p>
      </div>
      <ol className="space-y-0">
        {questionToForm.map((q) => (
          <li key={q.form} className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr_1.4fr] gap-x-8 gap-y-2 py-5" style={{ borderTop: ROW }}>
            <div className="space-y-1">
              <p className={`${BODY} font-display`}>{q.question}</p>
              <p className={`${MONO} text-xco-ink`}>
                {FORM_HREF[q.form] ? (
                  <Link href={FORM_HREF[q.form]} className="underline underline-offset-2 hover:text-xco-dusk-ink">{q.form}</Link>
                ) : (
                  q.form
                )}
                <span className="text-xco-ink-muted"> · {q.licence}</span>
              </p>
            </div>
            <p className={`${SMALL} text-xco-ink`}>
              <span className="text-xco-ink-muted">Keep recoverable — </span>
              {q.keep}
            </p>
            <p className={`${SMALL} text-xco-ink`}>
              <span className="text-xco-ink-muted">Useful companion — </span>
              {q.companion}
            </p>
          </li>
        ))}
      </ol>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {formCompositions.map((c) => (
          <div key={c.name} className="space-y-2 pt-3" style={{ borderTop: RULE }}>
            <p className={`${SMALL} text-xco-ink-muted uppercase tracking-widest`}>Composition / {c.name}</p>
            <p className={`${BODY} font-display`}>{c.line}</p>
            <p className={`${SMALL} text-xco-ink`}>{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
