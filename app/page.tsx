import Link from "next/link";

const systemLinks = [
  { href: "/typography",  label: "Typography",          n: "01" },
  { href: "/colour",      label: "Colour",              n: "02" },
  { href: "/grid",        label: "Grid",                n: "03" },
  { href: "/diagrams",    label: "Diagrammatic Grammar", n: "04" },
  { href: "/tone",        label: "Tone of Voice",       n: "05" },
  { href: "/components",  label: "Components",          n: "06" },
];

const generatorLinks = [
  { href: "/three-regimes",  label: "Three Regimes" },
  { href: "/option-field",   label: "Option Field" },
  { href: "/social-card",    label: "Social Card" },
  { href: "/paper-cover",    label: "Paper Cover" },
  { href: "/image-treatment", label: "Image Treatment" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-xco-paper">

      {/* Header — full bleed, ocean accent at bottom */}
      <header className="border-b-4 border-xco-ocean px-8 pt-14 pb-10">
        <p className="font-mono text-xs text-xco-ink-muted tracking-widest uppercase mb-8">
          Dark Matter Labs — Expanding Civilisational Optionality
        </p>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 max-w-7xl">
          <h1 className="font-display text-[clamp(3rem,7vw,5.5rem)] leading-[1.0] text-xco-ink">
            xCO
          </h1>
          <p className="font-body text-[1.375rem] text-xco-ink leading-relaxed max-w-xl">
            The visual language for civilisational optionality —
            documented and generated here.
          </p>
        </div>
      </header>

      <div className="max-w-7xl px-8 py-14 grid grid-cols-1 lg:grid-cols-[2fr_1px_1fr] gap-0">

        {/* Design System */}
        <section className="pr-0 lg:pr-16 pb-14 lg:pb-0">
          <h2 className="font-mono text-xs text-xco-ocean tracking-widest uppercase mb-8">
            Design System
          </h2>
          <nav className="space-y-0">
            {systemLinks.map(({ href, label, n }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-baseline gap-5 py-3 border-b border-xco-ink/[0.08] hover:border-xco-ocean transition-colors"
              >
                <span className="font-mono text-xs text-xco-ink-muted group-hover:text-xco-ocean transition-colors w-6 shrink-0">
                  {n}
                </span>
                <span className="font-body text-[1.375rem] text-xco-ink group-hover:text-xco-ocean transition-colors">
                  {label}
                </span>
              </Link>
            ))}
          </nav>
        </section>

        {/* Divider */}
        <div className="hidden lg:block bg-xco-ink/[0.08]" />

        {/* Instruments */}
        <section className="pt-14 lg:pt-0 lg:pl-16 border-t border-xco-ink/[0.08] lg:border-t-0">
          <h2 className="font-mono text-xs text-xco-dusk tracking-widest uppercase mb-8">
            Instruments
          </h2>
          <nav className="space-y-0">
            {generatorLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-baseline gap-5 py-3 border-b border-xco-ink/[0.08] hover:border-xco-dusk transition-colors"
              >
                <span className="font-body text-[1.375rem] text-xco-ink group-hover:text-xco-dusk transition-colors">
                  {label}
                </span>
              </Link>
            ))}
          </nav>
        </section>
      </div>

      <footer className="max-w-7xl px-8 pb-14 flex items-center justify-between">
        <p className="font-mono text-xs text-xco-ink-muted max-w-lg leading-relaxed">
          Every asset the team ships is built from these primitives.
          The system is the document.
        </p>
        <span className="font-mono text-xs text-xco-dusk bg-xco-dusk/10 px-2 py-1 shrink-0">
          [v0.1]
        </span>
      </footer>
    </main>
  );
}
