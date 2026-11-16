"use client";

// spike: four sketches of the logo's x leaving the mark and acting on a page.
// Held to the identity's tension: no face, no eyes. Character comes from motion
// alone, and at rest the x is always the exact logotype x, docked in the logo.
// Animation state lives in mutable locals inside each rAF loop on purpose:
// re-rendering React 60 times a second for one glyph would be the wrong tool.

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { logoGeometry as g, inkBounds, cPath, oPath } from "@/lib/logo";

// ── The x's own geometry, lifted from the logotype ──────────────────
const X_CX = g.xLeft + g.xWidth / 2;
const X_CY = g.baseline - g.xHeight / 2;
const TIP = { x: g.xWidth / 2, y: g.xHeight / 2 };
// TL, TR, BR, BL. The diagonal pairs (0,2) and (1,3) are the x's two strokes.
const ARMS: ReadonlyArray<readonly [number, number]> = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
const PAIRS = [[0, 2], [1, 3]];
const INK_W = inkBounds.right - inkBounds.left;
const INK_H = inkBounds.bottom - inkBounds.top;

type Vec = { x: number; y: number };
type Dock = Vec & { k: number };
type Body = Vec & { vx: number; vy: number };
type CharProps = { dock: () => Dock; reduce: boolean };

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const dist = (a: Vec, b: Vec) => Math.hypot(a.x - b.x, a.y - b.y);
const approach = (v: number, to: number, rate: number, dt: number) => v + (to - v) * (1 - Math.exp(-rate * dt));
const f = (n: number) => n.toFixed(2);

function spring(b: Body, t: Vec, dt: number, stiff: number, damp: number) {
  b.vx += (stiff * (t.x - b.x) - damp * b.vx) * dt;
  b.vy += (stiff * (t.y - b.y) - damp * b.vy) * dt;
  b.x += b.vx * dt;
  b.y += b.vy * dt;
}

/** Offset of arm i's tip at scale k, optionally rotated. */
function tip(i: number, k: number, deg = 0): Vec {
  const [sx, sy] = ARMS[i];
  const x = sx * TIP.x * k;
  const y = sy * TIP.y * k;
  if (!deg) return { x, y };
  const r = (deg * Math.PI) / 180;
  return { x: x * Math.cos(r) - y * Math.sin(r), y: x * Math.sin(r) + y * Math.cos(r) };
}

/** The x as four arms from its centre. Butt caps meeting at the centre draw the same two strokes as the logo. */
function xPath(c: Vec, k: number, deg = 0): string {
  return ARMS.map((_, i) => {
    const t = tip(i, k, deg);
    return `M${f(c.x)} ${f(c.y)}L${f(c.x + t.x)} ${f(c.y + t.y)}`;
  }).join("");
}

function pageRect(el: Element) {
  const r = el.getBoundingClientRect();
  return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height };
}

/** Where the logo's x sits, in page coordinates, and the scale it is drawn at. */
function readDock(svg: SVGSVGElement | null): Dock {
  if (!svg) return { x: 0, y: 0, k: 0.35 };
  const r = svg.getBoundingClientRect();
  const k = r.height / INK_H;
  return {
    x: r.left + scrollX + (X_CX - inkBounds.left) * k,
    y: r.top + scrollY + (X_CY - inkBounds.top) * k,
    k,
  };
}

