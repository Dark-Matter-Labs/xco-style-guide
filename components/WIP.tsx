type WIPVariant =
  | "draft"
  | "wip"
  | "v0.1"
  | "unverified"
  | "inference"
  | "speculation";

interface WIPProps {
  variant?: WIPVariant;
  label?: string;
  className?: string;
}

export function WIP({ variant = "wip", label, className = "" }: WIPProps) {
  const display = label ?? `[${variant}]`;
  return (
    <span
      className={`font-mono text-xs bg-xco-flag/15 text-xco-flag px-1.5 py-0.5 inline-block ${className}`}
    >
      {display}
    </span>
  );
}
