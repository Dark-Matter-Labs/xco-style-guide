import Link from "next/link";
import type { Metadata } from "next";
import { WIP } from "@/components/WIP";
import { ProvisionalChange } from "@/components/xco";
import { changeLog } from "@/lib/provisional";
import { RoleFigure, type FigureRole } from "./RoleFigure";
import { DINO_ARMS, DINO_BOX, dinoFigure } from "@/lib/dino";
import { paletteHex } from "@/lib/design-tokens";
import { contrastRatio, formatRatio } from "@/lib/a11y/contrast";
import { colorIn } from "@/lib/a11y/css-tokens";

export const metadata: Metadata = { title: "The x as operator — xCO" };

const LABEL = "font-mono text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase";
const BODY = "font-body text-[24px] text-xco-ink leading-[26px]";
const MONO = "font-mono text-[0.9375rem] leading-[1.6]";
const SMALL = "font-mono text-[0.75rem] leading-[1.4]";

const change = changeLog.find((c) => c.id === "CH-08")!;

// Measured, never typed: the hand-written 2.46:1 had drifted from the palette.
const DUSK_ON_PAPER = formatRatio(contrastRatio(paletteHex.dusk, paletteHex.paper));
const DUSK_ON_DARK = formatRatio(contrastRatio(paletteHex.dusk, colorIn("ink", "--xco-paper")));

const RULES = [
  { n: "01", rule: "The x has no face. It shows character only through how it moves." },
  { n: "02", rule: "One live x on a page. Multiply's children are that x expanding, and they recombine." },
  { n: "03", rule: "At rest the x is the logo's x: same geometry, same place, same scale." },
  { n: "04", rule: "The x adds nothing the page does not already say. Never use it to carry meaning alone." },
  { n: "05", rule: "The x moves only in response to the reader. Nothing starts by itself or runs longer than five seconds." },
  { n: "06", rule: "Before it takes a new role, the x returns to a plain x." },
  { n: "07", rule: "Only the x carries dusk. As a diagram it thins; its terminals stay flat." },
  { n: "08", rule: "With reduced motion the x appears in place and does not travel. The Crawler is off." },
] as const;

const ROLES: { role: FigureRole; name: string; op: string; trigger: string; does: string }[] = [
  {
    role: "keeper",
    name: "Keeper",
    op: "index",
    trigger: "The reader scrolls past the top of the page.",
    does: "Waits in the left margin beside the passage being read. It moves only after the reader settles on a passage, and it leans into travel.",
  },
  {
    role: "framer",
    name: "Framer",
    op: "isolate",
    trigger: "The reader points at, or focuses, something marked to frame.",
    does: "Flies there as an x, then unfolds its four arms into four crop marks around it. It folds back before it goes anywhere else.",
  },
  {
    role: "crawler",
    name: "Crawler",
    op: "connect",
    trigger: "Only when the reader invites it.",
    does: "Walks on its four arm tips, a diagonal pair at a time, and leaves a fading guide line. Left alone, it walks back and settles into the exact mark.",
  },
  {
    role: "multiply",
    name: "Multiply",
    op: "scale",
    trigger: "The reader points at the hero word.",
    does: "Moves into the figure and expands: each arm tip opens a half-size x, three generations deep (1, 4, 16, 64). Then it recombines.",
  },
];

