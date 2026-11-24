import { uncertaintyMarkers, type UncertaintyMarker } from "@/lib/design-tokens";

export type EpistemicStatus = UncertaintyMarker;

// Firmest first: solid, dashed, dotted.
const BORDER: Record<EpistemicStatus, string> = {
  inference:  "solid",
  hypothesis: "dashed",
  hunch:      "dotted",
};

interface EpistemicTagProps {
  status: EpistemicStatus;
  className?: string;
}

export function EpistemicTag({ status, className = "" }: EpistemicTagProps) {
  const description = uncertaintyMarkers.find((m) => m.id === status)!.use;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink-muted ${className}`}
      style={{ border: `1.5px ${BORDER[status]} var(--xco-ink-muted)` }}
      title={description}
    >
      {status}
    </span>
  );
}
