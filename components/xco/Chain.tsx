interface ChainProps {
  steps: string[];
  className?: string;
}

export function Chain({ steps, className = "" }: ChainProps) {
  return (
    <div
      className={`flex flex-wrap items-center font-mono font-medium text-[0.9375rem] leading-none ${className}`}
    >
      {steps.map((step, i) => (
        <span key={i} className="flex items-center">
          <span
            className="px-3 py-2"
            style={{
              border: "1.5px solid var(--border-default)",
              color: "var(--xco-ink)",
              background: "var(--xco-paper)",
            }}
          >
            {step}
          </span>
          {i < steps.length - 1 && (
            <span
              className="px-1.5"
              style={{ color: "var(--xco-ink-weak)" }}
              aria-hidden
            >
              →
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
