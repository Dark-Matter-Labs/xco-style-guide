import type { Domain } from "./Mark";

interface PortProps {
  domain: Domain;
  /** Shown beneath the fragment on hover and focus. */
  kind?: string;
  children: React.ReactNode;
  className?: string;
}

// A pale fill on a fragment means "this term has depth". The ground is the
// domain's -pale token and the underline its -ink token; the saturated value
// is never used as text, because it does not clear 4.5:1 on paper.
export function Port({ domain, kind, children, className = "" }: PortProps) {
  return (
    <span
      className={`relative inline px-[0.12em] pb-[0.06em] pt-[0.02em] mx-[0.05em] rounded-[1px] ${className}`}
      style={{
        background: `var(--${domain}-pale)`,
        borderBottom: `1px solid var(--${domain}-ink)`,
        color: "var(--xco-ink)",
        boxDecorationBreak: "clone",
        WebkitBoxDecorationBreak: "clone",
      }}
      title={kind}
    >
      {children}
    </span>
  );
}
