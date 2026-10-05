import Link from "next/link";
import { WIP } from "@/components/WIP";
import {
  atlasIntro,
  atlasRoutes,
  atlasCrossing,
  atlasLineContract,
  atlasConnections,
  atlasScopedNames,
  atlasRules,
  atlasClose,
} from "@/lib/polyphonic";
import { colors, routeColors } from "@/lib/design-tokens";
import { LABEL, BODY, MONO, SMALL, DISPLAY, ROW, RULE } from "../styles";
import { AtlasFigure } from "./AtlasFigure";

// v8.1 §06C — the situated atlas. The figure is optional depth; the ordered
// ledgers below carry every step, so the narrow page loses nothing.

const routeHex = (id: "a" | "b") => routeColors.find((r) => r.id === id)!.hex;

export default function AtlasPage() {
  return (
    <div className="doc-wrap py-12 space-y-24">
      <header className="space-y-4 pb-6">
        <Link href="/grammar" className={`${MONO} text-xco-ink-muted hover:text-xco-dusk-ink transition-colors`}>
          ← Grammar
        </Link>
        <div className="flex items-baseline justify-between">
          <h1 className="doc-display text-xco-ink">Situated atlas</h1>
          <WIP variant="version" />
        </div>
      </header>

      <section className="max-w-2xl space-y-4">
        <p className={DISPLAY}>{atlasIntro.title}</p>
        <p className={`${MONO} text-xco-ink`}>{atlasIntro.line}</p>
        <p className={BODY}>
          The Service Score shows distributed responsibilities. The atlas follows
          an account across the places, waits, thresholds and relationships
          through which a capability becomes usable.
        </p>
        <p className={BODY}>{atlasIntro.body}</p>
      </section>

      <section className="space-y-6" aria-labelledby="at-h1">
        <div className="space-y-2">
          <h2 id="at-h1" className={LABEL}>AT-H1 / hypothetical cooling pathways</h2>
          <p className={`${SMALL} text-xco-ink-muted max-w-2xl`}>
            [schematic] {atlasIntro.scale} H0 remains the source record; these trajectories are an added hypothetical reading.
          </p>
        </div>
        <AtlasFigure />
        <p className={`${MONO} text-xco-ink max-w-3xl`}>[line contract] {atlasLineContract}</p>
      </section>

      {/* Ordered ledgers */}
      <section className="space-y-8" aria-labelledby="ledgers">
        <h2 id="ledgers" className={LABEL}>Both routes, in sequence</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {atlasRoutes.map((r) => (
            <div key={r.id} className="space-y-4">
              <div className="pt-3" style={{ borderTop: `3px solid ${routeHex(r.route)}` }}>
                <p className={`${SMALL} text-xco-ink-muted uppercase tracking-widest`}>
                  {r.id} / {r.account}
                </p>
                <p className={DISPLAY}>
                  {r.title[0]}
                  <br />
                  {r.title[1]}
                </p>
              </div>
              <ol className="space-y-0">
                {r.steps.map((s) => (
                  <li key={s.id} className="py-3 space-y-1" style={{ borderTop: ROW }}>
                    <p className={`${MONO} text-xco-ink`}>
                      {s.id} / {s.name}
                      {s.unresolved && <span className="text-xco-ink-muted"> · unresolved prerequisite</span>}
                      {s.wait && <span className="text-xco-ink-muted"> · unmeasured wait</span>}
                    </p>
                    <p className={`${SMALL} text-xco-ink`}>{s.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
        <p className={`${MONO} text-xco-ink max-w-3xl`}>{atlasCrossing}</p>
      </section>

      {/* Connections */}
      <section className="space-y-6" aria-labelledby="connections">
        <div className="space-y-2 max-w-2xl">
          <h2 id="connections" className={LABEL}>AT ↔ IF ↔ SS / one case, different questions</h2>
          <p className={BODY}>
            The atlas makes an encounter inspectable; the Inquiry Field names the
            conditions under examination; the Service Score locates the work that
            maintains them. Link them explicitly — the drawing can reveal where
            the model needs another question.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className={`${SMALL} text-xco-ink-muted uppercase tracking-widest`}>
                <th className="py-2 pr-4 font-medium">Atlas object</th>
                <th className="py-2 pr-4 font-medium">Existing object</th>
                <th className="py-2 font-medium">Declared relation</th>
              </tr>
            </thead>
            <tbody>
              {atlasConnections.map((c) => (
                <tr key={c.atlas} className={`${SMALL} text-xco-ink align-top`} style={{ borderTop: ROW }}>
                  <td className="py-3 pr-4 whitespace-nowrap">{c.atlas}</td>
                  <td className="py-3 pr-4">{c.existing}</td>
                  <td className="py-3">{c.relation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={`${MONO} text-xco-ink max-w-3xl`}>[addresses] {atlasScopedNames}</p>
      </section>

      {/* Rules */}
      <section className="space-y-8" aria-labelledby="atlas-rules">
        <h2 id="atlas-rules" className={LABEL}>Drawing an atlas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {atlasRules.map((r) => (
            <div key={r.name} className="space-y-2 pt-3" style={{ borderTop: RULE }}>
              <p className={`${MONO} text-xco-ink`}>{r.name}</p>
              <p className={`${BODY} font-display`}>{r.line}</p>
              <p className={`${SMALL} text-xco-ink-muted`}>{r.body}</p>
            </div>
          ))}
        </div>
        <p className={`${DISPLAY} max-w-2xl pt-6`}>
          {atlasClose.map((l) => (
            <span key={l} className="block">{l}</span>
          ))}
        </p>
        <p className={`${SMALL} text-xco-ink-muted`}>
          An atlas holds the conditions through which a capability becomes lived.
          Route A is {routeHex("a")} and route B {routeHex("b")}, on {colors.paper.hex}; they confer no rank.
        </p>
      </section>
    </div>
  );
}
