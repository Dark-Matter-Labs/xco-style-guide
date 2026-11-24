"use client";

import { useCallback, useState, type ReactNode } from "react";

// Form primitives shared by every generator: Untitled Sans labels (the
// font-mono utility is the label role), hairline inputs, native radios.

const label = "font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink";

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-2 pt-4 first:pt-0">
      <legend className={`${label} tracking-widest uppercase mb-2`}>{title}</legend>
      {children}
    </fieldset>
  );
}

export function RadioList<T extends string>({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: T;
  options: { id: T; label: string; hint?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-1">
      {options.map((o) => (
        <label key={o.id} className="flex items-start gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={o.id}
            checked={value === o.id}
            onChange={() => onChange(o.id)}
            className="accent-xco-dusk mt-1.5 shrink-0"
          />
          <span>
            <span className={`${label} block`}>{o.label}</span>
            {o.hint && <span className={`${label} block text-xco-ink-muted`}>{o.hint}</span>}
          </span>
        </label>
      ))}
    </div>
  );
}

export function TextField({
  label: text,
  value,
  onChange,
  hint,
  multiline,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  multiline?: boolean;
  rows?: number;
}) {
  const input =
    "w-full bg-transparent border-b border-xco-ink font-body text-[20px] leading-[26px] text-xco-ink py-1 transition-colors";
  return (
    <label className="block space-y-1">
      <span className={`${label} uppercase tracking-wider`}>{text}</span>
      {multiline ? (
        <textarea value={value} rows={rows} onChange={(e) => onChange(e.target.value)} className={`${input} resize-none`} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={input} />
      )}
      {hint && <p className={`${label} text-xco-ink-muted`}>{hint}</p>}
    </label>
  );
}

export function Button({
  children,
  onClick,
  disabled,
  pressed,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      className={`w-full min-h-11 text-left ${label} border border-xco-ink px-3 py-2 hover:bg-xco-ink/[0.04] transition-colors disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

/** A range input with its label, its current value on the right and an optional hint or end labels. */
export function Slider({
  label: text,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  display,
  hint,
  ends,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** The value as shown; defaults to the number itself. */
  display?: string;
  hint?: string;
  /** What the two ends mean, shown under the track: ["coarse", "fine"]. */
  ends?: [string, string];
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className={`${label} uppercase tracking-wider`}>{text}</span>
        <span className={`${label} text-xco-dusk-ink`}>{display ?? String(value)}</span>
      </div>
      <input
        type="range"
        aria-label={text}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-xco-dusk"
      />
      {ends && (
        <div className={`flex justify-between ${label} text-xco-ink-muted`}>
          <span>{ends[0]}</span>
          <span>{ends[1]}</span>
        </div>
      )}
      {hint && <p className={`${label} text-xco-ink-muted`}>{hint}</p>}
    </div>
  );
}

/** One choice from a few, as a row (or grid) of pressed and unpressed buttons. Put it in a Section, which names the group. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  columns,
}: {
  value: T;
  options: { id: T; label: string; hint?: string }[];
  onChange: (v: T) => void;
  /** Buttons per row; all on one row by default. */
  columns?: number;
}) {
  return (
    <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${columns ?? options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={`min-h-11 text-left ${label} px-2 py-2 border border-xco-ink transition-colors ${
            value === o.id ? "bg-xco-ink text-xco-paper" : "hover:bg-xco-ink/[0.04]"
          }`}
        >
          <span className="block">{o.label}</span>
          {o.hint && <span className="block opacity-80">{o.hint}</span>}
        </button>
      ))}
    </div>
  );
}

export function Checkbox({
  label: text,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="flex items-start gap-2 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-xco-dusk mt-1.5 shrink-0" />
      <span>
        <span className={`${label} block`}>{text}</span>
        {hint && <span className={`${label} block text-xco-ink-muted`}>{hint}</span>}
      </span>
    </label>
  );
}

export const labelClass = label;

/** Runs one export at a time and keeps a failure's message until the next try (show it with ExportError). */
export function useExport() {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const run = useCallback(async (id: string, task: () => void | Promise<void>) => {
    setBusy(id);
    setError(null);
    try {
      await task();
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "Export failed. Try again.");
    } finally {
      setBusy(null);
    }
  }, []);
  return { busy, error, run };
}

/** A failed export, said beside the export buttons. Always mounted, so a screen reader hears it arrive. */
export function ExportError({ error }: { error: string | null }) {
  return <p role="alert" className={`${label} text-xco-dusk-ink`}>{error}</p>;
}
