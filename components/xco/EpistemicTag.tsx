export type EpistemicStatus = "evidence" | "inference" | "assumption";

const STATUS_META: Record<EpistemicStatus, {
  label: string;
  borderStyle: string;
  description: string;
}> = {
  evidence:   { label: "evidence",   borderStyle: "solid",  description: "Measured or directly observed" },
  inference:  { label: "inference",  borderStyle: "dotted", description: "Derived from evidence" },
  assumption: { label: "assumption", borderStyle: "dashed", description: "Working premise, not verified" },
};

interface EpistemicTagProps {
  status: EpistemicStatus;
  className?: string;
}

export function EpistemicTag({ status, className = "" }: EpistemicTagProps) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink-muted ${className}`}
      style={{ border: `1.5px ${meta.borderStyle} var(--xco-ink-muted)` }}
      title={meta.description}
    >
      {meta.label}
    </span>
  );
}