/** rAF loop. dt is clamped so a backgrounded tab does not fling the x across the page. */
function loop(step: (dt: number, now: number) => void) {
  let raf = 0;
  let last = performance.now();
  const tick = (now: number) => {
    step(Math.min((now - last) / 1000, 1 / 30), now);
    last = now;
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduce;
}

function Overlay({ gRef, children }: { gRef: RefObject<SVGGElement>; children: React.ReactNode }) {
  return (
    <svg aria-hidden className="pointer-events-none fixed inset-0 z-40 h-full w-full overflow-visible">
      <g ref={gRef} fill="none" strokeLinecap="butt" strokeLinejoin="miter" style={{ stroke: "var(--xco-dusk)" }}>
        {children}
      </g>
    </svg>
  );
}

const follow = (gEl: SVGGElement | null) => gEl?.setAttribute("transform", `translate(${-scrollX} ${-scrollY})`);

// ── 1. Keeper — operator: index ─────────────────────────────────────
// Leaves the logo as you read and keeps your place in the margin. Tentative:
// it moves only once you have settled on a passage. Leans into travel.
function Keeper({ dock, reduce }: CharProps) {
  const gRef = useRef<SVGGElement>(null);
  const pRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const blocks = Array.from(document.querySelectorAll<HTMLElement>("[data-keep]"));
    const s: Body = { ...dock(), vx: 0, vy: 0 };
    let target = -1; // -1 = home, in the logo
    let pending = -1;
    let pendingSince = 0;
    let locked = true;

    const main = document.getElementById("main");
    // One margin line for every passage: the main column's left gutter.
    const gutter = () => {
      if (!main) return 18;
      const left = main.getBoundingClientRect().left + scrollX + parseFloat(getComputedStyle(main).paddingLeft);
      return Math.max(left - 44, 18);
    };
    const anchor = (el: HTMLElement): Vec => {
      const r = pageRect(el);
      const lh = parseFloat(getComputedStyle(el).lineHeight) || 28;
      return { x: gutter(), y: r.y + Math.min(lh, r.h) / 2 };
    };

    return loop((dt, now) => {
      const home = dock();
      const line = innerHeight * 0.38;
      let want = -1;
      if (scrollY > 80) blocks.forEach((el, i) => { if (el.getBoundingClientRect().top < line) want = i; });
      if (want !== pending) { pending = want; pendingSince = now; }
      if (pending !== target && now - pendingSince > 320) { target = pending; locked = false; }

      const t = target < 0 ? home : anchor(blocks[target]);
      if (locked || reduce) {
        Object.assign(s, { x: t.x, y: t.y, vx: 0, vy: 0 });
      } else {
        spring(s, t, dt, 80, 14);
        if (dist(s, t) < 0.5 && Math.hypot(s.vx, s.vy) < 4) locked = true;
      }
      const lean = clamp(s.vy * 0.05, -35, 35); // upright exactly when still
      pRef.current?.setAttribute("d", xPath(s, home.k, lean));
      pRef.current?.setAttribute("stroke-width", f(g.stroke * home.k));
      follow(gRef.current);
    });
  }, [dock, reduce]);

  return <Overlay gRef={gRef}><path ref={pRef} /></Overlay>;
}

