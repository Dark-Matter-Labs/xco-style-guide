import Link from "next/link";
import { SYSTEM_VERSION } from "@/lib/design-tokens";
import { GRAMMAR_SOURCE } from "@/lib/polyphonic";
import { DocSection, Note, ReadingProgress } from "@/components/doc";
import { DarkModeToggle } from "@/components/DarkModeToggle";

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

// Order matches the section nav in app/(system)/layout.tsx.
// Numbers are derived from position, not written down — a hardcoded list
// silently drifts out of step the moment an entry is added or reordered.
const systemLinks = [
  { href: "/logo",        label: "Logo",                 blurb: "Wordmark, lockups, clear space, export." },
  { href: "/typography",  label: "Typography",           blurb: "Four steps. Serif for the idea, sans for the argument." },
  { href: "/colour",      label: "Colour",               blurb: "Warm paper, six meanings, four domains." },
  { href: "/grid",        label: "Grid",                 blurb: "Golden ratio, Fibonacci spacing, 12 and 24 columns." },
  { href: "/diagrams",    label: "Diagrammatic Grammar", blurb: "Two line weights. Three node types." },
  { href: "/tone",        label: "Tone of Voice",        blurb: "Three registers, live linter, US English." },
  { href: "/components",  label: "Components",           blurb: "Marks, ports, callouts, epistemic tags." },
  { href: "/grammar",     label: "Polyphonic Grammar",   blurb: "Licences, operators, relations, release gates." },
].map((link, i) => ({ ...link, n: String(i + 1).padStart(2, "0") }));

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

const MONO = "font-mono font-medium text-[0.9375rem] leading-[1.6]";
const SMALL = "font-mono font-medium text-[0.75rem] leading-[1.4]";

export default function Home() {
  return (
    <main className="min-h-screen">
      <ReadingProgress />

      {/* ── Aperture ──────────────────────────────────────────────────
          The opening is deliberately quiet: one wordmark at display
          scale, one proposition, and a great deal of paper. */}
      <header className="max-w-6xl mx-auto px-8 pt-16 pb-4 sm:pt-24">
        <div className="flex items-start justify-between gap-6 mb-14">
          <p className={`${SMALL} uppercase tracking-widest text-xco-ink-muted max-w-xs`}>
            Dark Matter Labs — Expanding Civilizational Optionality
          </p>
          <DarkModeToggle />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[61.8fr_38.2fr] gap-x-16 gap-y-8 items-end">
          <h1 className="doc-title text-xco-ink">xCO</h1>
          <div className="space-y-5 lg:pb-3">
            <p className="doc-lede">
              The visual language for civilizational optionality — documented and
              generated here.
            </p>
            <p className={`${MONO} text-xco-ink`}>
              {GRAMMAR_SOURCE.maxim}
            </p>
          </div>
        </div>
      </header>

      {/* ── Design system ────────────────────────────────────────────── */}
      <DocSection
        n="01"
        kicker="Design system"
        title="The system is the document"
        lede="Every asset the team ships is built from these primitives."
        side={
          <>
            <Note tag="How to read this">
              Each section states a rule, shows it applied, and names what it
              refuses. Where a rule is unsettled it is marked, not hidden.
            </Note>
            <Note tag="Version">
              {SYSTEM_VERSION} — the grammar layer is encoded from{" "}
              {GRAMMAR_SOURCE.title} {GRAMMAR_SOURCE.version}.
            </Note>
          </>
        }
      >
        <nav>
          {systemLinks.map(({ href, label, n, blurb }) => (
            <Link
              key={href}
              href={href}
              className="group grid grid-cols-[38px_1fr] items-baseline gap-x-5 gap-y-1 py-4 transition-colors"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <span className={`${SMALL} text-xco-ink-muted group-hover:text-xco-dusk transition-colors pt-1.5`}>
                {n}
              </span>
              <span className="min-w-0">
                <span className="block font-body text-[24px] leading-[26px] text-xco-ink group-hover:text-xco-dusk transition-colors">
                  {label}
                </span>
                <span className={`${SMALL} block text-xco-ink-muted mt-0.5`}>
                  {blurb}
                </span>
              </span>
            </Link>
          ))}
        </nav>
      </DocSection>

      {/* ── Instruments ──────────────────────────────────────────────── */}
      <DocSection
        n="02"
        kicker="Instruments"
        title="Generators, not templates"
        lede="Each instrument composes the primitives into an exportable asset."
        register="dotted"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-0">
          {generatorLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-baseline gap-3 py-3.5 transition-colors"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <span
                className="shrink-0 w-1.5 h-1.5 mt-2 transition-colors"
                style={{ background: "var(--border-strong)" }}
                aria-hidden
              />
              <span className="font-body text-[24px] leading-[26px] text-xco-ink group-hover:text-xco-dusk transition-colors">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </DocSection>

      {/* ── Templates — inverse register ──────────────────────────────
          A dark section here is not a bespoke theme: it sets
          data-register="inverse", the same attribute the colour page
          documents, so the surface tokens swap themselves. */}
      <DocSection
        n="03"
        kicker="Templates"
        title="Where the system leaves the repo"
        lede="Working documents for the team, already carrying the system."
        register="inverse"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {templateLinks.map(({ href, label, meta }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-baseline justify-between gap-4 py-4"
              style={{ borderTop: "1px solid var(--border-default)" }}
            >
              <span className="font-body text-[24px] leading-[26px] group-hover:text-xco-dusk transition-colors">
                {label}
              </span>
              <span className={`${SMALL} opacity-70 shrink-0`}>{meta} ↗</span>
            </a>
          ))}
        </div>
      </DocSection>

      {/* ── Colophon ─────────────────────────────────────────────────── */}
      <footer className="doc-section">
        <div className="max-w-6xl mx-auto px-8">
          <div className="doc-grid">
            <div />
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <p className={`${MONO} text-xco-ink max-w-lg`}>
                The system is the document. When a rule stops signalling
                something specific, remove it.
              </p>
              <span
                className={`${MONO} shrink-0 px-2 py-1`}
                style={{ color: "var(--xco-dusk)", background: "color-mix(in srgb, var(--xco-dusk) 10%, transparent)" }}
              >
                [{SYSTEM_VERSION}]
              </span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
