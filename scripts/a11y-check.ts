// The static accessibility gate. Run: npm run a11y
//
// Runs before every build (prebuild), so a failing contrast pairing, a text
// utility that cannot be read, a removed focus ring or a drifted token fails
// the build — on a laptop and on Vercel alike. The checks themselves live in
// lib/a11y/gate.ts; this file only reports.
//
//   --verbose   list passing checks too

import { runGate, type Finding } from "@/lib/a11y/gate";

const verbose = process.argv.includes("--verbose");

let findings: Finding[];
try {
  findings = runGate();
} catch (err) {
  // A token that cannot be resolved is a failure, not a skip.
  console.error(`a11y gate could not run: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}

// Every check is listed even when it has nothing to report, so a clean run
// shows what was checked rather than only what failed.
const CHECKS = ["pairing", "token-drift", "text-utility", "faded-text", "domain-text", "focus", "event-series", "group-mark"];
const groups = new Map<string, Finding[]>(CHECKS.map((c) => [c, []]));
for (const f of findings) groups.set(f.check, [...(groups.get(f.check) ?? []), f]);

let failed = 0;
for (const [check, list] of Array.from(groups)) {
  const bad = list.filter((f) => !f.ok);
  failed += bad.length;
  const summary = list.length ? `${list.length - bad.length}/${list.length} pass` : "no issues";
  console.log(`${bad.length ? "✗" : "✓"} ${check.padEnd(14)} ${summary}`);
  for (const f of verbose ? list : bad) {
    const where = f.file ? `  ${f.file}${f.line ? `:${f.line}` : ""}` : "";
    console.log(`    ${f.ok ? "·" : "✗"} ${f.label} — ${f.detail}${where}`);
  }
}

if (failed) {
  console.error(`\n${failed} accessibility check(s) failed. The rules: lib/a11y/rules.ts · /accessibility`);
  process.exitCode = 1;
} else {
  console.log(`\naccessibility gate: all ${findings.length} checks pass`);
}
