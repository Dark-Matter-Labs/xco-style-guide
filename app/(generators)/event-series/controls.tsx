"use client";

import type { ReactNode } from "react";

// Form primitives for the generator, in the instruments' existing idiom
// (see social-card): mono labels, hairline inputs, native radios.

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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  multiline?: boolean;
}) {
  const input =
    "w-full bg-transparent border-b border-xco-ink font-body text-[20px] leading-[26px] text-xco-ink py-1 focus:outline-none focus-visible:border-xco-dusk transition-colors";
  return (
    <label className="block space-y-1">
      <span className={`${label} uppercase tracking-wider`}>{text}</span>
      {multiline ? (
        <textarea value={value} rows={2} onChange={(e) => onChange(e.target.value)} className={`${input} resize-none`} />
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
      className={`w-full min-h-11 text-left ${label} border border-xco-ink px-3 py-2 hover:bg-xco-ink/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-xco-dusk transition-colors disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

export const labelClass = label;
