"use client";

// The live demo of the x as operator: a mock xCO website page with one
// XOperator running all four roles. Rules and explanation: /logo/x.

import Link from "next/link";
import { useRef, useState, type RefObject } from "react";
import { logoGeometry as g, inkBounds, cPath, oPath, xPaths } from "@/lib/logo";
import { INK_W, INK_H } from "@/lib/x-operator";
import { XOperator, useReducedMotion } from "@/components/xco/XOperator";

const MONO = "font-mono text-[13px] leading-[1.5] tracking-wide";
const BODY = "text-[21px] leading-[1.4] text-xco-ink max-w-2xl";
const RULE = { borderTop: "1px solid var(--border-default)" };

const PROPOSITIONS = [
  { n: "P1", status: "testing", text: "Optionality can be measured as the number of viable pathways a place keeps open, not the value of any single one." },
  { n: "P2", status: "tested in two pilots", text: "Long-horizon capital behaves differently when the governance around it can be revised." },
  { n: "P3", status: "unresolved", text: "Institutions can hold an option without committing to exercise it, and without being blamed for not doing so." },
];
const NODES = ["Capital", "Institutions", "Governance", "Risk"];
const NOTES = [
  { v: "v0.2", t: "Reversibility as a design property of contracts" },
  { v: "v0.1", t: "Why optionality is not resilience" },
  { v: "v0.1", t: "Reading a city as a portfolio of futures" },
];
const ROLES = [
  { how: "Scroll", name: "Keeper", op: "index" },
  { how: "Point at or tap a tag or the figure", name: "Framer", op: "isolate" },
  { how: "Point at or tap Optionality", name: "Multiply", op: "scale" },
  { how: "Let it walk", name: "Crawler", op: "connect" },
];

function XCOLogo({ logoRef }: { logoRef: RefObject<SVGSVGElement> }) {
  const H = 40;
  // The full mark, so it reads xCO before scripts run. XOperator hides the
  // data-logo-x strokes once its own x is docked exactly over them.
  return (
    <svg ref={logoRef} viewBox={`${inkBounds.left} ${inkBounds.top} ${INK_W} ${INK_H}`} height={H} width={(INK_W / INK_H) * H} role="img" aria-label="xCO">
      <g fill="none" strokeWidth={g.stroke} strokeLinecap="butt">
        {xPaths().map((d) => <path key={d} d={d} data-logo-x="" style={{ stroke: "var(--xco-dusk)" }} />)}
        <path d={cPath()} style={{ stroke: "var(--xco-ink)" }} />
        <path d={oPath()} style={{ stroke: "var(--xco-ink)" }} />
      </g>
    </svg>
  );
}

