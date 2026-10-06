import { CopyButton } from "@/components/CopyButton";
import { LicenceBadge, ProvisionalChange } from "@/components/xco";
import { changeLog } from "@/lib/provisional";
import { steModes, steStructuralRules, steLexicalRules, steSource, steMarkdown, stePrompt } from "@/lib/ste";

// The plain register — Simplified Technical English, applied by licence.
// It sits after the writing practices: the voice says who we are, the
// practices what we do before a text goes out, and this how plain a text
// must be, given what a reader will do with it.

const LABEL = "font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase";
const BODY = "font-body text-[24px] text-xco-ink leading-[26px]";
const MONO = "font-mono font-medium text-[0.9375rem] leading-[1.6]";
const SMALL = "font-mono font-medium text-[0.75rem] leading-[1.5]";
const ROW = "1px solid var(--border-subtle)";

export function PlainRegister() {
  return (
    <section id="plain-register" className="space-y-10 scroll-mt-24" style={{ borderTop: "1.5px solid var(--xco-ink)" }} aria-labelledby="plain-register-title">
      <div className="max-w-2xl space-y-4 pt-6">
        <h2 id="plain-register-title" className={LABEL}>The plain register — when a misreading has a cost</h2>
        <p className={BODY}>
          Some text is acted on, not encountered: a decision, an instruction, a
          prompt an agent follows. There, a second reading is a failure. We use
          Simplified Technical English (STE) — a controlled language from
          aerospace maintenance — and we apply it by licence, so the voice keeps
          its range where range is the point.
        </p>
        <p className={`${SMALL} text-xco-ink-muted`}>{steSource}</p>
        <ProvisionalChange change={changeLog.find((c) => c.id === "CH-07")!} compact />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steModes.map((m) => (
          <div key={m.mode} className="space-y-3 pt-3" style={{ borderTop: "1px solid var(--border-default)" }}>
            <div className="flex items-center gap-3">
              <LicenceBadge licence={m.licence} />
              <span className={`${MONO} text-xco-ink`}>→ {m.label}</span>
            </div>
            <p className={`${SMALL} text-xco-ink`}>{m.applies}</p>
            <p className={`${SMALL} text-xco-ink-muted`}>{m.rule}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className={`${SMALL} text-xco-ink-muted uppercase tracking-widest`}>Structural rules — checked by the linter below</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className={`${SMALL} text-xco-ink-muted uppercase tracking-widest`}>
                <th className="py-2 pr-4 font-medium">Rule</th>
                <th className="py-2 pr-4 font-medium">Do</th>
                <th className="py-2 font-medium">Don&apos;t</th>
              </tr>
            </thead>
            <tbody>
              {steStructuralRules.map((r) => (
                <tr key={r.id} className={`${SMALL} text-xco-ink align-top`} style={{ borderTop: ROW }}>
                  <td className="py-3 pr-4">{r.name}</td>
                  <td className="py-3 pr-4">{r.do}</td>
                  <td className="py-3">{r.dont}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steLexicalRules.map((r) => (
          <div key={r.name} className="space-y-1">
            <p className={`${MONO} text-xco-ink`}>{r.name} <span className="text-xco-ink-muted">· advisory</span></p>
            <p className={`${SMALL} text-xco-ink-muted`}>{r.detail}</p>
          </div>
        ))}
      </div>

      <p className={`${MONO} text-xco-ink max-w-3xl`}>
        [shared rule] Keep modality. STE and the xCO voice agree here: a hedge
        carries the writer&apos;s confidence, and confidence is content. A plain
        rewrite never turns &ldquo;may have failed&rdquo; into &ldquo;failed&rdquo;.
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <CopyButton text={steMarkdown()} label="Copy as Markdown — for the wiki and website" />
        <CopyButton text={stePrompt()} label="Copy the agent instruction — for wiki outputs" />
      </div>
    </section>
  );
}
