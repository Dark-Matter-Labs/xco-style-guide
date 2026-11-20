"use client";

// One recipient's folded A6 card, as two print pages of 216 × 154 mm: A5
// landscape plus 3 mm bleed all round, folded at 108 mm.
//   Outside: back (left) | front (right)    Inside: note (left) | blank to write on (right)
// Print duplex, flipping on the short edge, so the inside sits behind the outside.
// Only the front is printed solid; the rest is the paper, so pens write on it.

import { useEffect, useRef } from "react";
import { cPath, inkBounds, logoGeometry, oPath, xPaths } from "@/lib/logo";
import { dmInkLeft, dmStampHeight, dmStampPath, dmViewBox, dmWordmarkPath } from "@/lib/dm-logo";
import { FACTS, attractor, density, fitter, network, places, tone, type Attractor } from "@/lib/holiday-card/pattern";

export interface Recipient {
  display: string;
  seedName: string;
  link: string;
  message?: string;
}

const GROUND = "#101F2D", CHALK = "#F6F1E5", EMBER = "#F47743", INK = "#101F24", MUTED = "#516962";
const MM = 300 / 25.4; // print pixels per mm (300 dpi)
const SHEET_W = 216, SHEET_H = 154, FOLD = 108, BLEED = 3, SAFE = 8;
const INK_W = inkBounds.right - inkBounds.left, INK_H = inkBounds.bottom - inkBounds.top;

const sheet = "relative overflow-hidden bg-white shadow-md print:shadow-none break-after-page [print-color-adjust:exact]";
const sheetStyle = { width: `${SHEET_W}mm`, height: `${SHEET_H}mm` };
const at = (x: number, y: number, w?: number) => ({ position: "absolute" as const, left: `${x}mm`, top: `${y}mm`, width: w === undefined ? undefined : `${w}mm` });

/** The xCO mark, `h` mm tall: C and O in `ink`, the x in ember. */
function Logo({ x, y, h, ink }: { x: number; y: number; h: number; ink: string }) {
  return (
    <svg x={x} y={y} height={h} width={(h * INK_W) / INK_H} viewBox={`${inkBounds.left} ${inkBounds.top} ${INK_W} ${INK_H}`}>
      <g fill="none" strokeWidth={logoGeometry.stroke} strokeLinecap="butt">
        {xPaths().map((d) => <path key={d} d={d} stroke={EMBER} />)}
        <path d={cPath()} stroke={ink} />
        <path d={oPath()} stroke={ink} />
      </g>
    </svg>
  );
}

