// A still figure of one role of the x as operator. Drawn from the same pure
// geometry the live component uses (lib/x-operator.ts), so a figure cannot
// drift from the behaviour it documents.

import { logoGeometry as g } from "@/lib/logo";
import { ARMS, cropMarksPath, multiplyFillK, multiplyScales, tip, xPath, type Vec } from "@/lib/x-operator";

export type FigureRole = "keeper" | "framer" | "crawler" | "multiply";

const W = 240;
const H = 160;
const K = 0.385; // the docked x on a 40 px logo
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
  // Mid-stride, walking right: the trailing pair (TL, BL) lags behind its rest,
  // the leading pair reaches ahead, and BL is lifted, so it draws shorter.
  const feet: Vec[] = ARMS.map((_, i) => {
    const t = tip(i, 0.62);
    const lag = i === 0 || i === 3 ? -14 : 7;
    return { x: body.x + t.x + lag, y: body.y + t.y };
  });
  const lifted = { x: body.x + (feet[3].x - body.x) * 0.7, y: body.y + (feet[3].y - body.y) * 0.7 };
  const legs = [feet[0], feet[1], feet[2], lifted].map((p) => `M${body.x} ${body.y}L${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join("");
  return (
    <>
      <path d="M24 132 C 60 128, 90 104, 150 78" strokeWidth={1.5} strokeOpacity={0.55} strokeDasharray="2 5" />
      <path d={legs} strokeWidth={g.stroke * 0.62} />
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
