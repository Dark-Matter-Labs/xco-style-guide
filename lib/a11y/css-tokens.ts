// Reads the colour tokens out of app/globals.css — the values the browser
// actually paints — for both registers. Server / Node only (it reads a file).
//
// The contrast gate measures these rather than lib/design-tokens.ts, because
// the CSS is what ships; the TypeScript copy is checked against it separately
// (see checkTokenDrift). Measuring the copy would pass a pairing the page
// fails the moment the two disagreed.

import { readFileSync } from "node:fs";
import path from "node:path";

export type Register = "paper" | "ink";
export const registers: Register[] = ["paper", "ink"];

export type TokenMap = Map<string, string>;

const CSS_PATH = path.join(process.cwd(), "app/globals.css");

/** The selector that switches to the ink register. */
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

let cache: Record<Register, TokenMap> | null = null;

/** Raw custom properties per register, before var() resolution. */
export function readRegisters(css = readFileSync(CSS_PATH, "utf8")): Record<Register, TokenMap> {
  if (cache) return cache;
  const paper: TokenMap = new Map();
  const inverse: TokenMap = new Map();
  for (const b of blocks(css)) {
    const target = INVERSE_SELECTOR.test(b.selector) ? inverse : paper;
    b.decls.forEach((v, k) => target.set(k, v));
  }
  const ink: TokenMap = new Map(paper);
  inverse.forEach((v, k) => ink.set(k, v));
  cache = { paper, ink };
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

/** A token (by name, with or without the leading --) or a literal, resolved in a register. */
export function colorIn(register: Register, tokenOrLiteral: string): string {
  const tokens = readRegisters()[register];
  if (tokenOrLiteral.startsWith("#") || tokenOrLiteral.startsWith("rgb")) return tokenOrLiteral;
  const name = tokenOrLiteral.startsWith("--") ? tokenOrLiteral : `--${tokenOrLiteral}`;
  const raw = tokens.get(name);
  if (raw === undefined) throw new Error(`Unknown token ${name}`);
  return resolve(raw, tokens, [name]);
}

/** The colour behind a Tailwind `xco-*` colour utility, e.g. "xco-ink-muted". */
export function utilityColor(register: Register, utility: string): string | null {
  const name = `--color-${utility}`;
  return readRegisters()[register].has(name) ? colorIn(register, name) : null;
}
