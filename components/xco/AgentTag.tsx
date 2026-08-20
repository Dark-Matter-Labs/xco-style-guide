import { agentTypes } from "@/lib/polyphonic";

const BY_ID = Object.fromEntries(agentTypes.map((a) => [a.id, a]));

interface AgentTagProps {
  type: (typeof agentTypes)[number]["id"];
  className?: string;
}

// Typed opacity. "unknown", "contested" and "withheld" are legitimate epistemic
// conditions and render as neutral annotations. "erased" is a defect, so it
// renders struck through — the treatment marks it as something to fix, never a
// label to ship.
export function AgentTag({ type, className = "" }: AgentTagProps) {
  const a = BY_ID[type];
  return (
    <span
      className={`inline-block px-2 py-0.5 font-mono font-medium text-[0.75rem] leading-[1.4] tracking-widest ${className}`}
      style={{
        border: `1px ${a.legitimate ? "solid" : "dashed"} var(--xco-ink)`,
        color: a.legitimate ? "var(--xco-ink)" : "var(--xco-dusk)",
        textDecoration: a.legitimate ? "none" : "line-through",
      }}
      title={a.meaning}
    >
      [{a.tag}]
    </span>
  );
}
