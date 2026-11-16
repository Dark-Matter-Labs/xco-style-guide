"use client";

// The x as operator: one x per page, four roles (Keeper, Framer, Crawler,
// Multiply). Spec: docs/superpowers/specs/2026-11-16-x-operator-design.md.
//
// The page draws its full logo, marking the x's two strokes data-logo-x. This
// component hides them once it draws its own x in a fixed, aria-hidden overlay,
// docked exactly where the logo's x belongs. One
// rAF loop resolves a role each frame (lib/x-operator.ts) and moves the x.
// Before it takes a new role the x always returns to a plain x: Framer folds,
// Multiply recombines, the Crawler's feet settle.
//
// Motion state lives in mutable locals inside the loop on purpose: re-rendering
// React 60 times a second for one glyph would be the wrong tool.

import { useEffect, useRef, useState, type RefObject } from "react";
import { logoGeometry as g } from "@/lib/logo";
import {
  ARMS,
  CAPTION_CLEAR,
  CRAWL_IDLE_MS,
  CRAWL_K,
  CRAWL_KEEP_OFF,
  CRAWL_MAX_SPEED,
  EXPAND_LINGER_MS,
  FRAME_LINGER_MS,
  FRAME_OPEN_WITHIN,
  FRAME_PAD,
  GENS,
  KEEPER_SETTLE_MS,
  MAX_LEAN,
  PAIRS,
  READING_LINE,
  STEP_MS,
  TIP,
  TRAIL_MS,
  clamp,
  cropMarksPath,
  dist,
  dockFromRect,
  ease,
  lerp,
  multiplyFillK,
  multiplyScales,
  resolveRole,
  tip,
  xPath,
  type Dock,
  type Role,
  type Vec,
} from "@/lib/x-operator";

type Body = Vec & { vx: number; vy: number };
type Foot = Vec & { fx: number; fy: number; tx: number; ty: number; t: number }; // t < 0: planted
type Rect = { x: number; y: number; w: number; h: number };

const f = (n: number) => n.toFixed(2);
const approach = (v: number, to: number, rate: number, dt: number) => v + (to - v) * (1 - Math.exp(-rate * dt));

// Spring stiffness and damping per role. Keeper is the slowest and most hesitant.
const SPRING: Record<Exclude<Role, "crawler">, [number, number]> = {
  home: [120, 18],
  keeper: [80, 14],
  framer: [190, 24],
  multiply: [110, 19],
};

function spring(b: Body, t: Vec, dt: number, [stiff, damp]: [number, number]) {
  b.vx += (stiff * (t.x - b.x) - damp * b.vx) * dt;
  b.vy += (stiff * (t.y - b.y) - damp * b.vy) * dt;
  b.x += b.vx * dt;
  b.y += b.vy * dt;
}

function pageRect(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height };
}

const centre = (r: Rect): Vec => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });

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

