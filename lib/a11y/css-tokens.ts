// Reads the colour tokens out of app/globals.css — the values the browser
// actually paints — in light and dark mode. Server / Node only (it reads a file).
//
// The contrast gate measures these rather than lib/design-tokens.ts, because
// the CSS is what ships; the TypeScript copy is checked against it separately
// (see checkTokenDrift). Measuring the copy would pass a pairing the page
// fails the moment the two disagreed.

import { readFileSync } from "node:fs";
import path from "node:path";

export type Mode = "light" | "dark";
export const modes: Mode[] = ["light", "dark"];

export type TokenMap = Map<string, string>;

const CSS_PATH = path.join(process.cwd(), "app/globals.css");

/** The selector that switches to dark mode. */
const INVERSE_SELECTOR = /\.dark\b/;

interface Block {
  selector: string;
  decls: TokenMap;
}

function blocks(css: string): Block[] {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const out: Block[] = [];
  // Only flat blocks matter here: custom properties are declared at the top level.
  const re = /([^{}]+)\{([^{}]*)\}/g;
  for (const m of Array.from(clean.matchAll(re))) {
    const decls: TokenMap = new Map();
    for (const d of Array.from(m[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g))) decls.set(d[1], d[2].trim());
    if (decls.size) out.push({ selector: m[1].trim(), decls });
  }
  return out;
}

let cache: Record<Mode, TokenMap> | null = null;

/** Raw custom properties per mode, before var() resolution. */
export function readModes(css = readFileSync(CSS_PATH, "utf8")): Record<Mode, TokenMap> {
  if (cache) return cache;
  const light: TokenMap = new Map();
  const inverse: TokenMap = new Map();
  for (const b of blocks(css)) {
    const target = INVERSE_SELECTOR.test(b.selector) ? inverse : light;
    b.decls.forEach((v, k) => target.set(k, v));
  }
  const dark: TokenMap = new Map(light);
  inverse.forEach((v, k) => dark.set(k, v));
  cache = { light, dark };
  return cache;
}

/** Resolves var() chains to a literal. Throws on a missing or circular token. */
export function resolve(value: string, tokens: TokenMap, seen: string[] = []): string {
  return value.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)/g, (_, name: string, fallback?: string) => {
    if (seen.includes(name)) throw new Error(`Circular token: ${[...seen, name].join(" → ")}`);
    const raw = tokens.get(name) ?? fallback;
    if (raw === undefined) throw new Error(`Unknown token ${name}`);
    return resolve(raw, tokens, [...seen, name]);
  });
}

/** A token (by name, with or without the leading --) or a literal, resolved in a mode. */
export function colorIn(mode: Mode, tokenOrLiteral: string): string {
  const tokens = readModes()[mode];
  if (tokenOrLiteral.startsWith("#") || tokenOrLiteral.startsWith("rgb")) return tokenOrLiteral;
  const name = tokenOrLiteral.startsWith("--") ? tokenOrLiteral : `--${tokenOrLiteral}`;
  const raw = tokens.get(name);
  if (raw === undefined) throw new Error(`Unknown token ${name}`);
  return resolve(raw, tokens, [name]);
}

/** The colour behind a Tailwind `xco-*` colour utility, e.g. "xco-ink-muted". */
export function utilityColor(mode: Mode, utility: string): string | null {
  const name = `--color-${utility}`;
  return readModes()[mode].has(name) ? colorIn(mode, name) : null;
}