// ── 2. Framer — operator: isolate ───────────────────────────────────
// Flies to what you point at, then its four arms unfold into four crop marks
// around it. Folds back into an x before it goes home.
function Framer({ dock, reduce }: CharProps) {
  const gRef = useRef<SVGGElement>(null);
  const pRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const s: Body = { ...dock(), vx: 0, vy: 0 };
    let el: Element | null = null;
    let leave = 0;
    let locked = true;
    let open = 0;
    let hw = 0;
    let hh = 0;

    const onOver = (e: Event) => {
      const hit = (e.target as Element | null)?.closest?.("[data-frame]") ?? null;
      if (hit) { clearTimeout(leave); el = hit; locked = false; }
      else if (el) { clearTimeout(leave); leave = window.setTimeout(() => { el = null; }, 500); }
    };
    document.addEventListener("pointerover", onOver);
    document.addEventListener("focusin", onOver);

    const stop = loop((dt) => {
      const home = dock();
      const k = home.k;
      let t: Vec = home;
      let wantOpen = 0;
      let wantHw = TIP.x * k;
      let wantHh = TIP.y * k;
      if (el) {
        const r = pageRect(el);
        t = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
        if (dist(s, t) < 24) { wantOpen = 1; wantHw = r.w / 2 + 8; wantHh = r.h / 2 + 6; }
      } else if (open > 0.04) {
        t = { x: s.x, y: s.y }; // fold up where it is, then go home
      }

      if (locked) {
        Object.assign(s, { x: home.x, y: home.y, vx: 0, vy: 0 });
        open = 0; hw = wantHw; hh = wantHh;
      } else if (reduce) {
        Object.assign(s, { x: t.x, y: t.y, vx: 0, vy: 0 });
        open = wantOpen; hw = wantHw; hh = wantHh;
        if (!el) locked = true;
      } else {
        spring(s, t, dt, 190, 24);
        open = approach(open, wantOpen, 11, dt);
        hw = approach(hw, wantHw, 11, dt);
        hh = approach(hh, wantHh, 11, dt);
        if (!el && open < 0.01 && dist(s, home) < 0.5 && Math.hypot(s.vx, s.vy) < 4) locked = true;
      }

      const e = ease(clamp(open, 0, 1));
      const L = Math.min(14, hw, hh);
      const P = (a: Vec, b: Vec) => `${f(lerp(a.x, b.x, e))} ${f(lerp(a.y, b.y, e))}`;
      const d = ARMS.map(([sx, sy], i) => {
        const tp = tip(i, k);
        // Folded: centre → midpoint → tip, a straight arm. Open: an L at the corner.
        const corner = { x: s.x + sx * hw, y: s.y + sy * hh };
        return (
          `M${P(s, { x: corner.x - sx * L, y: corner.y })}` +
          `L${P({ x: s.x + tp.x / 2, y: s.y + tp.y / 2 }, corner)}` +
          `L${P({ x: s.x + tp.x, y: s.y + tp.y }, { x: corner.x, y: corner.y - sy * L })}`
        );
      }).join("");
      pRef.current?.setAttribute("d", d);
      pRef.current?.setAttribute("stroke-width", f(lerp(g.stroke * k, 2, e)));
      follow(gRef.current);
    });

    return () => {
      stop();
      clearTimeout(leave);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("focusin", onOver);
    };
  }, [dock, reduce]);

  return <Overlay gRef={gRef}><path ref={pRef} /></Overlay>;
}