function Site({ logoRef }: { logoRef: RefObject<SVGSVGElement> }) {
  return (
    <>
      <header className="sticky top-0 z-30" style={{ background: "var(--xco-paper)", borderBottom: "1px solid var(--border-default)" }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-8">
          <a href="#main" aria-label="xCO, top of page"><XCOLogo logoRef={logoRef} /></a>
          <nav aria-label="Demo site" className="hidden gap-6 sm:flex">
            {["Field", "Propositions", "Capital", "Notes", "People"].map((l) => (
              <a key={l} href="#main" className="text-[15px] text-xco-ink-muted hover:text-xco-ink">{l}</a>
            ))}
          </nav>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="mx-auto max-w-5xl px-4 pb-56 sm:px-8 sm:pl-24">
        <section className="grid items-center gap-10 py-16 sm:grid-cols-[1fr_280px] sm:py-24">
          <div className="space-y-6">
            <p className={`${MONO} uppercase text-xco-ink-muted`}>Working papers · v0.2</p>
            <h1 data-keep className="doc-display text-xco-ink">
              Expanding Civilizational{" "}
              <span data-expand data-frame className="underline decoration-1 underline-offset-[6px]">
                Optionality
              </span>
            </h1>
            <p data-keep className={BODY}>
              A field of work on how societies keep more futures open: through capital
              structures, institutional pathways and governance that can change course.
            </p>
          </div>
          {/* On a phone the figure comes first, so Multiply plays above the fold, not under the bar. */}
          <figure data-expand-stage className="relative order-first aspect-square w-full max-w-[240px] sm:order-none sm:max-w-[280px]" style={{ background: "var(--xco-paper-quiet)" }}>
            <figcaption className={`${MONO} absolute bottom-3 left-3 right-3 text-xco-ink-muted`}>
              fig. 0 — reserved for the operator
            </figcaption>
          </figure>
        </section>

        <section className="space-y-10 py-14" style={RULE}>
          <h2 data-keep className="doc-h2 text-xco-ink">What we are testing</h2>
          <ol className="space-y-10">
            {PROPOSITIONS.map((p) => (
              <li key={p.n} className="grid gap-2 sm:grid-cols-[48px_1fr]">
                <span className={`${MONO} text-xco-ink-muted`}>{p.n}</span>
                <div className="space-y-3">
                  <p data-keep className={BODY}>{p.text}</p>
                  <span data-frame className={`${MONO} inline-block uppercase`} style={{ color: "var(--xco-dusk-ink)" }}>
                    [{p.status}]
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="py-14" style={RULE}>
          <figure data-frame data-keep className="space-y-4 p-6" style={{ border: "1px solid var(--border-default)" }}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {NODES.map((n) => (
                <div key={n} className={`${MONO} py-6 text-center uppercase text-xco-ink`} style={{ border: "1.5px solid var(--xco-ink)" }}>{n}</div>
              ))}
            </div>
            <figcaption className={`${MONO} text-xco-ink-muted`}>
              fig. 1 — Where options are held. Draft: the relations between these are what we are testing.
            </figcaption>
          </figure>
        </section>

        <section className="space-y-6 py-14" style={RULE}>
          <h2 data-keep className="doc-h2 text-xco-ink">What we no longer claim</h2>
          <p data-keep className={BODY}>
            <s>Optionality can be priced like any other asset.</s> Withdrawn in{" "}
            <span data-frame style={{ color: "var(--xco-dusk-ink)" }}>v0.2</span>: the pilots
            showed its value depends on who holds the right to change course.
          </p>
        </section>

        <section className="space-y-6 py-14" style={RULE}>
          <h2 data-keep className="doc-h2 text-xco-ink">Notes</h2>
          <ul className="space-y-5">
            {NOTES.map((n) => (
              <li key={n.t} data-keep className="flex items-baseline gap-4">
                <span data-frame className={`${MONO} shrink-0`} style={{ color: "var(--xco-dusk-ink)" }}>{n.v}</span>
                <span className="text-[21px] leading-[1.4] text-xco-ink">{n.t}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-6 py-14" style={RULE}>
          <h2 data-keep className="doc-h2 text-xco-ink">Who is behind it</h2>
          <p data-keep className={BODY}>
            xCO is a field of work convened by Dark Matter Labs, written by a small group and
            reviewed in public. Each paper names its authors and its open questions.
          </p>
        </section>
      </main>
    </>
  );
}

export function XDemo() {
  const [walking, setWalking] = useState(false);
  const reduce = useReducedMotion();
  const logoRef = useRef<SVGSVGElement>(null);

  return (
    <>
      <Site logoRef={logoRef} />
      <XOperator logoRef={logoRef} crawlerInvited={walking && !reduce} />

      <aside aria-label="Demo controls" className="fixed inset-x-0 bottom-0 z-50" style={{ background: "var(--xco-paper-raised)", borderTop: "1px solid var(--border-default)" }}>
        <div className="mx-auto max-w-5xl space-y-2 px-4 py-2 sm:px-8 sm:py-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/logo/x" className={`${MONO} uppercase text-xco-ink-muted underline-offset-2 hover:underline`}>
              ← The x as operator
            </Link>
            <button
              type="button"
              aria-pressed={walking}
              disabled={reduce}
              onClick={() => setWalking((w) => !w)}
              className={`${MONO} min-h-[40px] px-3 disabled:opacity-60`}
              style={{
                border: `1px solid ${walking ? "var(--xco-ink)" : "var(--border-default)"}`,
                background: walking ? "var(--xco-ink)" : "transparent",
                color: walking ? "var(--xco-paper)" : "var(--xco-ink)",
              }}
            >
              Let it walk
            </button>
          </div>
          <p className={`${MONO} text-xco-ink sm:hidden`}>
            Scroll, tap a tag or Optionality, or let it walk.
          </p>
          <p className={`${MONO} hidden text-xco-ink sm:block`}>
            {ROLES.map((r, i) => (
              <span key={r.name}>
                {i > 0 && " · "}
                {r.how} — {r.name} <span className="text-xco-ink-muted">({r.op})</span>
              </span>
            ))}
          </p>
          {reduce && (
            <p className={`${MONO} text-[12px] text-xco-ink-muted`}>
              Reduced motion is on: the x appears in place and does not walk.
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
