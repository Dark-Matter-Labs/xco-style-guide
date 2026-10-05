import Link from "next/link";
import { WIP } from "@/components/WIP";
import { LicenceBadge } from "@/components/xco";
import {
  pageGrammarIntro,
  pageLayers,
  pageSpecimen,
  annotationContract,
  annotationRecord,
  pageStartingValues,
  pageByLicence,
  highlightKeyRule,
} from "@/lib/polyphonic";
import { highlightTokens, identityScales } from "@/lib/design-tokens";
import { LABEL, BODY, MONO, SMALL, DISPLAY, ROW, RULE } from "../styles";

// v8.1 §04D — the page as visual grammar, and the questioning margin (AN).
// The specimen is composed in the DOM as one complete sentence; its line
// breaks and highlight are the optional spatial treatment on top.

const HL_TEXT = identityScales.matter[900];

export default function PageGrammarPage() {
  return (
    <div className="doc-wrap py-12 space-y-24">
      <header className="space-y-4 pb-6">
        <Link href="/grammar" className={`${MONO} text-xco-ink-muted hover:text-xco-dusk-ink transition-colors`}>
          ← Grammar
        </Link>
        <div className="flex items-baseline justify-between">
          <h1 className="doc-display text-xco-ink">Page &amp; margin</h1>
          <WIP variant="version" />
        </div>
      </header>

      <section className="max-w-2xl space-y-4">
        <p className={DISPLAY}>{pageGrammarIntro.title}</p>
        <p className={`${MONO} text-xco-ink`}>{pageGrammarIntro.line}</p>
        <p className={BODY}>{pageGrammarIntro.body}</p>
        <p className={BODY}>{pageGrammarIntro.operations}</p>
        <p className={`${MONO} text-xco-ink`}>[edge] {pageGrammarIntro.edge}</p>
      </section>

      {/* P7 specimen */}
      <section className="space-y-6" aria-labelledby="specimen">
        <h2 id="specimen" className={LABEL}>{pageSpecimen.id} / authored encounter — field → spine → margin → return</h2>
        <figure className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 py-10" style={{ borderTop: RULE, borderBottom: RULE }}>
          <p className="font-display text-[44px] leading-[48px] sm:text-[64px] sm:leading-[66px] text-xco-ink">
            {pageSpecimen.lines.map((line, i) => (
              <span key={i} className="block">
                {i === pageSpecimen.marked ? (
                  <mark className="px-1" style={{ backgroundColor: "var(--xco-hl-capability)", color: HL_TEXT }}>
                    &lt;{line}&gt;
                  </mark>
                ) : i === pageSpecimen.terminal ? (
                  <em>{line}</em>
                ) : (
                  line
                )}
              </span>
            ))}
          </p>
          <figcaption className="space-y-3 lg:pt-3">
            <p className={`${SMALL} text-xco-ink-muted uppercase tracking-widest`}>Local reading</p>
            <p className="font-display italic text-[19px] leading-[28px] text-xco-ink">{pageSpecimen.reading}</p>
          </figcaption>
        </figure>
      </section>

      {/* The six layers */}
      <section className="space-y-8" aria-labelledby="layers">
        <div className="space-y-2">
          <h2 id="layers" className={LABEL}>Six layers</h2>
          <p className={`${BODY} max-w-2xl`}>
            Each layer has one job. Character comes from their contrast, not from a motif.
          </p>
        </div>
        <ol className="space-y-0">
          {pageLayers.map((l, i) => (
            <li key={l.id} className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-x-10 gap-y-2 py-5" style={{ borderTop: ROW }}>
              <p className={`${MONO} text-xco-ink-muted`}>{String(i + 1).padStart(2, "0")} / {l.id}</p>
              <div className="space-y-2 max-w-2xl">
                <p className={`${BODY} font-display`}>{l.line}</p>
                <p className={`${SMALL} text-xco-ink`}>{l.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Questioning margin */}
      <section className="space-y-8" aria-labelledby="margin">
        <div className="space-y-2 max-w-2xl">
          <h2 id="margin" className={LABEL}>AN / the questioning margin</h2>
          <p className={DISPLAY}>A margin should be able to change the next reading.</p>
          <p className={BODY}>
            The margin is a second speaking position. It can test a premise,
            expose someone missing from the account, ask what a condition costs,
            or propose another construction. Give it an exact target and keep its
            voice distinct from the spine.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {annotationContract.map((a) => (
            <div key={a.part} className="space-y-2 pt-3" style={{ borderTop: "1.5px solid var(--xco-ink)" }}>
              <p className={`${MONO} text-xco-ink`}>{a.part}</p>
              <p className={`${BODY} font-display`}>{a.line}</p>
              <p className={`${SMALL} text-xco-ink-muted`}>{a.body}</p>
            </div>
          ))}
        </div>
        <p className={`${MONO} text-xco-ink max-w-3xl`}>[record] {annotationRecord}</p>
      </section>

      {/* Starting values */}
      <section className="space-y-6" aria-labelledby="values">
        <h2 id="values" className={LABEL}>Typography and composition — starting values</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className={`${SMALL} text-xco-ink-muted uppercase tracking-widest`}>
                <th className="py-2 pr-4 font-medium">Layer</th>
                <th className="py-2 pr-4 font-medium">Starting treatment</th>
                <th className="py-2 pr-4 font-medium">Purpose</th>
                <th className="py-2 font-medium">Constraint</th>
              </tr>
            </thead>
            <tbody>
              {pageStartingValues.map((v) => (
                <tr key={v.layer} className={`${SMALL} text-xco-ink align-top`} style={{ borderTop: ROW }}>
                  <td className="py-3 pr-4">{v.layer}</td>
                  <td className="py-3 pr-4">{v.treatment}</td>
                  <td className="py-3 pr-4">{v.purpose}</td>
                  <td className="py-3">{v.constraint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Highlight key */}
      <section className="space-y-6 max-w-3xl" aria-labelledby="hl">
        <h2 id="hl" className={LABEL}>HL / a local exact-span key</h2>
        <p className={BODY}>
          A highlight role is declared per specimen. The proof block maps these
          five fills to argument functions; the Evidence Mantle keeps its own span
          key, and the atlas its own route key.
        </p>
        <ul className="flex flex-wrap gap-3">
          {highlightTokens.map((h) => (
            <li key={h.id} className={BODY}>
              <mark className="px-1" style={{ backgroundColor: `var(${h.cssVar})`, color: HL_TEXT }}>{h.label}</mark>
            </li>
          ))}
        </ul>
        <p className={`${MONO} text-xco-ink`}>[rule] {highlightKeyRule}</p>
      </section>

      {/* By licence */}
      <section className="space-y-6" aria-labelledby="by-licence">
        <h2 id="by-licence" className={LABEL}>The page, by licence</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pageByLicence.map((p) => (
            <div key={p.licence} className="space-y-3 pt-3" style={{ borderTop: RULE }}>
              <LicenceBadge licence={p.licence} />
              <p className={`${BODY} font-display`}>{p.line}</p>
            </div>
          ))}
        </div>
        <p className={`${DISPLAY} max-w-2xl pt-6`}>
          The page may be quiet. The thought may be radical. Every relation remains answerable.
        </p>
      </section>
    </div>
  );
}