// ── 3. Crawler — operator: connect ──────────────────────────────────
// Walks on its four arm tips, diagonal pairs stepping in turn, and trails a
// fading guide line. Stops short of the pointer. Idle, it walks home and its
// feet settle back onto the exact geometry of the mark.
function Crawler({ dock, reduce }: CharProps) {
  const gRef = useRef<SVGGElement>(null);
  const legsRef = useRef<SVGPathElement>(null);
  const trailRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const home0 = dock();
    const body = { x: home0.x, y: home0.y };
    const vel = { x: 0, y: 0 };
    const feet = ARMS.map((_, i) => {
      const tp = tip(i, home0.k);
      return { x: home0.x + tp.x, y: home0.y + tp.y, fx: 0, fy: 0, tx: 0, ty: 0, t: -1 }; // t < 0: planted
    });
    const ptr = { x: 0, y: 0, at: -1e9, inside: false };
    const trail: (Vec & { at: number })[] = [];
    let k = home0.k;
    let atHome = true;

    const onMove = (e: PointerEvent) => {
      Object.assign(ptr, { x: e.clientX + scrollX, y: e.clientY + scrollY, at: performance.now(), inside: true });
    };
    const onLeave = () => { ptr.inside = false; };
    document.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);

    const rest = (i: number) => {
      const tp = tip(i, k);
      return { x: body.x + tp.x, y: body.y + tp.y };
    };

    const stop = loop((dt, now) => {
      const h = dock();
      const idle = reduce || !ptr.inside || now - ptr.at > 2400;
      const target = idle ? h : ptr;
      const keepOff = idle ? 0 : 40;
      const dx = target.x - body.x;
      const dy = target.y - body.y;
      const d = Math.hypot(dx, dy);
      if (!idle) atHome = false;
      else if (d < 1) atHome = true;

      if (atHome) {
        Object.assign(body, { x: h.x, y: h.y });
        Object.assign(vel, { x: 0, y: 0 });
        k = h.k;
        feet.forEach((ft, i) => Object.assign(ft, rest(i), { t: -1 }));
      } else {
        const speed = d > keepOff ? Math.min(170, (d - keepOff) * 4) : 0;
        Object.assign(vel, { x: d ? (dx / d) * speed : 0, y: d ? (dy / d) * speed : 0 });
        body.x += vel.x * dt;
        body.y += vel.y * dt;
        k = lerp(h.k, Math.max(h.k, 0.62), clamp(dist(body, h) / 90, 0, 1));

        feet.forEach((ft) => {
          if (ft.t < 0) return;
          ft.t = Math.min(1, ft.t + dt / 0.09);
          const e = ease(ft.t);
          ft.x = lerp(ft.fx, ft.tx, e);
          ft.y = lerp(ft.fy, ft.ty, e);
          if (ft.t >= 1) ft.t = -1;
        });

        // One diagonal pair steps at a time: whichever is furthest from where it belongs.
        if (feet.every((ft) => ft.t < 0)) {
          const err = (p: number[]) => Math.max(...p.map((i) => dist(feet[i], rest(i))));
          const pair = err(PAIRS[0]) >= err(PAIRS[1]) ? PAIRS[0] : PAIRS[1];
          const moving = speed > 4;
          const reach = Math.hypot(TIP.x, TIP.y) * k;
          if (err(pair) > (moving ? reach * 0.45 : 0.3)) {
            pair.forEach((i) => {
              const r = rest(i);
              const lead = moving ? 0.1 : 0;
              Object.assign(feet[i], { fx: feet[i].x, fy: feet[i].y, tx: r.x + vel.x * lead, ty: r.y + vel.y * lead, t: 0 });
            });
          }
        }
        const last = trail[trail.length - 1];
        if (!last || dist(body, last) > 3) trail.push({ x: body.x, y: body.y, at: now });
      }
      while (trail.length && now - trail[0].at > 2600) trail.shift();

      const legs = feet.map((ft) => {
        const lift = ft.t >= 0 ? Math.sin(Math.PI * ft.t) * 0.22 : 0; // a lifted foot reads as a shorter arm
        return `M${f(body.x)} ${f(body.y)}L${f(lerp(ft.x, body.x, lift))} ${f(lerp(ft.y, body.y, lift))}`;
      }).join("");
      legsRef.current?.setAttribute("d", legs);
      legsRef.current?.setAttribute("stroke-width", f(g.stroke * k));
      trailRef.current?.setAttribute("d", trail.map((p, i) => `${i ? "L" : "M"}${f(p.x)} ${f(p.y)}`).join(""));
      follow(gRef.current);
    });

    return () => {
      stop();
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [dock, reduce]);

  return (
    <Overlay gRef={gRef}>
      <path ref={trailRef} strokeWidth={1.5} strokeOpacity={0.55} strokeDasharray="2 5" />
      <path ref={legsRef} />
    </Overlay>
  );
}

