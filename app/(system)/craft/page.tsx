import { WIP } from "@/components/WIP";

const H2 = "font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-8";
const BODY = "font-body text-[24px] text-xco-ink leading-[26px]";
const SMALL = "font-mono font-medium text-[0.9375rem] leading-[1.6]";

// The tells, from "The vibecoded slop checklist" (credited to @theadnaankhan), shared by Gurden on 3 November 2026.
// "Instead" and `inXco` are this guide's reading. `inXco` says where xCO chooses a pattern on purpose.
const TELLS: { tell: string; instead: string; inXco?: string }[] = [
  { tell: "Too much spacing", instead: "Space that groups things. Fibonacci steps, never empty bands." },
  { tell: "Generic fonts", instead: "The system's faces, set to its scale.", inXco: "xCO sets everything in Untitled Sans and Untitled Serif, licensed from Klim. Inter is gone, even as a fallback." },
  { tell: "Walls of text", instead: "One idea per paragraph. Show the shape the content has: a diagram from the grammar." },
  { tell: "Bland hero", instead: "Open with the most telling thing from the subject: a field, a regime, an option." },
  { tell: "Gradients everywhere", instead: "Flat Field, Signal and Matter. Texture from the subject, never a wash." },
  { tell: "Everything in rounded cards", instead: "Rules, columns and space before boxes." },
  { tell: "Barely any pictures", instead: "Real photographs, treated with the image generators, and real diagrams." },
  { tell: "Purple and blue accents", instead: "One ember, as a declared hinge. Field blues as structure, never as decoration." },
  { tell: "Italic serif headlines", instead: "One display voice, used straight.", inXco: "The serif display face is xCO's. It is used straight, never as one italic word." },
  { tell: "Monospace labels", instead: "Labels only where they annotate.", inXco: "Labels and annotations are set in Untitled Sans. A monospace appears only for code, and in the PNG export until it can load Untitled Sans." },
  { tell: "Vague filler copy", instead: "Plain, specific words and real figures with their sources. See Tone of Voice." },
  { tell: "Massive footers", instead: "The few links people use." },
  { tell: "Random decorative symbols", instead: "A mark only where the grammar gives it a meaning." },
  { tell: "Pills and hairline borders", instead: "Plain words, and the three line weights of the diagram rules." },
  { tell: "Random 3D (the bonus)", instead: "Motion that answers what a person did, or none." },
];

const PROCESS = [
  "Find the guide. In xCO it is this one, unless an option or position has its own.",
  "Go wide first. Ask for three directions in two lines each, and choose one.",
  "Write a short brief before building: palette from Field, Signal and Matter, the type scale, the layout, the one bold thing, and the real content with its sources.",
  "Build it, then take a screenshot at laptop and phone width.",
  "Give a reviewer in a fresh context only the screenshot, the brief and this guide. It scores the design out of 10 and names its three biggest gaps.",
  "Fix the gaps, and review again with the same prompt. Stop at 8, or when two rounds do not raise the score.",
  "Remove one thing before you finish.",
];

export default function CraftPage() {
  return (
    <div className="doc-wrap py-12 space-y-24">
      <header className="flex items-baseline justify-between pb-6">
        <h1 className="doc-display text-xco-ink">Designing with AI</h1>
        <WIP variant="version" />
      </header>

      <section className="max-w-2xl space-y-4">
        <p className={BODY}>
          Left to itself, a model picks the most likely choice every time, so what it makes looks like everything
          else it makes. The tells below are its defaults. A pattern this system declares is a choice, not a tell,
          and the notes in ember say where xCO makes one.
        </p>
      </section>

      <section aria-labelledby="tells">
        <h2 id="tells" className={H2}>The tells, and what xCO does instead</h2>
        <ol className="space-y-8 max-w-4xl">
          {TELLS.map((t, i) => (
            <li key={t.tell} className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 pt-4" style={{ borderTop: "1px solid var(--rule)" }}>
              <div className="space-y-1">
                <p className={`${SMALL} text-xco-ink-muted`}>{String(i + 1).padStart(2, "0")}</p>
                <h3 className={`${SMALL} text-xco-ink uppercase tracking-widest`}>{t.tell}</h3>
              </div>
              <div className="space-y-2">
                <p className={`${SMALL} text-xco-ink`}>{t.instead}</p>
                {t.inXco ? <p className={`${SMALL} text-xco-dusk-ink`}>{t.inXco}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="process" className="max-w-2xl">
        <h2 id="process" className={H2}>The process</h2>
        <ol className="space-y-4 list-decimal pl-6">
          {PROCESS.map((p) => (
            <li key={p} className={`${SMALL} text-xco-ink`}>{p}</li>
          ))}
        </ol>
      </section>

      <section className="max-w-2xl space-y-4">
        <p className={`${SMALL} text-xco-ink-muted`}>
          The tells come from &ldquo;The vibecoded slop checklist&rdquo; (credited to @theadnaankhan). The process
          follows Anshu Chimala&rsquo;s &ldquo;How to turn your AI into a world-class designer&rdquo; (Lenny&rsquo;s
          Newsletter, 1 September 2026). In the wikis, the design-brief and design-critic skills run it with Claude.
        </p>
      </section>
    </div>
  );
}
