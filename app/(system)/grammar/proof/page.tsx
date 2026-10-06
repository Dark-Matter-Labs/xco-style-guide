import Link from "next/link";
import { WIP } from "@/components/WIP";
import { ProvisionalChange } from "@/components/xco";
import { changeLog } from "@/lib/provisional";
import {
  proofIntro,
  proofSpecimen,
  proofBands,
  proofMinimumRecord,
  proofNeighbours,
  proofClose,
  type ProofLine,
  type HighlightRole,
} from "@/lib/polyphonic";
import { highlightTokens, identityScales } from "@/lib/design-tokens";
import { LABEL, BODY, MONO, SMALL, DISPLAY, ROW, RULE } from "../styles";

// v8.1 §05D — the proof block and its marginal inquiry. The spine is a ruled
// sequence of bands; each margin question targets a band by ID and links back
// to it, so the relation survives without its position.

const HL_TEXT = identityScales.matter[900];
const hlVar = (role: HighlightRole) => highlightTokens.find((h) => h.id === role)!.cssVar;
const hlLabel = (role: HighlightRole) => highlightTokens.find((h) => h.id === role)!.label;

function Line({ line }: { line: ProofLine }) {
  const { text, mark } = line;
  const at = mark ? text.indexOf(mark.phrase) : -1;
  const body =
    mark && at >= 0 ? (
      <>
        {text.slice(0, at)}
        <mark
          className="px-[0.17em]"
          style={{ backgroundColor: `var(${hlVar(mark.role)})`, color: HL_TEXT }}
          title={hlLabel(mark.role)}
        >
          {mark.phrase}
        </mark>
        {text.slice(at + mark.phrase.length)}
      </>
    ) : (
      text
    );
  return (
    <p className="font-body text-[20px] leading-[30px] text-xco-ink">
      {line.label && <span className={`${MONO} text-xco-ink-muted`}>{line.label} — </span>}
      {body}
    </p>
  );
}

export default function ProofPage() {
  const s = proofSpecimen;
  return (
    <div className="doc-wrap py-12 space-y-24">
      <header className="space-y-4 pb-6">
        <Link href="/grammar" className={`${MONO} text-xco-ink-muted hover:text-xco-dusk-ink transition-colors`}>
          ← Grammar
        </Link>
        <div className="flex items-baseline justify-between">
          <h1 className="doc-display text-xco-ink">Proof block</h1>
          <WIP variant="version" />
        </div>
      </header>

      <section className="max-w-2xl space-y-4">
        <p className={DISPLAY}>{proofIntro.title}</p>
        <p className={`${MONO} text-xco-ink`}>{proofIntro.line}</p>
        <p className={BODY}>
          A working form between the Reasoning Lineage and the Decision Surface:
          an adopted premise, a construction, its dependencies, the threshold for
          realisation and the optionality it changes. &ldquo;Proof-carrying&rdquo;
          names an inspectable record of those elements — the label does not
          establish that any claim is proven.
        </p>
        <p className={BODY}>{proofIntro.body}</p>
      </section>

      {/* PB-1 specimen */}
      <section className="space-y-6" aria-labelledby="pb1">
        <h2 id="pb1" className={LABEL}>{s.id} / design specimen</h2>
        <article className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(14rem,1fr)] gap-10 py-8" style={{ borderTop: RULE, borderBottom: RULE }}>
          <div className="space-y-6 min-w-0">
            <div className="space-y-1">
              {s.meta.map((m) => (
                <p key={m} className={`${SMALL} text-xco-ink-muted`}>{m}</p>
              ))}
            </div>
            <div className="space-y-2">
              <h3 className={DISPLAY}>{s.title}</h3>
              <p className={`${BODY} italic font-display`}>{s.subtitle}</p>
            </div>
            {s.bands.map((b) => (
              <section key={b.id} id={b.id} className="space-y-3 pt-4 scroll-mt-24" style={{ borderTop: ROW }}>
                <p className={`${MONO} text-xco-ink`}>
                  [{b.band}] <span className="text-xco-ink-muted">{b.id}</span>
                  {b.state && <span className="text-xco-ink-muted"> · {b.state}</span>}
                </p>
                {b.lines.map((l, i) => (
                  <Line key={i} line={l} />
                ))}
                {b.note && <p className={`${SMALL} text-xco-ink-muted max-w-2xl`}>{b.note}</p>}
              </section>
            ))}
          </div>
          <aside aria-label="Marginal questions on PB-1" className="space-y-5 lg:pt-24">
            <p className={`${SMALL} text-xco-ink-muted uppercase tracking-widest`}>Marginal inquiry</p>
            {s.margin.map((q, i) => (
              <div key={i} className="space-y-1 pt-3" style={{ borderTop: ROW }}>
                <p className="font-display italic text-[18px] leading-[26px] text-xco-ink">{q.text}</p>
                <a href={`#${q.target}`} className={`${SMALL} text-xco-ink-muted underline underline-offset-2 hover:text-xco-dusk-ink`}>
                  → {q.target}
                </a>
              </div>
            ))}
          </aside>
        </article>
        <p className={`${SMALL} text-xco-ink-muted max-w-3xl`}>[status] {s.status}</p>
        <div className="max-w-3xl">
          <ProvisionalChange change={changeLog.find((c) => c.id === "CH-05")!} compact />
        </div>
        <ul className="flex flex-wrap gap-3" aria-label="Local highlight key for PB-1">
          {highlightTokens.map((h) => (
            <li key={h.id} className={SMALL}>
              <mark className="px-1" style={{ backgroundColor: `var(${h.cssVar})`, color: HL_TEXT }}>{h.label}</mark>
            </li>
          ))}
        </ul>
      </section>

      {/* Degree */}
      <section className="max-w-2xl space-y-3">
        <h2 className={LABEL}>State discipline</h2>
        <p className={BODY}>{proofIntro.degree}</p>
      </section>

      {/* Bands */}
      <section className="space-y-6" aria-labelledby="bands">
        <h2 id="bands" className={LABEL}>Argument bands and their permitted function</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className={`${SMALL} text-xco-ink-muted uppercase tracking-widest`}>
                <th className="py-2 pr-4 font-medium">Band</th>
                <th className="py-2 pr-4 font-medium">It can</th>
                <th className="py-2 pr-4 font-medium">It must expose</th>
                <th className="py-2 font-medium">It cannot confer</th>
              </tr>
            </thead>
            <tbody>
              {proofBands.map((b) => (
                <tr key={b.band} className={`${SMALL} text-xco-ink align-top`} style={{ borderTop: ROW }}>
                  <td className="py-3 pr-4">{b.band}</td>
                  <td className="py-3 pr-4">{b.can}</td>
                  <td className="py-3 pr-4">{b.expose}</td>
                  <td className="py-3">{b.cannot}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="max-w-3xl space-y-4">
        <h2 className={LABEL}>PB / minimum block record</h2>
        <p className={BODY}>{proofMinimumRecord}</p>
        <p className={`${MONO} text-xco-ink`}>[neighbours] {proofNeighbours}</p>
        <p className={`${DISPLAY} pt-6`}>
          {proofClose.map((l) => (
            <span key={l} className="block">{l}</span>
          ))}
        </p>
        <p className={`${SMALL} text-xco-ink-muted`}>A proof block carries the cost of its own construction.</p>
      </section>
    </div>
  );
}
