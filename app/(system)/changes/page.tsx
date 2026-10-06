import { WIP } from "@/components/WIP";
import { CopyButton } from "@/components/CopyButton";
import { ProvisionalChange } from "@/components/xco";
import {
  changeLog,
  changeStatuses,
  provisionalRules,
  isProvisional,
  provisionalMarkdown,
  provisionalPrompt,
  provisionalHTML,
  provisionalCSS,
  changeMarkdown,
} from "@/lib/provisional";

// The style guide's own change record, and the convention it follows: a
// suggested change is provisional until a named person adopts it, and it stays
// visible — with what it replaces — while it is open. The same convention is
// exported for the wiki (Markdown + an agent instruction) and the website
// (HTML/CSS).

const LABEL = "font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase";
const BODY = "font-body text-[24px] text-xco-ink leading-[26px]";
const MONO = "font-mono font-medium text-[0.9375rem] leading-[1.6]";
const SMALL = "font-mono font-medium text-[0.75rem] leading-[1.5]";
const ROW = "1px solid var(--border-subtle)";

const open = changeLog.filter((c) => isProvisional(c.status));
const settled = changeLog.filter((c) => !isProvisional(c.status));

function Code({ label, code }: { label: string; code: string }) {
  return (
    <figure className="space-y-3 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <figcaption className={`${SMALL} text-xco-ink-muted uppercase tracking-widest`}>{label}</figcaption>
        <CopyButton text={code} label={`Copy ${label.split(" —")[0]}`} />
      </div>
      <pre tabIndex={0} aria-label={label} className={`${SMALL} text-xco-ink overflow-x-auto p-4`} style={{ border: "1px solid var(--border-default)", background: "var(--panel)" }}>
        <code>{code}</code>
      </pre>
    </figure>
  );
}

export default function ChangesPage() {
  return (
    <div className="doc-wrap py-12 space-y-20">
      <header className="flex items-baseline justify-between pb-6">
        <h1 className="doc-display text-xco-ink">Changes</h1>
        <WIP variant="version" />
      </header>

      <section className="max-w-2xl space-y-4">
        <p className="font-display text-[36px] leading-[40px] text-xco-ink">
          A suggested change is provisional until someone adopts it.
        </p>
        <p className={BODY}>
          We show changes where they live, with the wording they replace. A
          reader can see what is current, what is proposed, who proposed it and
          how to respond. Adoption creates a new version. The previous words
          stay in the record.
        </p>
        <p className={`${SMALL} text-xco-ink-muted`}>
          After the Polyphonic Communication Style Guide v8.1: an annotation that
          proposes a change keeps its target version and response state.
        </p>
      </section>

      <section className="space-y-6" aria-labelledby="open">
        <h2 id="open" className={LABEL}>Open — provisional ({open.length})</h2>
        <div className="space-y-6 max-w-3xl">
          {open.map((c) => (
            <ProvisionalChange key={c.id} change={c} />
          ))}
        </div>
      </section>

      <section className="space-y-8" aria-labelledby="convention">
        <h2 id="convention" className={LABEL}>The convention</h2>
        <ol className="space-y-0">
          {provisionalRules.map((r) => (
            <li key={r.n} className="grid grid-cols-[40px_1fr] sm:grid-cols-[40px_320px_1fr] gap-5 py-4" style={{ borderTop: ROW }}>
              <p className={`${SMALL} text-xco-ink-muted pt-1`}>{r.n}</p>
              <p className={`${MONO} text-xco-ink`}>{r.rule}</p>
              <p className={`${SMALL} text-xco-ink-muted col-span-2 sm:col-span-1`}>{r.detail}</p>
            </li>
          ))}
        </ol>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {changeStatuses.map((s) => (
            <div key={s.id} className="space-y-1 pt-3" style={{ borderTop: `1.5px ${s.provisional ? "dashed" : "solid"} var(--xco-ink)` }}>
              <dt className={`${MONO} text-xco-ink`}>
                {s.label}
                {s.provisional && <span className="text-xco-ink-muted"> · provisional</span>}
              </dt>
              <dd className={`${SMALL} text-xco-ink-muted`}>{s.meaning}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="space-y-6" aria-labelledby="record">
        <h2 id="record" className={LABEL}>Record — adopted, declined, superseded</h2>
        <div className="space-y-6 max-w-3xl">
          {settled.map((c) => (
            <ProvisionalChange key={c.id} change={c} />
          ))}
        </div>
      </section>

      <section className="space-y-8 pb-12" aria-labelledby="exports">
        <div className="space-y-2 max-w-2xl">
          <h2 id="exports" className={LABEL}>For the wiki and the website</h2>
          <p className={BODY}>
            The same convention, in the form each place needs. Wiki pages use
            Markdown. Agents that write wiki outputs follow the instruction.
            The website uses the HTML and CSS pattern.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <CopyButton text={provisionalMarkdown()} label="Copy as Markdown — the convention for the wiki" />
          <CopyButton text={provisionalPrompt()} label="Copy the agent instruction — for wiki outputs" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <Code label="Markdown — one record, as a wiki block" code={changeMarkdown(open[0] ?? changeLog[0])} />
          <Code label="HTML — website pattern" code={provisionalHTML} />
          <Code label="CSS — website pattern, from the shipped tokens" code={provisionalCSS()} />
        </div>
      </section>
    </div>
  );
}
