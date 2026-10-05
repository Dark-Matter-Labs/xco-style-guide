import { identityScales, identityScaleMeta, traceColors, highlightTokens, routeColors } from "@/lib/design-tokens";
import { contrastRatio, formatRatio } from "@/lib/a11y/contrast";
import { PAPER_HEX, swatchLabel } from "./swatch";

// The v8.1 identity on the colour page: the three scales every system colour
// is drawn from, the default proportion, TRACE, the highlight roles and the
// route identities. Each keeps its own labelled key — 8.1 is explicit that
// route colours, highlight roles and domains are separate mappings.

const LABEL = "font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase";
const BODY = "font-body text-[24px] text-xco-ink leading-[26px]";
const MONO = "font-mono font-medium text-[0.9375rem] leading-[1.6]";
const SMALL = "font-mono font-medium text-[0.75rem] leading-[1.4]";

const HIGHLIGHT_TEXT = identityScales.matter[900];

type ScaleKey = keyof typeof identityScales;

export function IdentityScales() {
  return (
    <section aria-labelledby="identity-scales">
      <h2 id="identity-scales" className={`${LABEL} mb-4`}>Identity scales — Field + Signal + Matter</h2>
      <p className={`${BODY} mb-8 max-w-2xl`}>
        Prussian and atmospheric blue hold the wider field. Chalk and mineral
        matter carry legibility. Ember orange gives a locally declared hinge,
        transition or possibility its presence. Every colour on this page is
        one of these stops.
      </p>
      <div className="space-y-10">
        {(Object.keys(identityScales) as ScaleKey[]).map((key) => (
          <div key={key}>
            <p className={`${MONO} text-xco-ink uppercase tracking-widest`}>{identityScaleMeta[key].name}</p>
            <p className={`${SMALL} text-xco-ink-muted mb-3`}>{identityScaleMeta[key].gloss}</p>
            <ol className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-11 gap-1">
              {Object.entries(identityScales[key]).map(([stop, hex]) => (
                <li
                  key={stop}
                  className="h-20 flex flex-col justify-end p-2"
                  style={{ backgroundColor: hex, border: "1px solid var(--border-subtle)" }}
                >
                  <span className={SMALL} style={swatchLabel(hex)}>{stop}</span>
                  <span className={SMALL} style={swatchLabel(hex)}>{hex}</span>
                </li>
              ))}
            </ol>
            <p className={`${SMALL} text-xco-ink-muted pt-2`}>--xco-{key}-50 … --xco-{key}-950</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const PROPORTION = [
  { share: 70, role: "Canvas", source: "Field or light Matter", hex: identityScales.matter[50] },
  { share: 20, role: "Structure", source: "Matter", hex: identityScales.matter[800] },
  { share: 8, role: "Trace", source: "Analytic domain", hex: traceColors[0].hex },
  { share: 2, role: "Signal", source: "Current event", hex: identityScales.signal[500] },
] as const;

export function Proportion() {
  return (
    <section className="max-w-3xl" aria-labelledby="proportion">
      <h2 id="proportion" className={`${LABEL} mb-4`}>One field. One signal.</h2>
      <p className={`${BODY} mb-8`}>
        A restrained field gives a concentrated signal its force. The default
        composition is 70 : 20 : 8 : 2 — area roles, not colour families, and a
        design default rather than a rule for every encounter.
      </p>
      <div className="flex h-16" style={{ border: "1px solid var(--border-default)" }} role="img" aria-label="Proportion strip: 70% canvas, 20% structure, 8% trace, 2% signal">
        {PROPORTION.map((p) => (
          <div key={p.role} style={{ width: `${p.share}%`, backgroundColor: p.hex }} />
        ))}
      </div>
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
        {PROPORTION.map((p) => (
          <div key={p.role}>
            <dt className={`${MONO} text-xco-ink`}>{p.share} / {p.role}</dt>
            <dd className={`${SMALL} text-xco-ink-muted`}>{p.source}</dd>
          </div>
        ))}
      </dl>
      <p className={`${MONO} text-xco-ink pt-6`}>
        [rule] Signal 500 is a surface; Field 950 is its readable ink. On pale
        pages, small warm text uses Signal 700 (dusk-ink). Encounter
        compositions may use greater amplitude; ruled argument and operative
        decisions keep quiet grounds.
      </p>
    </section>
  );
}

export function Trace() {
  return (
    <section aria-labelledby="trace">
      <h2 id="trace" className={`${LABEL} mb-4`}>TRACE — names domain, not truth</h2>
      <p className={`${BODY} mb-8 max-w-2xl`}>
        Five subdued families distinguish analytic domains. Evidence status
        stays in line, label, source and relation type — never in the hue.
      </p>
      <ul className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {traceColors.map((t) => (
          <li key={t.name}>
            <div className="h-16 flex flex-col justify-end p-2" style={{ backgroundColor: t.hex }}>
              <span className={SMALL} style={swatchLabel(t.hex)}>{t.hex}</span>
            </div>
            <p className={`${MONO} text-xco-ink pt-2`}>{t.name}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Highlights() {
  return (
    <section className="max-w-3xl" aria-labelledby="highlights">
      <h2 id="highlights" className={`${LABEL} mb-4`}>Highlight roles</h2>
      <p className={`${BODY} mb-8`}>
        A short rectangular fill behind exact language makes a phrase
        addressable. Highlight the whole operand, always behind Matter 900
        text, and name the role in a key — the mapping is local to the
        composition, and a fill never stands in for the source.
      </p>
      <ul className="space-y-3">
        {highlightTokens.map((h) => (
          <li key={h.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className={BODY}>
              <mark className="px-1" style={{ backgroundColor: h.hex, color: HIGHLIGHT_TEXT }}>{h.label}</mark>
            </span>
            <span className={`${SMALL} text-xco-ink-muted`}>
              {h.cssVar} · {h.hex} · {formatRatio(contrastRatio(HIGHLIGHT_TEXT, h.hex))} with Matter 900
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Routes() {
  return (
    <section className="max-w-3xl" aria-labelledby="routes">
      <h2 id="routes" className={`${LABEL} mb-4`}>Route identities</h2>
      <p className={`${BODY} mb-6`}>
        Two constructed routes keep their identity through every crossing in an
        atlas. The colours distinguish; they confer no rank. Route B is also
        dashed and each is named in the key, so colour is never the only carrier.
      </p>
      {/* Routes are specified on paper, so the figure keeps a paper ground in both registers. */}
      <svg viewBox="0 0 600 120" className="w-full h-auto" style={{ backgroundColor: PAPER_HEX }} role="img" aria-label="Route A in Field 600 and Route B in Signal 700, crossing twice">
        <path d="M10 90 C 150 90, 200 20, 300 30 S 470 100, 590 40" fill="none" stroke={routeColors[0].hex} strokeWidth="2" />
        <path d="M10 30 C 140 30, 220 110, 320 90 S 460 20, 590 90" fill="none" stroke={routeColors[1].hex} strokeWidth="2" strokeDasharray="6 4" />
      </svg>
      <ul className="flex flex-wrap gap-6 pt-2">
        {routeColors.map((r) => (
          <li key={r.id} className={`${MONO} text-xco-ink`}>
            <span aria-hidden className="px-1" style={{ color: r.hex, backgroundColor: PAPER_HEX }}>{r.id === "a" ? "——" : "- - -"}</span>{" "}
            Route {r.id.toUpperCase()} · {r.cssVar} · {r.hex}
          </li>
        ))}
      </ul>
    </section>
  );
}
