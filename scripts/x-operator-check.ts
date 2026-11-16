// Assert-based check for the x operator's pure parts. Run: npm run x:check
//
// Covers the two things the motion code cannot get wrong without the brand
// noticing: which role wins when two apply, and that the x at rest is
// exactly the logotype's x.

import { strict as assert } from "node:assert";
import { inkBounds, xPaths } from "@/lib/logo";
import {
  INK_H,
  TIP,
  CAPTION_CLEAR,
  cropMarksPath,
  dockFromRect,
  multiplyFillK,
  multiplyScales,
  resolveRole,
  xPath,
  type RoleInputs,
  type Vec,
} from "@/lib/x-operator";

const eq: typeof assert.equal = assert.equal;
const near = (a: number, b: number, msg: string) => assert.ok(Math.abs(a - b) < 0.01, `${msg}: ${a} vs ${b}`);

/** Every M/L coordinate pair in a path string, in order. */
function points(d: string): Vec[] {
  return Array.from(d.matchAll(/[ML]\s*(-?[\d.]+)[ ,](-?[\d.]+)/g), (m) => ({ x: Number(m[1]), y: Number(m[2]) }));
}

// ── Role priority ────────────────────────────────────────────────────
const B: RoleInputs = {
  scrollY: 0,
  viewportWidth: 1280,
  reduceMotion: false,
  hasKeepBlocks: true,
  hasExpandStage: true,
  overExpand: false,
  overFrame: false,
  crawlerInvited: false,
  crawlerIdle: false,
};

eq(resolveRole(B), "home");
eq(resolveRole({ ...B, scrollY: 81 }), "keeper");
eq(resolveRole({ ...B, scrollY: 80 }), "home", "threshold is past 80");
eq(resolveRole({ ...B, scrollY: 500, viewportWidth: 639 }), "home", "narrow: Keeper stays docked");
eq(resolveRole({ ...B, scrollY: 500, hasKeepBlocks: false }), "home");
eq(resolveRole({ ...B, overFrame: true }), "framer");
eq(resolveRole({ ...B, overExpand: true, overFrame: true }), "multiply", "hero word marked for both: Multiply wins");
eq(resolveRole({ ...B, overExpand: true, hasExpandStage: false }), "home");
eq(resolveRole({ ...B, overExpand: true, overFrame: true, hasExpandStage: false }), "framer");
eq(resolveRole({ ...B, crawlerInvited: true }), "crawler");
eq(resolveRole({ ...B, crawlerInvited: true, overFrame: true }), "framer");
eq(resolveRole({ ...B, crawlerInvited: true, reduceMotion: true }), "home");
eq(resolveRole({ ...B, crawlerInvited: true, crawlerIdle: true, scrollY: 500 }), "keeper");

// ── At rest, the overlay x is exactly the logo's x ──────────────────
// A 40 px-tall logo at (24, 16), page scrolled by (0, 500).
const k = 40 / INK_H;
const dock = dockFromRect({ left: 24, top: 16, height: 40 }, { x: 0, y: 500 });
near(dock.k, k, "dock scale");
const toPage = (p: Vec): Vec => ({ x: 24 + (p.x - inkBounds.left) * k, y: 16 + 500 + (p.y - inkBounds.top) * k });
// The logo's two strokes, as four arm tips (both ends of each diagonal).
const logoTips = xPaths().flatMap((d) => points(d)).map(toPage);
// The overlay draws four arms from the centre: every second point is a tip.
const overlayTips = points(xPath(dock, dock.k)).filter((_, i) => i % 2 === 1);
for (const t of overlayTips) {
  assert.ok(logoTips.some((l) => Math.abs(l.x - t.x) < 0.01 && Math.abs(l.y - t.y) < 0.01), `overlay tip ${t.x},${t.y} is a logo endpoint`);
}
eq(overlayTips.length, 4);

// ── Crop marks ───────────────────────────────────────────────────────
const c = { x: 100, y: 100 };
const half = { x: 60, y: 20 };
const folded = points(cropMarksPath(c, 1, half, 0));
eq(folded.length, 12, "four arms of three points");
for (let a = 0; a < 4; a++) {
  const [p0, p1, p2] = folded.slice(a * 3, a * 3 + 3);
  near(p0.x, c.x, "folded arm starts at the centre");
  near(p0.y, c.y, "folded arm starts at the centre");
  near((p2.x - p0.x) * (p1.y - p0.y) - (p2.y - p0.y) * (p1.x - p0.x), 0, "folded arm is straight");
}
const open = points(cropMarksPath(c, 1, half, 1));
const corners = [1, 4, 7, 10].map((i) => open[i]);
for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
  assert.ok(corners.some((p) => Math.abs(p.x - (c.x + sx * half.x)) < 0.01 && Math.abs(p.y - (c.y + sy * half.y)) < 0.01), `corner at ${sx},${sy}`);
}

// ── Multiply ─────────────────────────────────────────────────────────
assert.deepEqual(multiplyScales(0), [1, 0, 0, 0]);
assert.deepEqual(multiplyScales(3), [1, 0.5, 0.25, 0.125]);
near(multiplyFillK({ w: 280, h: 280 }), (280 - CAPTION_CLEAR) / (2 * 1.875 * TIP.y * 1.1), "Multiply fills the stage, caption clear");

console.log("x-operator: all checks passed");