export function useReducedMotion() {
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

interface XOperatorProps {
  /** The page's logo SVG, cropped to inkBounds, with the x's two strokes marked data-logo-x. */
  logoRef: RefObject<SVGSVGElement>;
  /** The Crawler only walks while invited. */
  crawlerInvited: boolean;
}

export function XOperator({ logoRef, crawlerInvited }: XOperatorProps) {
  const gRef = useRef<SVGGElement>(null);
  const mainRef = useRef<SVGPathElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const genRefs = useRef<(SVGPathElement | null)[]>([]);
  const reduce = useReducedMotion();
  // The loop reads these each frame, so prop changes never restart it.
  const invitedRef = useRef(crawlerInvited);
  const reduceRef = useRef(reduce);
  const activityRef = useRef(-Infinity); // last pointer move, tap, keyboard focus or invitation
  useEffect(() => {
    invitedRef.current = crawlerInvited;
    // An invitation is activity, so a keyboard reader pressing "Let it walk" sees it start.
    if (crawlerInvited) activityRef.current = performance.now();
  }, [crawlerInvited]);
  useEffect(() => { reduceRef.current = reduce; }, [reduce]);

  useEffect(() => {
    const readDock = (): Dock => {
      const svg = logoRef.current;
      if (!svg) return { x: 0, y: 0, k: 0.35 };
      return dockFromRect(svg.getBoundingClientRect(), { x: scrollX, y: scrollY });
    };
    const main = document.getElementById("main");
    const stage = document.querySelector("[data-expand-stage]");
    const blocks = Array.from(document.querySelectorAll<HTMLElement>("[data-keep]"));

    // ── What the reader is doing (listeners only record) ──
    let frameEl: Element | null = null;
    let expandOn = false;
    let frameLeave = 0;
    let expandLeave = 0;
    const ptr = { x: 0, y: 0, inside: false };
    let lastInput: "pointer" | "focus" = "pointer";
    let focusEl: Element | null = null;

    const onOver = (e: Event) => {
      const el = e.target as Element | null;
      const ex = el?.closest?.("[data-expand]") ?? null;
      // An element that expands is Multiply's alone: never also a frame target, even while its linger runs out.
      const fr = ex && stage ? null : el?.closest?.("[data-frame]") ?? null;
      if (fr) { clearTimeout(frameLeave); frameEl = fr; }
      else if (frameEl) { clearTimeout(frameLeave); frameLeave = window.setTimeout(() => { frameEl = null; }, FRAME_LINGER_MS); }
      if (ex) { clearTimeout(expandLeave); expandOn = true; }
      else if (expandOn) { clearTimeout(expandLeave); expandLeave = window.setTimeout(() => { expandOn = false; }, EXPAND_LINGER_MS); }
    };
    const onFocus = (e: FocusEvent) => {
      // Only keyboard focus counts. A click or tap also focuses (often main#main, tabIndex -1),
      // and treating that as focus would read as leaving whatever the pointer is on.
      const el = e.target as Element | null;
      if (!el?.matches?.(":focus-visible")) return;
      onOver(e);
      focusEl = el;
      lastInput = "focus";
      activityRef.current = performance.now();
    };
    const onPointer = (e: PointerEvent) => {
      // pointermove for mice; pointerdown so a tap sets the position too.
      Object.assign(ptr, { x: e.clientX + scrollX, y: e.clientY + scrollY, inside: true });
      lastInput = "pointer";
      activityRef.current = performance.now();
    };
    // A finger lifting fires pointerleave on <html>; only a mouse leaving the window means "gone".
    const onLeave = (e: PointerEvent) => { if (e.pointerType === "mouse") ptr.inside = false; };
    document.addEventListener("pointerover", onOver);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("pointermove", onPointer);
    document.addEventListener("pointerdown", onPointer);
    document.documentElement.addEventListener("pointerleave", onLeave);

    // ── The one x ──
    const d0 = readDock();
    const body: Body = { x: d0.x, y: d0.y, vx: 0, vy: 0 };
    let k = d0.k;
    let role: Role = "home";
    let locked = true;          // rigidly attached to its target (the sticky logo, a passage)
    let open = 0;               // Framer: 0 plain x, 1 crop marks
    const half: Vec = { x: TIP.x * k, y: TIP.y * k };
    let framed: Element | null = null; // the element the crop marks belong to
    let growth = 0;             // Multiply: 0..GENS generations
    let bigFromMultiply = false; // keep the logo's stroke while shrinking back from Multiply
    let kBlock = -1;            // Keeper: the passage it sits beside
    let kPending = -1;
    let kSince = 0;
    const feet: Foot[] = ARMS.map(() => ({ x: 0, y: 0, fx: 0, fy: 0, tx: 0, ty: 0, t: -1 }));
    const trail: (Vec & { at: number })[] = [];
    // The page's logo draws its own x (marked data-logo-x) so it reads xCO before this runs, or without JS.
    // It is hidden only once the overlay x is drawn over it, and shown again on unmount.
    const logoX = Array.from(logoRef.current?.querySelectorAll<SVGElement>("[data-logo-x]") ?? []);
    let logoXHidden = false;

    const rest =(i: number): Vec => { const t = tip(i, k); return { x: body.x + t.x, y: body.y + t.y }; };
    const plantFeet = () => feet.forEach((ft, i) => Object.assign(ft, rest(i), { t: -1 }));
    const feetPlain = () => feet.every((ft, i) => ft.t < 0 && dist(ft, rest(i)) < 0.3);

    const gutter = () => {
      if (!main) return 18;
      const left = main.getBoundingClientRect().left + scrollX + parseFloat(getComputedStyle(main).paddingLeft);
      return Math.max(left - 44, 18);
    };
    const keeperAnchor = (el: HTMLElement): Vec => {
      const r = pageRect(el);
      const lh = parseFloat(getComputedStyle(el).lineHeight) || 28;
      return { x: gutter(), y: r.y + Math.min(lh, r.h) / 2 };
    };

    /** Advance stepping feet; when all are planted, the diagonal pair furthest from home steps next. */
    const stepFeet = (dt: number, vel: Vec, moving: boolean) => {
      for (const ft of feet) {
        if (ft.t < 0) continue;
        ft.t = Math.min(1, ft.t + dt / (STEP_MS / 1000));
        const e = ease(ft.t);
        ft.x = lerp(ft.fx, ft.tx, e);
        ft.y = lerp(ft.fy, ft.ty, e);
        if (ft.t >= 1) ft.t = -1;
      }
      if (feet.some((ft) => ft.t >= 0)) return;
      const err = (p: readonly number[]) => Math.max(...p.map((i) => dist(feet[i], rest(i))));
      const pair = err(PAIRS[0]) >= err(PAIRS[1]) ? PAIRS[0] : PAIRS[1];
      const reach = Math.hypot(TIP.x, TIP.y) * k;
      if (err(pair) <= (moving ? reach * 0.45 : 0.3)) return;
      const lead = moving ? 0.1 : 0;
      for (const i of pair) {
        const r = rest(i);
        Object.assign(feet[i], { fx: feet[i].x, fy: feet[i].y, tx: r.x + vel.x * lead, ty: r.y + vel.y * lead, t: 0 });
      }
    };

    const stop = loop((dt, now) => {
      const dock = readDock();
      const reduceMotion = reduceRef.current;

      // Keeper: the last passage above the reading line, once the reader has settled on it.
      const line = innerHeight * READING_LINE;
      let reading = -1;
      blocks.forEach((el, i) => { if (el.getBoundingClientRect().top < line) reading = i; });
      if (reading !== kPending) { kPending = reading; kSince = now; }
      if (kPending !== kBlock && (reduceMotion || now - kSince > KEEPER_SETTLE_MS)) {
        kBlock = kPending;
        if (role === "keeper") locked = false;
      }

      const crawlerIdle = now - activityRef.current > CRAWL_IDLE_MS || (lastInput === "pointer" && !ptr.inside);
      const want = resolveRole({
        scrollY,
        viewportWidth: innerWidth,
        reduceMotion,
        hasKeepBlocks: blocks.length > 0,
        hasExpandStage: !!stage,
        overExpand: expandOn,
        overFrame: !!frameEl,
        crawlerInvited: invitedRef.current,
        crawlerIdle,
      });

      // Handover: change role only from a plain x.
      const plain = open < 0.01 && growth < 0.01 && (role !== "crawler" || feetPlain());
      if (want !== role && (plain || reduceMotion)) {
        if (want === "crawler") plantFeet();
        role = want;
        locked = false;
      }
      const folding = want !== role;

      // ── Targets for this role ──
      let target: Vec = { x: body.x, y: body.y }; // folding: hold still
      let wantK = k;
      let wantOpen = 0;
      const wantHalf: Vec = { x: TIP.x * dock.k, y: TIP.y * dock.k };
      let wantGrowth = 0;
      if (!folding) {
        if (role === "home") { target = dock; wantK = dock.k; }
        if (role === "keeper") { target = kBlock >= 0 ? keeperAnchor(blocks[kBlock]) : dock; wantK = dock.k; }
        if (role === "framer" && frameEl) {
          wantK = dock.k;
          // A new target: fold first, then fly there as a plain x.
          if (frameEl !== framed && open > 0.01) target = { x: body.x, y: body.y };
          else {
            framed = frameEl;
            const r = pageRect(frameEl);
            target = centre(r);
            if (dist(body, target) < FRAME_OPEN_WITHIN) {
              wantOpen = 1;
              wantHalf.x = r.w / 2 + FRAME_PAD.x;
              wantHalf.y = r.h / 2 + FRAME_PAD.y;
            }
          }
        }
        if (role === "multiply" && stage) {
          const r = pageRect(stage);
          target = { x: r.x + r.w / 2, y: r.y + (r.h - CAPTION_CLEAR) / 2 };
          wantK = multiplyFillK(r);
          bigFromMultiply = true;
          if (dist(body, target) < 6) wantGrowth = GENS;
        }
      }

      // ── Move ──
      if (reduceMotion) {
        Object.assign(body, { x: target.x, y: target.y, vx: 0, vy: 0 });
        k = wantK; open = wantOpen; half.x = wantHalf.x; half.y = wantHalf.y; growth = wantGrowth;
        plantFeet();
      } else if (role === "crawler") {
        const vel = { x: 0, y: 0 };
        if (!folding) {
          // A focused element: aim near its top-left, so a large one (a whole section) does not send the x off-screen.
          const fr = lastInput === "focus" && focusEl ? pageRect(focusEl) : null;
          const goal = fr ? { x: fr.x + Math.min(fr.w / 2, 48), y: fr.y + Math.min(fr.h / 2, 24) } : ptr;
          const dx = goal.x - body.x;
          const dy = goal.y - body.y;
          const d = Math.hypot(dx, dy);
          const speed = d > CRAWL_KEEP_OFF ? Math.min(CRAWL_MAX_SPEED, (d - CRAWL_KEEP_OFF) * 4) : 0;
          if (d) { vel.x = (dx / d) * speed; vel.y = (dy / d) * speed; }
          body.x += vel.x * dt;
          body.y += vel.y * dt;
          k = lerp(dock.k, Math.max(dock.k, CRAWL_K), clamp(dist(body, dock) / 90, 0, 1));
          const last = trail[trail.length - 1];
          if (!last || dist(body, last) > 3) trail.push({ x: body.x, y: body.y, at: now });
        }
        Object.assign(body, { vx: vel.x, vy: vel.y });
        stepFeet(dt, vel, Math.hypot(vel.x, vel.y) > 4);
      } else {
        if (locked) Object.assign(body, { x: target.x, y: target.y, vx: 0, vy: 0 });
        else {
          spring(body, target, dt, SPRING[role]);
          const settled = dist(body, target) < 0.5 && Math.hypot(body.vx, body.vy) < 4;
          if (!folding && settled && (role === "home" || role === "keeper")) locked = true;
        }
        k = approach(k, wantK, role === "multiply" ? 5 : 8, dt);
        open = approach(open, wantOpen, 11, dt);
        half.x = approach(half.x, wantHalf.x, 11, dt);
        half.y = approach(half.y, wantHalf.y, 11, dt);
        growth = wantGrowth > growth ? Math.min(wantGrowth, growth + dt * 1.6) : Math.max(wantGrowth, growth - dt * 3);
      }
      if (open < 0.001) open = 0;
      if (bigFromMultiply && role !== "multiply" && Math.abs(k - dock.k) < 0.002) bigFromMultiply = false;
      while (trail.length && now - trail[0].at > TRAIL_MS) trail.shift();

      // ── Draw ──
      const lean = role === "keeper" || role === "home" ? clamp(body.vy * 0.05, -MAX_LEAN, MAX_LEAN) : 0;
      const strokeK = bigFromMultiply ? Math.min(k, dock.k) : k;
      let d: string;
      let stroke = g.stroke * strokeK;
      if (role === "crawler") {
        d = feet.map((ft) => {
          const lift = ft.t >= 0 ? Math.sin(Math.PI * ft.t) * 0.22 : 0; // a lifted foot reads as a shorter arm
          return `M${f(body.x)} ${f(body.y)}L${f(lerp(ft.x, body.x, lift))} ${f(lerp(ft.y, body.y, lift))}`;
        }).join("");
      } else if (open > 0) {
        d = cropMarksPath(body, k, half, open);
        stroke = lerp(g.stroke * k, 2, ease(open));
      } else {
        d = xPath(body, k, lean);
      }
      mainRef.current?.setAttribute("d", d);
      mainRef.current?.setAttribute("stroke-width", f(stroke));

      // Multiply: each generation grows out of its parent's arm tips at half its size.
      const scale = multiplyScales(growth);
      const gens = Array.from({ length: GENS + 1 }, () => "");
      const grow = (c: Vec, n: number) => {
        if (n > 0) gens[n] += xPath(c, k * scale[n]);
        if (n === GENS || scale[n + 1] <= 0) return;
        ARMS.forEach((_, i) => { const t = tip(i, k * scale[n]); grow({ x: c.x + t.x, y: c.y + t.y }, n + 1); });
      };
      if (growth > 0) grow(body, 0);
      genRefs.current.forEach((p, idx) => {
        const n = idx + 1;
        p?.setAttribute("d", growth > 0 && scale[n] > 0 ? gens[n] : "");
        p?.setAttribute("stroke-width", f(g.stroke * dock.k * Math.sqrt(scale[n])));
      });
      trailRef.current?.setAttribute("d", trail.map((p, i) => `${i ? "L" : "M"}${f(p.x)} ${f(p.y)}`).join(""));
      gRef.current?.setAttribute("transform", `translate(${-scrollX} ${-scrollY})`);
      if (!logoXHidden) {
        logoX.forEach((p) => { p.style.visibility = "hidden"; });
        logoXHidden = true;
      }
    });

    return () => {
      stop();
      logoX.forEach((p) => { p.style.visibility = ""; });
      clearTimeout(frameLeave);
      clearTimeout(expandLeave);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerdown", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [logoRef]);

  return (
    <svg aria-hidden className="pointer-events-none fixed inset-0 z-40 h-full w-full overflow-visible">
      <g ref={gRef} fill="none" strokeLinecap="butt" strokeLinejoin="miter" style={{ stroke: "var(--xco-dusk)" }}>
        <path ref={trailRef} strokeWidth={1.5} strokeOpacity={0.55} strokeDasharray="2 5" />
        {Array.from({ length: GENS }, (_, i) => (
          <path key={i} ref={(el) => { genRefs.current[i] = el; }} />
        ))}
        <path ref={mainRef} />
      </g>
    </svg>
  );
}
