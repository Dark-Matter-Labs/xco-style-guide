import Link from "next/link";
import { SYSTEM_VERSION } from "@/lib/design-tokens";

const templateLinks = [
  {
    href: "https://docs.google.com/document/d/1YUHnNz7f1oXnnJY18WoZuP2BHaqnUSgUNfdsvivZVMQ/edit?tab=t.0",
    label: "Document Template",
    meta: "Google Docs",
  },
  {
    href: "https://docs.google.com/presentation/d/1ttOljLpcgRGJ4n2r2D6yRfRdqaCZoWtOWQKOe2wLQ0Y/edit?slide=id.g3ddab6f8e13_0_16#slide=id.g3ddab6f8e13_0_16",
    label: "Slide Template",
    meta: "Google Slides",
  },
];

const systemLinks = [
  { href: "/typography",  label: "Typography",          n: "01" },
  { href: "/colour",      label: "Colour",              n: "02" },
  { href: "/grid",        label: "Grid",                n: "03" },
  { href: "/diagrams",    label: "Diagrammatic Grammar", n: "04" },
  { href: "/tone",        label: "Tone of Voice",       n: "05" },
  { href: "/components",  label: "Components",          n: "06" },
];

const generatorLinks = [
  { href: "/three-regimes",   label: "Three Regimes" },
  { href: "/option-field",    label: "Option Field" },
  { href: "/territory",       label: "Territory" },
  { href: "/social-card",     label: "Social Card" },
  { href: "/paper-cover",     label: "Paper Cover" },
  { href: "/image-treatment", label: "Image Treatment" },
  { href: "/align",           label: "Align" },
  { href: "/text-highlight",  label: "Text Highlight" },
  { href: "/design-export",   label: "Token Export" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-xco-paper">

      {/* Header */}
      <header className="px-8 pt-14 pb-10">
        <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-8">
          Dark Matter Labs — Expanding Civilizational Optionality
        </p>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 max-w-7xl">
          <h1 className="font-display text-[100px] leading-[90px] text-xco-ink">
            xCO
          </h1>
          <p className="font-body text-[24px] text-xco-ink leading-[26px] max-w-xl">
            The visual language for civilizational optionality —
            documented and generated here.
          </p>
        </div>
      </header>

      <div className="max-w-7xl px-8 py-14 grid grid-cols-1 lg:grid-cols-[61.8fr_38.2fr] gap-16">

        {/* Design System */}
        <section>
          <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ocean tracking-widest uppercase mb-8">
            Design System
          </h2>
          <nav className="space-y-0">
            {systemLinks.map(({ href, label, n }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-baseline gap-5 py-3 hover:text-xco-ocean transition-colors"
              >
                <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink group-hover:text-xco-ocean transition-colors w-6 shrink-0">
                  {n}
                </span>
                <span className="font-body text-[24px] leading-[26px] text-xco-ink group-hover:text-xco-ocean transition-colors">
                  {label}
                </span>
              </Link>
            ))}
          </nav>
        </section>

        {/* Instruments */}
        <section>
          <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-dusk tracking-widest uppercase mb-8">
            Instruments
          </h2>
          <nav className="space-y-0">
            {generatorLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-baseline gap-5 py-3 hover:text-xco-dusk transition-colors"
              >
                <span className="font-body text-[24px] leading-[26px] text-xco-ink group-hover:text-xco-dusk transition-colors">
                  {label}
                </span>
              </Link>
            ))}
          </nav>
        </section>
      </div>

      {/* Templates */}
      <section className="max-w-7xl px-8 pb-14">
        <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-8">
          Templates
        </h2>
        <nav className="space-y-0 max-w-sm">
          {templateLinks.map(({ href, label, meta }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-baseline justify-between gap-5 py-3 hover:text-xco-ink transition-colors"
            >
              <span className="font-body text-[24px] leading-[26px] text-xco-ink">
                {label}
              </span>
              <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink shrink-0">
                {meta} ↗
              </span>
            </a>
          ))}
        </nav>
      </section>

      <footer className="max-w-7xl px-8 pb-14 flex items-center justify-between">
        <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink max-w-lg">
          Every asset the team ships is built from these primitives.
          The system is the document.
        </p>
        <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-dusk bg-xco-dusk/10 px-2 py-1 shrink-0">
          [{SYSTEM_VERSION}]
        </span>
      </footer>
    </main>
  );
}
