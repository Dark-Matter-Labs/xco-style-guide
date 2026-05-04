import Link from "next/link";
import { DarkModeToggle } from "@/components/DarkModeToggle";

const generators = [
  { href: "/three-regimes", label: "Three Regimes" },
  { href: "/social-card",   label: "Social Card" },
  { href: "/paper-cover",   label: "Paper Cover" },
  { href: "/portfolio-diagram", label: "Portfolio Diagram", wip: true },
];

export default function GeneratorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-xco-paper">
      <nav className="border-b border-xco-ink/[0.12] px-8 py-3 sticky top-0 bg-xco-paper z-10">
        <div className="max-w-7xl mx-auto flex items-center gap-8">
          <Link
            href="/"
            className="font-mono text-xs text-xco-ink-muted hover:text-xco-ember transition-colors shrink-0"
          >
            ← xCO
          </Link>
          <div className="flex items-center gap-6 overflow-x-auto flex-1">
            {generators.map(({ href, label, wip }) => (
              <Link
                key={href}
                href={href}
                className="font-ui text-xs text-xco-ink-muted hover:text-xco-ink transition-colors whitespace-nowrap flex items-center gap-1.5"
              >
                {label}
                {wip && (
                  <span className="font-mono text-xs bg-xco-flag/15 text-xco-flag px-1">
                    [phase 2]
                  </span>
                )}
              </Link>
            ))}
          </div>
          <DarkModeToggle />
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-8 py-12">{children}</div>
    </div>
  );
}
