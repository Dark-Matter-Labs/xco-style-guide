import Link from "next/link";
import { SYSTEM_VERSION } from "@/lib/design-tokens";
import { GRAMMAR_SOURCE } from "@/lib/polyphonic";
import {
  DocSection,
  DocThesis,
  Cells,
  Grain,
  ReadingProgress,
  RegisterSwitch,
} from "@/components/doc";
import { Mark } from "@/components/xco";

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
  { href: "/typography",  label: "Typography",           blurb: "Display tight and negative, labels wide and positive." },
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

// The four domains, each with its shape. Colour reinforces; shape carries.
const domains = [
  { id: "bio" as const,     name: "bio",     shape: "circle",   role: "Biophysical. Thresholds, cascades, irreversible loss." },
  { id: "inst" as const,    name: "inst",    shape: "square",   role: "Institutional. Mandate, authority, commitment, method." },
  { id: "tech" as const,    name: "tech",    shape: "triangle", role: "Technological. Operation, inference, divergence." },
  { id: "culture" as const, name: "culture", shape: "diamond",  role: "Cultural. Subject, witness, refusal, affect." },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <Grain />
      <ReadingProgress />

      <div className="fixed top-3.5 right-3.5 z-[200]">
        <RegisterSwitch />
      </div>

      {/* ── Masthead ─────────────────────────────────────────────────
          A solid ink rule closes the masthead; every section below is
          separated by a hairline instead. */}
      <header
        className="doc-wrap pt-[76px] pb-[34px]"
        style={{ borderBottom: "1px solid var(--xco-ink)" }}
      >
        <div className="flex items-start gap-[18px] mb-[52px]">
          <div
            className="font-display text-[36px] leading-[0.9] text-xco-ink"
            style={{ letterSpacing: "-0.04em" }}
          >
            xCO
          </div>
          <div className="doc-label pt-1 !text-[10px] !leading-[1.45]" style={{ letterSpacing: "0.14em" }}>
            Expanding<br />Civilizational Optionality
          </div>
        </div>

        <h1 className="doc-display text-xco-ink">The system is the document.</h1>

        <p className="doc-dek mt-[26px]">
          The living style guide for xCO — every primitive, every rule, and the
          instruments that compose them into assets. Colour carries meaning here
          rather than decorating, which is also what makes it testable.
        </p>

        <p className="doc-label mt-[30px] !text-[10px]">
          {SYSTEM_VERSION} · both registers validated · switch them, top right
        </p>
      </header>

      {/* ── 00 The move ─────────────────────────────────────────────── */}
      <DocSection
        id="move"
        kicker="00 / The move"
        title="Consistency from a grammar, not from sameness."
        intro={
          <>
            <p className="doc-intro-copy mb-[18px]">
              This guide states a rule, shows it applied, and names what it
              refuses. Where a rule is unsettled it is marked, not hidden.
            </p>
            <p className="doc-intro-copy">
              A palette expresses a brand; an encoding carries information, and
              can therefore be <em>wrong</em>. Everything below is built to be
              checkable.
            </p>
          </>
        }
      >
        <DocThesis>{GRAMMAR_SOURCE.maxim}</DocThesis>
      </DocSection>

      {/* ── 01 Domains ──────────────────────────────────────────────── */}
      <DocSection
        id="domains"
        kicker="01 / Domain colour"
        title="Four jurisdictions, and a shape apiece."
        intro={
          <p className="doc-intro-copy">
            Each hue names a domain. The pale tint is a ground that ink sits on;
            the saturated value is a stroke, border or fill; and the{" "}
            <code className="doc-code">-ink</code> token is the only form allowed
            to be text.
          </p>
        }
      >
        <Cells cols={4} className="mt-10">
          {domains.map((d) => (
            <div key={d.id}>
              <div
                className="h-24"
                style={{
                  background: `var(--domain-${d.id})`,
                  borderBottom: "1px solid var(--rule)",
                }}
              />
              <div className="px-4 pt-4 pb-5">
                <b className="doc-label !text-[11px] !tracking-[0.06em] flex items-center gap-[7px] !text-xco-ink">
                  <Mark domain={d.id} size="sm" />
                  {d.name}
                </b>
                <p className="doc-sans mt-[11px]">{d.role}</p>
                <span
                  className="inline-block mt-[9px] px-[7px] py-[3px] doc-label !text-[9px] !tracking-[0.06em]"
                  style={{ border: "1px solid var(--rule)" }}
                >
                  {d.shape}
                </span>
              </div>
            </div>
          ))}
        </Cells>

        <div
          className="doc-hang mt-11 px-6 py-[22px]"
          style={{
            borderLeft: "4px solid var(--domain-inst)",
            background: "color-mix(in srgb, var(--domain-inst) 9%, transparent)",
          }}
        >
          <p className="font-display text-[17px] leading-[1.55] text-xco-ink">
            <strong className="font-normal">Colour cannot carry domain alone.</strong>{" "}
            Under deuteranopia, institutional and cultural collapse toward each
            other. So the shape channel is not decoration — it is what survives
            when hue is gone, in print and under forced colours.
          </p>
        </div>
      </DocSection>

      {/* ── 02 The system ───────────────────────────────────────────── */}
      <DocSection
        id="system"
        kicker="02 / The system"
        title="Every piece, with a name you can type."
        intro={
          <p className="doc-intro-copy">
            Eight sections. Each one documents its primitives and the rules that
            govern them.
          </p>
        }
      >
        <ol className="doc-inv mt-10">
          {systemLinks.map(({ href, label, blurb }) => (
            <li key={href}>
              <Link href={href} className="group flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="text-xco-ink group-hover:opacity-60 transition-opacity">
                  {label}
                </span>
                <span className="doc-sans !text-[12px]">{blurb}</span>
              </Link>
            </li>
          ))}
        </ol>
      </DocSection>

      {/* ── 03 Instruments ──────────────────────────────────────────── */}
      <DocSection
        id="instruments"
        kicker="03 / Instruments"
        title="Generators, not templates."
        intro={
          <p className="doc-intro-copy">
            Each instrument composes the primitives into an exportable asset —
            SVG, PNG or token file.
          </p>
        }
      >
        <Cells cols={3} className="mt-10">
          {generatorLinks.map(({ href, label }) => (
            <Link key={href} href={href} className="group block px-5 py-6">
              <b className="block font-display text-[17px] font-normal text-xco-ink group-hover:opacity-60 transition-opacity">
                {label}
              </b>
              <span className="doc-label !text-[9px] mt-2 block">open ↗</span>
            </Link>
          ))}
        </Cells>
      </DocSection>

      {/* ── 04 Templates — inverse register ─────────────────────────── */}
      <DocSection
        id="templates"
        kicker="04 / Templates"
        title="Where the system leaves the repo."
        register="inverse"
        intro={
          <p className="doc-intro-copy">
            Working documents for the team, already carrying the system.
          </p>
        }
      >
        <div className="doc-hang mt-10">
          {templateLinks.map(({ href, label, meta }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-baseline justify-between gap-4 py-4"
              style={{ borderTop: "1px solid var(--rule)" }}
            >
              <span className="font-display text-[20px] group-hover:opacity-60 transition-opacity">
                {label}
              </span>
              <span className="doc-label !text-[9px] shrink-0">{meta} ↗</span>
            </a>
          ))}
        </div>
      </DocSection>

      <footer className="doc-wrap flex flex-wrap justify-between gap-6 pt-[70px] pb-[100px]">
        <p className="doc-label">
          The system is the document · when a rule stops signalling something
          specific, remove it
        </p>
        <p className="doc-label">
          {GRAMMAR_SOURCE.title} {GRAMMAR_SOURCE.version} · {SYSTEM_VERSION}
        </p>
      </footer>
    </main>
  );
}
