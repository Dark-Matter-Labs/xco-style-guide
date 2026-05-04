import Link from "next/link";

const systemLinks = [
  { href: "/typography", label: "Typography" },
  { href: "/colour", label: "Colour" },
  { href: "/grid", label: "Grid" },
  { href: "/diagrams", label: "Diagrammatic Grammar" },
  { href: "/tone", label: "Tone of Voice" },
  { href: "/components", label: "Components" },
];

const generatorLinks = [
  { href: "/three-regimes", label: "Three Regimes", note: "priority — Robyn's substack" },
  { href: "/portfolio-diagram", label: "Portfolio Diagram", note: "phase 2" },
  { href: "/social-card", label: "Social Card", note: "phase 2" },
];

export default function Home() {
  return (
    <main className="min-h-screen px-8 py-16 max-w-5xl mx-auto">
      <header className="mb-16 border-b border-xco-ink/[0.12] pb-8">
        <p className="font-mono text-xs text-xco-ink-muted mb-3 tracking-widest uppercase">
          Dark Matter Labs
        </p>
        <h1 className="font-display text-5xl leading-tight mb-2">
          Expanding Civilisational Optionality
        </h1>
        <p className="font-mono text-sm text-xco-ink-muted">xCO — Living Style Guide</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <section>
          <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted mb-6">
            Design System
          </h2>
          <nav className="space-y-2">
            {systemLinks.map(({ href, label }) => (
              <Link key={href} href={href} className="flex items-baseline gap-3 group">
                <span className="font-mono text-xs text-xco-ink-muted group-hover:text-xco-ember transition-colors">
                  →
                </span>
                <span className="font-body text-[1.375rem] text-xco-ink group-hover:text-xco-ember transition-colors">
                  {label}
                </span>
              </Link>
            ))}
          </nav>
        </section>

        <section>
          <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted mb-6">
            Asset Generators
          </h2>
          <nav className="space-y-2">
            {generatorLinks.map(({ href, label, note }) => (
              <Link key={href} href={href} className="flex items-baseline gap-3 group">
                <span className="font-mono text-xs text-xco-ink-muted group-hover:text-xco-ember transition-colors">
                  →
                </span>
                <span className="font-body text-[1.375rem] text-xco-ink group-hover:text-xco-ember transition-colors">
                  {label}
                </span>
                {note && (
                  <span className="font-mono text-xs text-xco-ink-muted">[{note}]</span>
                )}
              </Link>
            ))}
          </nav>
        </section>
      </div>

      <section className="mt-16 pt-8 border-t border-xco-ink/[0.12]">
        <p className="font-body text-xco-ink-muted max-w-2xl leading-relaxed">
          This site is the system. The design language for xCO is documented and generated
          here — typography, colour, diagrammatic grammar, tone of voice. Every asset the
          team ships is made from these primitives.
        </p>
        <p className="font-mono text-xs text-xco-flag mt-4 inline-block bg-xco-flag/10 px-2 py-1">
          [v0.1] — system under construction
        </p>
      </section>
    </main>
  );
}
