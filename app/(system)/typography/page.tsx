import { typography } from "@/lib/design-tokens";
import { WIP } from "@/components/WIP";

const specimens: Record<string, string> = {
  display: "Expanding Civilisational Optionality",
  h1: "Three Regimes of Optionality",
  h2: "Field is the precondition for Frontier and Fortress",
  h3: "The portfolio combines food forest, mistifier networks, community energy storage",
  body: "Madrid faces +7.5°C. The question is not whether to respond at proportional scale, but what response at that scale looks like when capital systematically under-prices preconditions.",
  small: "Field optionality regenerates the conditions under which the other two regimes remain possible.",
  caption: "// [inference] assumes legionella testing compliance — unverified with Madrid water authority",
  footnote: "[v0.1] — this type scale is a starting position, not a conclusion",
};

const faceClass: Record<string, string> = {
  display: "font-display",
  body: "font-body",
  ui: "font-ui",
  mono: "font-mono",
};

export default function TypographyPage() {
  return (
    <div className="space-y-20">
      <header className="flex items-baseline justify-between border-b border-xco-ink/[0.12] pb-6">
        <h1 className="font-display text-4xl">Typography</h1>
        <WIP variant="v0.1" />
      </header>

      {/* Caveat */}
      <section className="bg-xco-dusk/10 border-l-2 border-xco-dusk px-6 py-4 max-w-2xl">
        <p className="font-mono text-sm text-xco-ink leading-relaxed">
          <span className="text-xco-dusk">[note]</span> Suisse Works and Suisse Int&apos;l are
          licensed typefaces from Swiss Typefaces. If unavailable, the system falls back to
          Times New Roman (serif) and Helvetica Neue (sans-serif). DM Mono is loaded via Google Fonts.
        </p>
      </section>

      {/* Four faces */}
      <section>
        <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted mb-8">
          The Four Faces
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-xco-ink/[0.12]">
          {Object.entries(typography.faces).map(([key, face]) => (
            <div key={key} className="bg-xco-paper p-8 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-xs text-xco-ink-muted uppercase tracking-widest">
                    {key}
                  </p>
                  <p className={`${faceClass[key]} text-2xl text-xco-ink mt-1`}>
                    {face.family}
                  </p>
                </div>
                <code className="font-mono text-xs text-xco-ink-muted">{face.cssVar}</code>
              </div>
              <p className={`${faceClass[key]} text-lg text-xco-ink leading-relaxed`}>
                {key === "mono"
                  ? "Madrid: +7.5°C. Portfolio: [food forest, mistifier networks, energy storage]"
                  : key === "ui"
                  ? "Navigation · Labels · Structural Scaffolding"
                  : "Expanding Civilisational Optionality — a method for moving from civilisational risk to a believable, plural portfolio of responses."}
              </p>
              <div className="pt-2 space-y-1">
                <p className="font-mono text-xs text-xco-ink-muted">
                  weights: {(face.weights as readonly string[]).join(" / ")}
                </p>
                <p className="font-body text-sm text-xco-ink-muted italic">{face.usage}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Italic specimens */}
      <section>
        <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted mb-8">
          Italic Specimens
        </h2>
        <div className="space-y-6">
          <div className="grid grid-cols-[140px_1fr] gap-8 items-baseline border-b border-xco-ink/[0.12] pb-6">
            <p className="font-mono text-xs text-xco-ink-muted">
              Suisse Works
              <br />
              400i
            </p>
            <p className="font-display italic text-2xl text-xco-ink">
              "If field optionality is the precondition, the allocation problem isn't about
              choosing between regimes — it's about why capital under-prices preconditions."
            </p>
          </div>
          <div className="grid grid-cols-[140px_1fr] gap-8 items-baseline border-b border-xco-ink/[0.12] pb-6">
            <p className="font-mono text-xs text-xco-ink-muted">
              DM Mono
              <br />
              400i
            </p>
            <p className="font-mono italic text-sm text-xco-ink-muted">
              // [unverified] governance assumes legionella testing regime — depends on
              Madrid water authority compliance
            </p>
          </div>
        </div>
      </section>

      {/* Type scale */}
      <section>
        <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted mb-8">
          Type Scale
        </h2>
        <div className="space-y-0">
          {typography.scale.map((step) => (
            <div
              key={step.name}
              className="grid grid-cols-[160px_1fr] gap-8 items-start border-b border-xco-ink/[0.12] py-6"
            >
              {/* Measurement annotation in DM Mono margin */}
              <div className="font-mono text-xs text-xco-ink-muted space-y-0.5 pt-1 shrink-0">
                <p className="text-xco-dusk">{step.label}</p>
                <p>{step.size}</p>
                <p>/{step.lineHeight} lh</p>
                <p className="opacity-60">{step.measure} max</p>
                <p className="opacity-60 italic">{step.face}</p>
              </div>
              {/* Live specimen at exact scale */}
              <div
                className={`${faceClass[step.face]} text-xco-ink overflow-hidden`}
                style={{ fontSize: step.size, lineHeight: step.lineHeight, maxWidth: step.measure }}
              >
                {specimens[step.name]}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Weight rule */}
      <section className="max-w-2xl pb-8">
        <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted mb-4">
          Weight Rule
        </h2>
        <p className="font-body text-[1.375rem] text-xco-ink leading-relaxed">
          Two weights only per face: regular and one emphasis — italic for Suisse Works,
          medium for Suisse Int&apos;l, italic for Suisse Mono. No bold. No light. Restraint is the
          rule, not a constraint.
        </p>
      </section>
    </div>
  );
}
