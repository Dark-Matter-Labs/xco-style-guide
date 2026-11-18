// A still figure of one role of the x as operator. Drawn from the same pure
// geometry the live component uses (lib/x-operator.ts), so a figure cannot
// drift from the behaviour it documents.

import { logoGeometry as g } from "@/lib/logo";
import { ARMS, CRAWL_K, INK_H, cropMarksPath, multiplyFillK, multiplyScales, tip, xPath, type Vec } from "@/lib/x-operator";

export type FigureRole = "keeper" | "framer" | "crawler" | "multiply";

const W = 240;
const H = 160;
const K = 40 / INK_H; // the docked x on a 40 px logo
const STROKE = g.stroke * K;
const BAR = "var(--xco-paper-structural)";

const LABELS: Record<FigureRole, string> = {
  keeper: "The x in the left margin, beside the second of five lines of text.",
  framer: "Four crop marks around a short tag: the x's four arms, unfolded.",
  crawler: "The x mid-stride, one foot lifted, trailing a dotted guide line.",
  multiply: "The x expanded three generations: each arm tip opens a half-size x.",
};

function Keeper() {
  const lines = [28, 52, 76, 100, 124];
  return (
    <>
      {lines.map((y, i) => <rect key={y} x={56} y={y - 4} width={i === 4 ? 96 : 156} height={8} fill={BAR} stroke="none" />)}
      <path d={xPath({ x: 32, y: 52 }, K)} strokeWidth={STROKE} />
    </>
  );
}

function Framer() {
  const c = { x: W / 2, y: H / 2 };
  return (
    <>
      <rect x={c.x - 44} y={c.y - 5} width={88} height={10} fill={BAR} stroke="none" />
      <path d={cropMarksPath(c, K, { x: 52, y: 13 }, 1)} strokeWidth={2} />
    </>
  );
}

function Crawler() {
  const body = { x: 150, y: 78 };
  // Mid-stride, walking right, one diagonal pair at a time: TL and BR are
  // planted where the body left them; TR and BL are lifted mid-step, so they
  // draw shorter (as XOperator draws a lifted foot) and already reach forward.
  const LIFTED = new Set([1, 3]);
  const legs = ARMS.map((_, i) => {
    const t = tip(i, CRAWL_K);
    const foot = LIFTED.has(i)
      ? { x: body.x + (t.x + 5) * 0.6, y: body.y + t.y * 0.6 }
      : { x: body.x + t.x - 5, y: body.y + t.y };
    return `M${body.x} ${body.y}L${foot.x.toFixed(2)} ${foot.y.toFixed(2)}`;
  }).join("");
  return (
    <>
      <path d="M24 132 C 60 128, 90 104, 150 78" strokeWidth={1.5} strokeOpacity={0.55} strokeDasharray="2 5" />
      <path d={legs} strokeWidth={g.stroke * CRAWL_K} />
    </>
  );
}

function Multiply() {
  const scale = multiplyScales(3);
  const k = multiplyFillK({ w: H + 20, h: H + 20 }); // fill the figure's height, with a margin
  const gens = scale.map(() => "");
  const grow = (c: Vec, n: number) => {
    gens[n] += xPath(c, k * scale[n]);
    if (n === scale.length - 1) return;
    ARMS.forEach((_, i) => { const t = tip(i, k * scale[n]); grow({ x: c.x + t.x, y: c.y + t.y }, n + 1); });
  };
  grow({ x: W / 2, y: H / 2 }, 0);
  return <>{gens.map((d, n) => <path key={n} d={d} strokeWidth={STROKE * Math.sqrt(scale[n])} />)}</>;
}

const FIGURES: Record<FigureRole, () => JSX.Element> = { keeper: Keeper, framer: Framer, crawler: Crawler, multiply: Multiply };

export function RoleFigure({ role }: { role: FigureRole }) {
  const Figure = FIGURES[role];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={LABELS[role]} className="max-w-full h-auto" style={{ background: "var(--xco-paper-quiet)" }}>
      <g fill="none" strokeLinecap="butt" strokeLinejoin="miter" style={{ stroke: "var(--xco-dusk)" }}>
        <Figure />
      </g>
    </svg>
  );
}
