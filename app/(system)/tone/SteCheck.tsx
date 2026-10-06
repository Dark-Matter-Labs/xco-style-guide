"use client";

import { useId, useState } from "react";
import { steLint, steModes, type SteMode } from "@/lib/ste";

// The plain-register check inside the linter. The writer picks the licence —
// the mode follows it — because the same paragraph is fine as an encounter
// and a problem as an instruction. Hedges are never flagged.

const MONO = "font-mono font-medium text-[0.9375rem] leading-[1.6]";

export function SteCheck({ text }: { text: string }) {
  const [mode, setMode] = useState<SteMode>("flavoured");
  const name = useId();
  const findings = steLint(text, mode);
  const rules = findings.filter((f) => f.level === "rule");
  const advisory = findings.filter((f) => f.level === "advisory");
  const current = steModes.find((m) => m.mode === mode)!;

  return (
    <div className="space-y-3 pt-2" style={{ borderTop: "1px solid var(--border-default)" }}>
      <p className={`${MONO} text-xco-ink tracking-widest uppercase pt-4`}>Plain register — STE</p>
      <fieldset className="flex flex-wrap gap-x-6 gap-y-2">
        <legend className={`${MONO} text-xco-ink-muted mb-2`}>Which licence is this text?</legend>
        {steModes.map((m) => (
          <label key={m.mode} className={`${MONO} text-xco-ink flex items-center gap-2 cursor-pointer min-h-[44px]`}>
            <input
              type="radio"
              name={name}
              value={m.mode}
              checked={mode === m.mode}
              onChange={() => setMode(m.mode)}
              className="accent-[var(--xco-ink)]"
            />
            {m.licence} → {m.label}
          </label>
        ))}
      </fieldset>
      <p className={`${MONO} text-xco-ink-muted`}>{current.rule}</p>

      {mode === "exempt" ? (
        <p className={`${MONO} text-xco-ink`}>— Encounter writing is exempt. The voice principles and the writing practices still apply.</p>
      ) : findings.length === 0 ? (
        <p className={`${MONO} text-xco-ink`}>✓ No structural problems found. Hedges are never flagged — they carry your confidence.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className={`${MONO} text-xco-ink`}>Rules ({rules.length})</p>
            {rules.length === 0 && <p className={`${MONO} text-xco-ink-muted`}>— none</p>}
            {rules.map((f, i) => (
              <p key={i} className={`${MONO} text-xco-ink-muted`}>
                — [{f.rule}] “{f.match}” · {f.message}
              </p>
            ))}
          </div>
          <div className="space-y-1">
            <p className={`${MONO} text-xco-ink`}>Advisory ({advisory.length})</p>
            {advisory.length === 0 && <p className={`${MONO} text-xco-ink-muted`}>— none</p>}
            {advisory.map((f, i) => (
              <p key={i} className={`${MONO} text-xco-ink-muted`}>
                — [{f.rule}] “{f.match}” · {f.message}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
