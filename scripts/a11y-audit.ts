// The browser accessibility audit. Run: npm run build && npm run a11y:audit
//
// Serves the production build, then opens every page in Chromium in both
// registers and runs axe-core (WCAG 2.0–2.2 A/AA plus best practice) — the
// checks a static scan cannot make: rendered contrast, names, labels,
// landmarks, heading order, target size. A second pass emulates
// prefers-reduced-motion and fails any page where CSS motion still runs.
//
// Runs in CI on every pull request (.github/workflows/accessibility.yml).
//
//   BASE_URL=http://localhost:3000   audit a server that is already running
//   --only=/colour,/logo             audit a subset of pages
//   --json=path                      also write the full report as JSON

import { spawn, type ChildProcess } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium, type Browser, type BrowserContext } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const ROOT = process.cwd();
const PORT = 3107;
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];
const REGISTERS = ["paper", "ink"] as const;
type Register = (typeof REGISTERS)[number];

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];

// ── Pages ────────────────────────────────────────────────────────────

/** Every page route in the build — not API routes, not generated files. */
function routes(): string[] {
  const manifest = path.join(ROOT, ".next/app-path-routes-manifest.json");
  if (!existsSync(manifest)) throw new Error("No production build found. Run `npm run build` first.");
  const all = Object.values(JSON.parse(readFileSync(manifest, "utf8")) as Record<string, string>);
  const pages = all.filter((r) => !r.startsWith("/api") && !r.startsWith("/_") && !/\.\w+$/.test(r));
  const only = arg("only")?.split(",");
  return Array.from(new Set(only ? pages.filter((p) => only.includes(p)) : pages)).sort();
}

// ── Server ───────────────────────────────────────────────────────────

async function serve(): Promise<{ base: string; stop: () => void }> {
  if (process.env.BASE_URL) return { base: process.env.BASE_URL.replace(/\/$/, ""), stop: () => {} };
  // A server already on the port would be audited instead of this build — and
  // one left over from an earlier build serves missing chunks as error pages.
  const taken = await fetch(`http://localhost:${PORT}`).then(() => true, () => false);
  if (taken) throw new Error(`Port ${PORT} is already in use. Stop that server, or set BASE_URL to audit it on purpose.`);
  const bin = path.join(ROOT, "node_modules/.bin/next");
  const child: ChildProcess = spawn(bin, ["start", "-p", String(PORT)], { stdio: "ignore" });
  const base = `http://localhost:${PORT}`;
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(base)).ok) return { base, stop: () => child.kill() };
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  child.kill();
  throw new Error(`next start did not come up on ${base}`);
}

// ── Checks ───────────────────────────────────────────────────────────

interface Violation {
  rule: string;
  impact: string;
  help: string;
  url: string;
  page: string;
  register: Register | "reduced-motion";
  targets: string[];
}

async function contextFor(browser: Browser, register: Register, reducedMotion: boolean): Promise<BrowserContext> {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: reducedMotion ? "reduce" : "no-preference",
  });
  // The site reads its register from localStorage before first paint.
  await ctx.addInitScript((dark: boolean) => {
    try {
      if (dark) localStorage.setItem("xco-theme", "dark");
      else localStorage.removeItem("xco-theme");
    } catch {
      /* storage blocked — the page falls back to paper */
    }
  }, register === "ink");
  return ctx;
}

async function axePass(browser: Browser, base: string, page: string, register: Register): Promise<Violation[]> {
  const ctx = await contextFor(browser, register, true);
  const p = await ctx.newPage();
  try {
    await p.goto(`${base}${page}`, { waitUntil: "networkidle" });
    await p.evaluate(() => document.fonts.ready);
    const result = await new AxeBuilder({ page: p }).withTags(TAGS).analyze();
    return result.violations.map((v) => ({
      rule: v.id,
      impact: v.impact ?? "unknown",
      help: v.help,
      url: v.helpUrl,
      page,
      register,
      targets: v.nodes.map((n) => n.target.join(" ")),
    }));
  } finally {
    await ctx.close();
  }
}

/** With reduced motion requested, nothing in CSS may still be animating. */
async function motionPass(browser: Browser, base: string, page: string): Promise<Violation[]> {
  const ctx = await contextFor(browser, "paper", true);
  const p = await ctx.newPage();
  try {
    await p.goto(`${base}${page}`, { waitUntil: "networkidle" });
    await p.waitForTimeout(300);
    const running = await p.evaluate(() =>
      document
        .getAnimations()
        .filter((a) => a.playState === "running")
        .map((a) => {
          const el = (a.effect as KeyframeEffect | null)?.target as Element | null;
          const name = (a as CSSAnimation).animationName ?? (a as CSSTransition).transitionProperty ?? "animation";
          return `${el ? el.tagName.toLowerCase() + (el.id ? `#${el.id}` : "") + (el.classList.length ? `.${Array.from(el.classList).slice(0, 2).join(".")}` : "") : "?"} (${name})`;
        }),
    );
    return running.length
      ? [{ rule: "reduced-motion", impact: "serious", help: "CSS motion runs under prefers-reduced-motion: reduce", url: "https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions", page, register: "reduced-motion", targets: running }]
      : [];
  } finally {
    await ctx.close();
  }
}

// ── Run ──────────────────────────────────────────────────────────────

async function main() {
  const pages = routes();
  const { base, stop } = await serve();
  const browser = await chromium.launch();
  const violations: Violation[] = [];
  try {
    for (const page of pages) {
      const found: Violation[] = [];
      for (const register of REGISTERS) found.push(...(await axePass(browser, base, page, register)));
      found.push(...(await motionPass(browser, base, page)));
      violations.push(...found);
      const n = found.reduce((s, v) => s + v.targets.length, 0);
      console.log(`${n ? "✗" : "✓"} ${page.padEnd(28)} ${n ? `${n} issue(s): ${Array.from(new Set(found.map((v) => v.rule))).join(", ")}` : "clean in both registers"}`);
    }
  } finally {
    await browser.close();
    stop();
  }

  const json = arg("json");
  if (json) writeFileSync(json, JSON.stringify(violations, null, 2));

  if (!violations.length) {
    console.log(`\naccessibility audit: ${pages.length} pages × ${REGISTERS.length} registers, no violations`);
    return;
  }

  // Grouped by rule, so one systemic cause reads as one line, not forty.
  const byRule = new Map<string, Violation[]>();
  for (const v of violations) byRule.set(v.rule, [...(byRule.get(v.rule) ?? []), v]);
  console.error(`\n${violations.length} violation group(s) across ${new Set(violations.map((v) => v.page)).size} page(s):`);
  for (const [rule, list] of Array.from(byRule)) {
    console.error(`\n  ${rule} [${list[0].impact}] — ${list[0].help}`);
    console.error(`  ${list[0].url}`);
    for (const v of list.slice(0, 12)) console.error(`    ${v.page} [${v.register}]: ${v.targets.slice(0, 3).join(" | ")}${v.targets.length > 3 ? ` (+${v.targets.length - 3})` : ""}`);
    if (list.length > 12) console.error(`    … and ${list.length - 12} more`);
  }
  process.exitCode = 1;
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
