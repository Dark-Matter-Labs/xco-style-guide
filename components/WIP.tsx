import { SYSTEM_VERSION } from "@/lib/design-tokens";

type WIPVariant =
  | "draft"
  | "wip"
  | "version"
  | "unverified"
  | "inference"
  | "speculation";

interface WIPProps {
  variant?: WIPVariant;
  label?: string;
  className?: string;
}

export function WIP({ variant = "wip", label, className = "" }: WIPProps) {
  // "version" resolves to the single system version — never hardcode a number.
  const text = variant === "version" ? SYSTEM_VERSION : variant;
  const display = label ?? `[${text}]`;
  return (
    <span
      className={`font-mono text-xs bg-xco-dusk/15 text-xco-dusk px-1.5 py-0.5 inline-block ${className}`}
    >
      {display}
    </span>
  );
}