export default function XOperatorPage() {
  return (
    <div className="doc-wrap py-12 space-y-24">
      <header className="space-y-4 pb-6">
        <Link href="/logo" className={`${MONO} text-xco-ink-muted hover:text-xco-dusk-ink transition-colors`}>
          ← Logo
        </Link>
        <div className="flex items-baseline justify-between">
          <h1 className="doc-display text-xco-ink">The x as operator</h1>
          <WIP variant="version" />
        </div>
        <div className="max-w-3xl">
          <ProvisionalChange change={change} />
        </div>
      </header>

      <section className="max-w-2xl space-y-4">
        <p className={BODY}>
          In the logotype the lowercase x is the operator acting on the C and the O. It
          is the only glyph allowed to carry dusk.
        </p>
        <p className={BODY}>
          On the website it can leave the mark and act on the page: keep the reader&apos;s
          place, frame what matters, walk, and expand. While it is away, the logo reads
          CO. The operator is out working.
        </p>
        <p className={BODY}>
          It has no face. It shows character only through how it moves, and at rest it
          is always the logo&apos;s x, in place.
        </p>
        <p>
          <Link href="/x-demo" className={`${MONO} inline-block py-2 text-xco-ink underline underline-offset-4 hover:text-xco-dusk-ink`}>
            Open the live demo →
          </Link>
        </p>
      </section>

      <section className="space-y-8">
        <h2 className={LABEL}>Rules</h2>
        <ol className="max-w-3xl">
          {RULES.map((r) => (
            <li key={r.n} className="grid grid-cols-[3rem_1fr] gap-4 py-3" style={{ borderTop: "1px solid var(--border-default)" }}>
              <span className={`${MONO} text-xco-ink-muted`}>{r.n}</span>
              <span className="font-body text-[20px] leading-[26px] text-xco-ink">{r.rule}</span>
            </li>
          ))}
        </ol>
        <p className={`${MONO} max-w-2xl text-xco-ink`}>
          [rule] Dusk on paper is {DUSK_ON_PAPER}, below the 3:1 a meaningful graphic needs. That is
          why rule 04 exists. On dark paper it is {DUSK_ON_DARK}.
        </p>
      </section>

      <section className="space-y-10">
        <h2 className={LABEL}>Four roles</h2>
        <ul className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {ROLES.map((r) => (
            <li key={r.role} className="space-y-4">
              <RoleFigure role={r.role} />
              <div className="space-y-2">
                <h3 className="doc-h2 text-xco-ink">{r.name}</h3>
                <p className={`${SMALL} uppercase tracking-widest`} style={{ color: "var(--xco-dusk-ink)" }}>
                  Operator: {r.op}
                </p>
                <p className={`${SMALL} text-xco-ink-muted`}>{r.trigger}</p>
                <p className="font-body text-[20px] leading-[26px] text-xco-ink max-w-md">{r.does}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className={`${MONO} max-w-2xl text-xco-ink`}>
          [rule] Priority, when two roles apply: Multiply, then Framer, then Crawler, then
          Keeper, then home in the logo. Pages opt in with{" "}
          <code className="font-code text-[0.875rem]">data-keep</code>,{" "}
          <code className="font-code text-[0.875rem]">data-frame</code>,{" "}
          <code className="font-code text-[0.875rem]">data-expand</code> and{" "}
          <code className="font-code text-[0.875rem]">data-expand-stage</code>, and mark the
          logo&apos;s own x strokes <code className="font-code text-[0.875rem]">data-logo-x</code> so
          the logo reads xCO before the script runs.
        </p>
      </section>

      <section id="dino" className="space-y-8">
        <h2 className={LABEL}>Dino: the x at rest in d.INO</h2>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 items-center">
          <DinoFigure />
          <div className="space-y-4 max-w-md">
            <p className="font-body text-[20px] leading-[26px] text-xco-ink">
              Inside d.INO products the x may rest as Dino, d.INO&apos;s guide. The legs are the x&apos;s lower
              arms at {DINO_ARMS.front} times their length, the tail its upper-left arm at {DINO_ARMS.tail}, and
              the upper-right arm grows to {DINO_ARMS.neck} times into the neck and a flat head.
            </p>
            <p className="font-body text-[20px] leading-[26px] text-xco-ink">
              The small dusk x at the crossing, the heart, is the logo&apos;s x at rest. It is the only dusk on
              Dino. No face, ever. Dino unfolds from the x only in answer to the person, in under a second.
            </p>
            <p className={`${SMALL} text-xco-ink-muted`}>Adopted as CH-09, 19 Nov 2026.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function DinoFigure() {
  const { arms, heartHalf: h } = dinoFigure();
  const line = (pts: { x: number; y: number }[]) => pts.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join(" ");
  const c = arms.neck[0];
  return (
    <svg viewBox={`0 0 ${DINO_BOX.width} ${DINO_BOX.height}`} className="w-full max-w-sm" role="img" aria-label="Dino, built from the logo's x">
      <g fill="none" strokeWidth={12} strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit={10} stroke="var(--xco-ink)">
        {Object.values(arms).map((pts, i) => <path key={i} d={line(pts)} />)}
      </g>
      <path d={`M${c.x - h.x} ${c.y - h.y} L${c.x + h.x} ${c.y + h.y} M${c.x + h.x} ${c.y - h.y} L${c.x - h.x} ${c.y + h.y}`}
        fill="none" strokeWidth={5} strokeLinecap="butt" stroke="var(--xco-dusk)" />
    </svg>
  );
}