// ── 4. Multiply — operator: scale ───────────────────────────────────
// x as the expansion operator, taken literally. Each arm tip opens another x
// at half size, three generations deep (1 → 4 → 16 → 64), then recombines.
const GENS = 3;
function Multiply({ dock, reduce }: CharProps) {
  const gRef = useRef<SVGGElement>(null);
  const genRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    const stage = document.querySelector("[data-expand-stage]");
    const home0 = dock();
    const s: Body = { x: home0.x, y: home0.y, vx: 0, vy: 0 };
    let k = home0.k;
    let on = false;
    let leave = 0;
    let growth = 0;
    let locked = true;

    const onOver = (e: Event) => {
      const hit = (e.target as Element | null)?.closest?.("[data-expand]") ?? null;
      if (hit) { clearTimeout(leave); on = true; locked = false; }
      else if (on) { clearTimeout(leave); leave = window.setTimeout(() => { on = false; }, 450); }
    };
    document.addEventListener("pointerover", onOver);
    document.addEventListener("focusin", onOver);

    const stop = loop((dt) => {
      const h = dock();
      const r = stage ? pageRect(stage) : null;
      // Sized so the third generation just fills the stage: total reach is 1 + ½ + ¼ + ⅛ of one arm.
      const CAPTION = 36; // keep the figure caption clear
      const big = r ? Math.min(r.w, r.h - CAPTION) / (2 * 1.875 * TIP.y * 1.1) : h.k;
      let t: Vec = h;
      let wantK = h.k;
      let wantG = 0;
      if (on && r) {
        t = { x: r.x + r.w / 2, y: r.y + (r.h - CAPTION) / 2 };
        wantK = big;
        if (dist(s, t) < 6) wantG = GENS;
      } else if (growth > 0.02) {
        t = { x: s.x, y: s.y }; // recombine in place before going home
        wantK = k;
      }

      if (locked) {
        Object.assign(s, { x: h.x, y: h.y, vx: 0, vy: 0 });
        k = h.k; growth = 0;
      } else if (reduce) {
        Object.assign(s, { x: t.x, y: t.y, vx: 0, vy: 0 });
        k = wantK; growth = wantG;
        if (!on) locked = true;
      } else {
        spring(s, t, dt, 110, 19);
        k = approach(k, wantK, 5, dt);
        growth = wantG > growth ? Math.min(wantG, growth + dt * 1.6) : Math.max(wantG, growth - dt * 3);
        if (!on && growth === 0 && dist(s, h) < 0.5 && Math.abs(k - h.k) < 0.002) locked = true;
      }

      // Each generation grows out of its parent's arm tips at half its parent's size.
      const scale = [1];
      for (let n = 1; n <= GENS; n++) scale.push(scale[n - 1] * 0.5 * ease(clamp(growth - (n - 1), 0, 1)));
      const ds = Array.from({ length: GENS + 1 }, () => "");
      const draw = (c: Vec, n: number) => {
        ds[n] += xPath(c, k * scale[n]);
        if (n === GENS || scale[n + 1] <= 0) return;
        ARMS.forEach((_, i) => {
          const tp = tip(i, k * scale[n]);
          draw({ x: c.x + tp.x, y: c.y + tp.y }, n + 1);
        });
      };
      draw(s, 0);
      genRefs.current.forEach((p, n) => {
        p?.setAttribute("d", scale[n] > 0 ? ds[n] : "");
        // Off the logo it becomes a diagram: weight stays at the logo's on-screen stroke and lightens per generation.
        p?.setAttribute("stroke-width", f(g.stroke * h.k * Math.sqrt(scale[n])));
      });
      follow(gRef.current);
    });

    return () => {
      stop();
      clearTimeout(leave);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("focusin", onOver);
    };
  }, [dock, reduce]);

  return (
    <Overlay gRef={gRef}>
      {Array.from({ length: GENS + 1 }, (_, n) => (
        <path key={n} ref={(el) => { genRefs.current[n] = el; }} />
      ))}
    </Overlay>
  );
}

// ── The sketch page ─────────────────────────────────────────────────

const CHARACTERS = [
  { id: "keeper", name: "Keeper", op: "index", Comp: Keeper,
    hint: "Scroll. The x leaves the logo and keeps your place in the margin. It moves only once you settle on a passage, and docks back into the logo at the top." },
  { id: "framer", name: "Framer", op: "isolate", Comp: Framer,
    hint: "Point at a status tag, the word Optionality, or the figure. The x flies there and its four arms unfold into crop marks." },
  { id: "crawler", name: "Crawler", op: "connect", Comp: Crawler,
    hint: "Move the pointer. The x walks on its four arm tips and leaves a fading guide line. Leave it alone and it walks home." },
  { id: "multiply", name: "Multiply", op: "scale", Comp: Multiply,
    hint: "Point at the word Optionality. The x moves into the figure and each arm tip opens another x: 1, 4, 16, 64. Then it folds back." },
] as const;
type CharId = (typeof CHARACTERS)[number]["id"];

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