/** Paints the recipient's attractor into a canvas covering `w × h` mm, 300 dpi. */
function Field({ at: a, w, h, fill, iterations, ground, trace, marks, delay }: {
  at: Attractor; w: number; h: number; fill: number; iterations: number; ground: string | null; trace?: boolean; marks?: boolean; delay: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const id = window.setTimeout(() => {
      const cv = ref.current;
      const ctx = cv?.getContext("2d");
      if (!cv || !ctx) return;
      const W = Math.round(w * MM), H = Math.round(h * MM);
      cv.width = W; cv.height = H;
      const { counts, max } = density(a, W, H, iterations, fill);
      const img = ctx.createImageData(W, H), d = img.data;
      const [gr, gg, gb] = ground ? [1, 3, 5].map((i) => parseInt(ground.slice(i, i + 2), 16)) : [255, 255, 255];
      const [ir, ig, ib] = [1, 3, 5].map((i) => parseInt((ground ? CHALK : INK).slice(i, i + 2), 16));
      for (let i = 0; i < counts.length; i++) {
        const v = tone(counts[i], max) * (ground ? 1 : 0.32); // on paper the field is a faint ground for the marks
        d[i * 4] = gr + (ir - gr) * v; d[i * 4 + 1] = gg + (ig - gg) * v; d[i * 4 + 2] = gb + (ib - gb) * v; d[i * 4 + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      const map = fitter(a, W, H, fill);
      ctx.fillStyle = EMBER;
      if (trace) for (const [x, y] of a.trace) { const [px, py] = map(x, y); ctx.beginPath(); ctx.arc(px, py, 0.32 * MM, 0, 6.2832); ctx.fill(); }
      if (marks) a.marks.forEach(([x, y], k) => {
        const [px, py] = map(x, y);
        ctx.beginPath(); ctx.arc(px, py, 0.9 * MM, 0, 6.2832);
        if (k < 4) ctx.fill(); // the four live options
        else { ctx.strokeStyle = EMBER; ctx.lineWidth = 0.25 * MM; ctx.stroke(); }
      });
    }, delay);
    return () => window.clearTimeout(id);
  }, [a, w, h, fill, iterations, ground, trace, marks, delay]);
  return <canvas ref={ref} style={{ width: "100%", height: "100%", display: "block" }} aria-hidden />;
}

/** Sixteen places, each growing its own rings, in a w × h mm box. */
function Places({ seedName, x, y, w, h }: { seedName: string; x: number; y: number; w: number; h: number }) {
  const S = Math.min(w, h);
  return (
    <g transform={`translate(${x} ${y})`} fill="none">
      {places(seedName).map((p, k) => {
        const px = p.x * w, py = p.y * h;
        return (
          <g key={k}>
            {[0, 1, 2, 3].map((ring) => {
              const rr = p.r * S * (0.35 + ring * 0.22);
              const d = Array.from({ length: 33 }, (_, q) => {
                const th = (q / 32) * 6.2832, wob = 1 + 0.22 * p.n(Math.cos(th) * 1.3 + ring * 0.4, Math.sin(th) * 1.3);
                return `${q ? "L" : "M"}${(px + Math.cos(th) * rr * wob).toFixed(2)} ${(py + Math.sin(th) * rr * wob * 0.86).toFixed(2)}`;
              }).join("");
              return <path key={ring} d={d} stroke={k === 15 && ring === 0 ? EMBER : INK} strokeOpacity={0.8 - ring * 0.14} strokeWidth={ring === 0 ? 0.22 : 0.13} />;
            })}
            <circle cx={px} cy={py} r={0.35} fill={k === 15 ? EMBER : INK} />
          </g>
        );
      })}
    </g>
  );
}

/** Thirty-three interventions and their 95 links, in a w × h mm box. */
function Network({ seedName, x, y, w, h }: { seedName: string; x: number; y: number; w: number; h: number }) {
  const { nodes, links } = network(seedName);
  const P = (n: { x: number; y: number }) => [x + n.x * w, y + n.y * h];
  return (
    <g fill="none">
      {links.map(([i, j], e) => {
        const [x1, y1] = P(nodes[i]), [x2, y2] = P(nodes[j]);
        const mx = (x1 + x2) / 2 + (y2 - y1) * 0.12, my = (y1 + y2) / 2 - (x2 - x1) * 0.12;
        return <path key={e} d={`M${x1} ${y1}Q${mx} ${my} ${x2} ${y2}`} stroke={e >= 89 ? EMBER : INK} strokeOpacity={e >= 89 ? 0.9 : 0.45} strokeWidth={0.13} />;
      })}
      {nodes.map((n, k) => { const [cx, cy] = P(n); return <circle key={k} cx={cx} cy={cy} r={0.55} fill="#fff" stroke={INK} strokeWidth={0.18} />; })}
    </g>
  );
}

/** Dark Matter Labs' own lockup (master artwork), stamp `h` mm tall, black on paper as DM requires. */
function DmLogo({ x, y, h }: { x: number; y: number; h: number }) {
  const s = h / dmStampHeight, vbW = Number(dmViewBox.split(" ")[2]);
  return (
    <g transform={`translate(${x - dmInkLeft * s} ${y - 0.26 * s}) scale(${s})`} fill="#000" fillRule="evenodd" aria-label="Dark Matter Labs">
      <path d={dmStampPath} />
      <path d={dmWordmarkPath} />
      <desc>{`Dark Matter Labs, ${(vbW * s).toFixed(1)} mm wide`}</desc>
    </g>
  );
}

/** The QR code slot. shortcut: a placeholder until a QR encoder is approved; it prints the link instead. */
function QrSlot({ x, y, size, link }: { x: number; y: number; size: number; link: string }) {
  return (
    <g>
      <rect x={x} y={y} width={size} height={size} fill="none" stroke={MUTED} strokeWidth={0.2} strokeDasharray="1 1" />
      <text x={x + size / 2} y={y + size / 2 + 1} textAnchor="middle" fontFamily="var(--font-code)" fontSize={2.6} fill={MUTED}>QR</text>
      <title>{link}</title>
    </g>
  );
}

export function CardSheets({ r, index, withQr }: { r: Recipient; index: number; withQr: boolean }) {
  const a = attractor(r.seedName);
  const L = BLEED + SAFE; // left panel's content edge
  const R = FOLD + SAFE; // right panel's content edge
  const CW = FOLD - BLEED - 2 * SAFE; // content width of a panel: 89 mm
  const BOTTOM = SHEET_H - BLEED - SAFE;
  const sans = { fontFamily: "var(--font-body)" }, serif = { fontFamily: "var(--font-display)" };

  return (
    <article aria-label={`Card for ${r.display}`} className="space-y-6 print:space-y-0">
      {/* ── Outside: back | front ── */}
      <div className={sheet} style={sheetStyle}>
        <div style={{ ...at(FOLD, 0, SHEET_W - FOLD), height: `${SHEET_H}mm` }}>
          <Field at={a} w={SHEET_W - FOLD} h={SHEET_H} fill={0.78} iterations={2_400_000} ground={GROUND} trace delay={index * 120} />
        </div>
        <svg viewBox={`0 0 ${SHEET_W} ${SHEET_H}`} className="absolute inset-0 h-full w-full">
          <Logo x={R} y={BOTTOM - 5} h={5} ink={CHALK} />
          {withQr ? (
            <QrSlot x={BLEED + (FOLD - BLEED) / 2 - 13} y={40} size={26} link={r.link} />
          ) : (
            // Without a QR code the back is quiet: the mark alone, centred on the panel.
            <Logo x={BLEED + (FOLD - BLEED) / 2 - (9 * INK_W) / INK_H / 2} y={58} h={9} ink={INK} />
          )}
          <line x1={L} x2={L + CW} y1={BOTTOM - 13} y2={BOTTOM - 13} stroke={INK} strokeOpacity={0.25} strokeWidth={0.15} />
          <DmLogo x={L + 33} y={BOTTOM - 6} h={5} />
        </svg>
        <p className="m-0 text-[8.5pt] leading-none" style={{ ...at(R, BLEED + SAFE), ...sans, color: EMBER }}>For {r.display}</p>
        <p className="m-0 text-[7.5pt] leading-none" style={{ ...at(SHEET_W - BLEED - SAFE - 20, BOTTOM - 3, 20), ...sans, color: CHALK, opacity: 0.75, textAlign: "right" }}>2026</p>
        {withQr && (
          <p className="m-0 text-[8pt] leading-snug" style={{ ...at(L, 70, CW), ...sans, color: INK, textAlign: "center" }}>
            Scan for your card. It moves.
          </p>
        )}
        <p className="m-0 text-[6.5pt] leading-none" style={{ ...at(L, BOTTOM - 4.2, 32), ...sans, color: MUTED }}>xCO is an initiative of</p>
      </div>

      {/* ── Inside: note | blank to write on ── */}
      <div className={sheet} style={sheetStyle}>
        <p className="m-0 text-[17pt] leading-[1.05]" style={{ ...at(L, BLEED + SAFE + 2, CW), ...serif, color: INK, letterSpacing: "-0.02em" }}>
          2026 was made<br />with you.
        </p>
        <svg viewBox={`0 0 ${SHEET_W} ${SHEET_H}`} className="absolute inset-0 h-full w-full" aria-hidden>
          <Places seedName={r.seedName} x={L} y={76} w={30} h={24} />
          <Network seedName={r.seedName} x={L} y={110} w={30} h={24} />
        </svg>
        <div style={{ ...at(L, 42), width: "30mm", height: "24mm" }}>
          <Field at={a} w={30} h={24} fill={0.92} iterations={260_000} ground={null} marks delay={index * 120 + 60} />
        </div>
        {FACTS.map((f, i) => (
          <div key={f.n} style={{ ...at(L + 34, 42 + i * 34, CW - 34), ...sans, color: INK }}>
            <p className="m-0 text-[20pt] leading-none" style={serif}>{f.n}</p>
            <p className="m-0 mt-[1.2mm] text-[7.5pt] leading-[1.3]">{f.line}</p>
            {f.sub && <p className="m-0 text-[7pt] leading-[1.3]" style={{ color: MUTED }}>{f.sub}</p>}
          </div>
        ))}

        {r.message && (
          <p className="m-0 whitespace-pre-line text-[11pt] leading-[1.45] italic" style={{ ...at(R, BLEED + SAFE + 4, CW), ...serif, color: INK }}>
            {r.message}
          </p>
        )}
        <p className="m-0 text-[8pt] leading-none" style={{ ...at(R, BOTTOM - 3), ...serif, color: MUTED }}>2027 = x</p>
      </div>
    </article>
  );
}
