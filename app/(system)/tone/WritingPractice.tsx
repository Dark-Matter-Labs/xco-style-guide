import { CopyButton } from "@/components/CopyButton";
import { writingPractices, practiceSource, practiceMarkdown } from "@/lib/writing-practice";

const LABEL = "font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase";
const BODY = "font-body text-[24px] text-xco-ink leading-[26px]";
const MONO = "font-mono font-medium text-[0.9375rem] leading-[1.6]";
const SMALL = "font-mono font-medium text-[0.75rem] leading-[1.5]";

// The practices sit after the voice: the voice says who xCO is when it
// writes; these are what a writer does before a text goes out. Each carries
// the guard against its own failure mode, and the question the pause asks.

export function WritingPractice() {
  return (
    <section className="space-y-10" style={{ borderTop: "1.5px solid var(--xco-ink)" }} aria-labelledby="writing-practice">
      <div className="max-w-2xl space-y-4 pt-6">
        <h2 id="writing-practice" className={LABEL}>Writing practice — before it goes out</h2>
        <p className={BODY}>
          The voice says who we are when we write. These are what a writer does
          before a text goes out — five habits, each with the guard against its
          own failure.
        </p>
        <p className={`${SMALL} text-xco-ink-muted`}>{practiceSource}</p>
      </div>

      <div className="space-y-0">
        {writingPractices.map((p, i) => (
          <article
            key={p.id}
            className="grid grid-cols-1 lg:grid-cols-[180px_1fr_260px] gap-x-10 gap-y-4 py-8"
            style={{ borderTop: "1px solid var(--border-default)" }}
          >
            <p className={`${SMALL} text-xco-ink-muted uppercase tracking-widest`}>
              {String(i + 1).padStart(2, "0")} / {p.name}
            </p>
            <div className="space-y-3 min-w-0">
              <h3 className="font-display text-[36px] leading-[40px] text-xco-ink">{p.line}</h3>
              <p className={`${BODY} max-w-2xl`}>{p.body}</p>
              <p className={`${MONO} text-xco-ink max-w-2xl`}>[guard] {p.guard}</p>
            </div>
            <aside className="space-y-2 lg:pt-2" aria-label={`${p.name}: the question to ask`}>
              <p className={`${SMALL} text-xco-ink-muted uppercase tracking-widest`}>Ask</p>
              <p className={`${MONO} text-xco-ink`}>{p.question}</p>
              <p className={`${SMALL} text-xco-ink-muted`}>{p.source}</p>
            </aside>
          </article>
        ))}
      </div>

      <div className="max-w-3xl p-6 space-y-3" style={{ border: "1px solid var(--border-default)", background: "var(--panel)" }}>
        <p className={`${SMALL} text-xco-ink-muted uppercase tracking-widest`}>The pause, in the prompt templates</p>
        <p className={BODY}>
          Every template below asks for the audience, the signature and the work
          drawn on, and makes the model end its draft with these five questions —
          for the writer, unanswered.
        </p>
        <ol className="space-y-1 list-decimal pl-6">
          {writingPractices.map((p) => (
            <li key={p.id} className={`${MONO} text-xco-ink`}>{p.question}</li>
          ))}
        </ol>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <CopyButton text={practiceMarkdown()} label="Copy as Markdown — for the wiki and website" />
      </div>
    </section>
  );
}