function COLogo({ logoRef }: { logoRef: RefObject<SVGSVGElement> }) {
  const H = 40;
  // C and O only. The x is drawn by whichever character is active, docked exactly here.
  return (
    <svg ref={logoRef} viewBox={`${inkBounds.left} ${inkBounds.top} ${INK_W} ${INK_H}`} height={H} width={(INK_W / INK_H) * H} role="img" aria-label="xCO">
      <g fill="none" strokeWidth={g.stroke} strokeLinecap="butt" style={{ stroke: "var(--xco-ink)" }}>
        <path d={cPath()} />
        <path d={oPath()} />
      </g>
    </svg>
  );
}

function Site({ logoRef }: { logoRef: RefObject<SVGSVGElement> }) {
  return (
    <>
      <header className="sticky top-0 z-30" style={{ background: "var(--xco-paper)", borderBottom: "1px solid var(--border-default)" }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-8">
          <a href="#main" aria-label="xCO, top of page"><COLogo logoRef={logoRef} /></a>
          <nav aria-label="Sketch site" className="hidden gap-6 sm:flex">
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
              <span data-expand data-frame className="underline decoration-1 underline-offset-[6px]" style={{ textDecorationColor: "var(--xco-dusk)" }}>
                Optionality
              </span>
            </h1>
            <p data-keep className={BODY}>
              A field of work on how societies keep more futures open: through capital
              structures, institutional pathways and governance that can change course.
            </p>
          </div>
          <figure data-expand-stage className="relative aspect-square w-full max-w-[280px]" style={{ background: "var(--xco-paper-quiet)" }}>
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

export function XSketches() {
  const [who, setWho] = useState<CharId>("keeper");
  const reduce = useReducedMotion();
  const logoRef = useRef<SVGSVGElement>(null);
  const dock = useCallback(() => readDock(logoRef.current), []);
  const current = CHARACTERS.find((c) => c.id === who) ?? CHARACTERS[0];
  const Character = current.Comp;

  return (
    <>
      <Site logoRef={logoRef} />
      <Character key={who} dock={dock} reduce={reduce} />

      <div className="fixed inset-x-0 bottom-0 z-50" style={{ background: "var(--xco-paper-raised)", borderTop: "1px solid var(--border-default)" }}>
        <div className="mx-auto max-w-5xl space-y-2 px-4 py-3 sm:px-8">
          <div role="group" aria-label="How the x behaves" className="flex flex-wrap items-center gap-2">
            <span className={`${MONO} mr-2 uppercase text-xco-ink-muted`}>Sketch · the x as</span>
            {CHARACTERS.map((c) => {
              const active = c.id === who;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setWho(c.id)}
                  className={`${MONO} min-h-[40px] px-3`}
                  style={{
                    border: `1px solid ${active ? "var(--xco-ink)" : "var(--border-default)"}`,
                    background: active ? "var(--xco-ink)" : "transparent",
                    color: active ? "var(--xco-paper)" : "var(--xco-ink)",
                  }}
                >
                  {c.name} <span style={{ opacity: 0.7 }}>· {c.op}</span>
                </button>
              );
            })}
          </div>
          <p aria-live="polite" className="text-[15px] leading-snug text-xco-ink">{current.hint}</p>
          <p className={`${MONO} text-[12px] text-xco-ink-muted`}>
            Held to: no face · character from motion only · at rest it is always the exact logo x · one x on the page
            {reduce ? " · reduced motion is on, so it moves without travelling" : ""}
          </p>
        </div>
      </div>
    </>
  );
}
