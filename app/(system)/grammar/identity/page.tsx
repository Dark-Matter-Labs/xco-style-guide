import Link from "next/link";
import { WIP } from "@/components/WIP";
import { CopyButton } from "@/components/CopyButton";
import {
  identityIntro,
  typeAffordances,
  semanticRegistry,
  implementationRequirements,
  productionIntro,
  productionContract,
  proofFragmentHTML,
  proofFragmentCSS,
  addressConvention,
  portableRecord,
  revisionRule,
} from "@/lib/polyphonic";
import { LABEL, BODY, MONO, SMALL, DISPLAY, ROW, RULE } from "../styles";

// v8.1 §11 and §11B — the local semantic registry and the reusable production
// layer. The CSS shown here is generated from design-tokens.ts, so a copied
// pattern always matches the shipped palette.

const css = proofFragmentCSS();
const json = JSON.stringify(portableRecord, null, 2);

function Code({ label, code }: { label: string; code: string }) {
  return (
    <figure className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <figcaption className={`${SMALL} text-xco-ink-muted uppercase tracking-widest`}>{label}</figcaption>
        <CopyButton text={code} label={`Copy ${label.split(" /")[0]}`} />
      </div>
      <pre
        tabIndex={0}
        aria-label={label}
        className={`${SMALL} text-xco-ink overflow-x-auto p-4 max-h-[28rem]`}
        style={{ border: RULE, background: "var(--panel)" }}
      >
        <code>{code}</code>
      </pre>
    </figure>
  );
}

function Table<T extends Record<string, string>>({ cols, rows, keyOf }: { cols: [keyof T, string][]; rows: readonly T[]; keyOf: (r: T) => string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left">
        <thead>
          <tr className={`${SMALL} text-xco-ink-muted uppercase tracking-widest`}>
            {cols.map(([, h]) => (
              <th key={h} className="py-2 pr-4 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={keyOf(r)} className={`${SMALL} text-xco-ink align-top`} style={{ borderTop: ROW }}>
              {cols.map(([k]) => (
                <td key={String(k)} className="py-3 pr-4">{r[k]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function IdentityPage() {
  return (
    <div className="doc-wrap py-12 space-y-24">
      <header className="space-y-4 pb-6">
        <Link href="/grammar" className={`${MONO} text-xco-ink-muted hover:text-xco-dusk-ink transition-colors`}>
          ← Grammar
        </Link>
        <div className="flex items-baseline justify-between">
          <h1 className="doc-display text-xco-ink">Identity &amp; production</h1>
          <WIP variant="version" />
        </div>
      </header>

      <section className="max-w-2xl space-y-4">
        <p className={DISPLAY}>{identityIntro.title}</p>
        <p className={BODY}>{identityIntro.body}</p>
        <p className={`${MONO} text-xco-ink`}>
          The palette itself — Field, Signal, Matter, TRACE, highlight roles and
          routes — lives on the <Link href="/colour" className="underline underline-offset-2">colour page</Link>.
        </p>
      </section>

      <section className="space-y-8" aria-labelledby="type">
        <h2 id="type" className={LABEL}>Four type affordances — not semantic laws</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {typeAffordances.map((t) => (
            <div key={t.face} className="space-y-2 pt-3" style={{ borderTop: "1.5px solid var(--xco-ink)" }}>
              <p className={`${MONO} text-xco-ink`}>{t.face} / {t.role}</p>
              <p className={`${BODY} font-display`}>{t.question}</p>
              <p className={`${SMALL} text-xco-ink-muted`}>{t.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6" aria-labelledby="registry">
        <div className="space-y-2 max-w-2xl">
          <h2 id="registry" className={LABEL}>The local semantic registry</h2>
          <p className={BODY}>
            Every composition ships with a compact record of what its forms do.
            This keeps motifs from hardening into unsupported universal meanings.
          </p>
        </div>
        <dl className="space-y-0">
          {semanticRegistry.map((r) => (
            <div key={r.name} className="grid grid-cols-1 sm:grid-cols-[260px_1fr] gap-x-8 gap-y-1 py-3" style={{ borderTop: ROW }}>
              <dt className={`${MONO} text-xco-ink`}>
                {r.name}
                {"added" in r && <span className="text-xco-ink-muted"> · {r.added}</span>}
              </dt>
              <dd className={`${SMALL} text-xco-ink`}>{r.holds}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="space-y-6" aria-labelledby="d2">
        <h2 id="d2" className={LABEL}>Implementation practices that preserve the grammar</h2>
        <Table
          cols={[["layer", "Layer"], ["practice", "Required practice"], ["avoid", "Failure to avoid"]]}
          rows={implementationRequirements}
          keyOf={(r) => r.layer}
        />
      </section>

      <section className="space-y-8" aria-labelledby="production">
        <div className="space-y-4 max-w-2xl">
          <h2 id="production" className={LABEL}>11B / reusable patterns</h2>
          <p className={DISPLAY}>{productionIntro.title}</p>
          <p className={`${MONO} text-xco-ink`}>{productionIntro.line}</p>
          <p className={BODY}>{productionIntro.body}</p>
          <p className={`${SMALL} text-xco-ink-muted`}>[native HTML] {productionIntro.native}</p>
          <p className={`${SMALL} text-xco-ink-muted`}>[machine assistance] {productionIntro.machine}</p>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <Code label="HTML / ruled proof fragment, exact target and marginal question" code={proofFragmentHTML} />
          <Code label="CSS / ruled band, exact highlight and narrow transposition" code={css} />
        </div>
        <p className={`${SMALL} text-xco-ink-muted max-w-3xl`}>
          Colours in this CSS come from the shipped tokens — chalk paper, Matter 950 ink, the
          condition highlight behind Matter 900 text, and an ocean focus ring — rather than
          the values printed in the source guide.
        </p>
      </section>

      <section className="space-y-6" aria-labelledby="contract">
        <h2 id="contract" className={LABEL}>Production contract — complete before release</h2>
        <Table
          cols={[["object", "Object"], ["keep", "Keep with the content"], ["verify", "Verification"]]}
          rows={productionContract}
          keyOf={(r) => r.object}
        />
      </section>

      <section className="space-y-6" aria-labelledby="record">
        <div className="space-y-3 max-w-2xl">
          <h2 id="record" className={LABEL}>Portable authored record</h2>
          <p className={DISPLAY}>Share an address, then compose the encounter.</p>
          <p className={BODY}>
            One source, one condition, one route step, one question. A shared
            record keeps source identity, exact words and declared relations
            steady while the page, atlas and argument compose them differently.
          </p>
          <p className={`${MONO} text-xco-ink`}>[addresses] {addressConvention}</p>
        </div>
        <Code label="JSON / exact source, scoped targets and a questioning relation" code={json} />
        <p className={`${MONO} text-xco-ink max-w-3xl`}>[revision] {revisionRule}</p>
      </section>
    </div>
  );
}
