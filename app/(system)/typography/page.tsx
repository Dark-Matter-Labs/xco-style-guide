import { typography } from "@/lib/design-tokens";
import { WIP } from "@/components/WIP";

const specimens: Record<string, string> = {
  logo:     "xCO",
  heading:  "Three Regimes of Optionality",
  heading2: "Madrid — the heat question",
  body:     "Madrid faces +7.5°C. The question is not whether to respond at proportional scale, but what response at that scale looks like when capital systematically under-prices preconditions.",
  small:    "// [inference] assumes legionella testing compliance — unverified with Madrid water authority",
};

const faceClass: Record<string, string> = {
  display: "font-display",
  body:    "font-body",
  ui:      "font-ui",
  mono:    "font-mono",
};

export default function TypographyPage() {
  return (
    <div className="max-w-6xl mx-auto px-8 py-12 space-y-20">
      <header className="flex items-baseline justify-between pb-6">
        <h1 className="doc-title text-xco-ink">Typography</h1>
        <WIP variant="version" />
      </header>

      {/* Caveat */}
      <section className="max-w-2xl">
        <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
          <span className="text-xco-dusk">[note]</span> Untitled Serif and Untitled Sans are
          licensed typefaces from Klim Type Foundry. Drop{" "}
          <span className="text-xco-dusk">UntitledSerifRegular.woff2</span> and{" "}
          <span className="text-xco-dusk">UntitledSansRegular.woff2</span> into{" "}
          <span className="text-xco-dusk">public/fonts/</span> to activate. Until then the system
          falls back to Crimson Pro (serif) and Inter (sans), both loaded via Google Fonts. DM Mono is also loaded via
          Google Fonts.
        </p>
      </section>

      {/* Four scales */}
      <section>
        <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-8">
          Scale
        </h2>
        <div className="space-y-0">
          {typography.scale.map((step) => (
            <div
              key={step.name}
              className="grid grid-cols-[160px_1fr] gap-8 items-start py-8"
            >
              <div className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink space-y-0.5 pt-1 shrink-0">
                <p className="text-xco-dusk">{step.label}</p>
                <p>{step.size}</p>
                <p>/{step.lineHeight} lh</p>
                <p>{step.tailwind.split(" ")[0]}</p>
              </div>
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

      {/* Faces */}
      <section>
        <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-8">
          Typefaces
        </h2>
        <div className="space-y-8">
          {Object.entries(typography.faces).map(([key, face]) => (
            <div key={key} className="grid grid-cols-[160px_1fr] gap-8 items-baseline">
              <div className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
                <p>{key}</p>
                <p className="text-xco-dusk">{(face.weights as readonly string[]).join(" / ")}</p>
              </div>
              <div>
                <p className={`${faceClass[key]} text-[24px] leading-[26px] text-xco-ink`}>
                  {face.family}
                </p>
                <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink mt-1">
                  {face.usage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Italic specimens */}
      <section>
        <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-8">
          Italic — Diagram Annotations Only
        </h2>
        <div className="space-y-8">
          <div className="grid grid-cols-[160px_1fr] gap-8 items-baseline">
            <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
              Untitled Serif<br />400i
            </p>
            <p className="font-display italic text-[60px] leading-[60px] text-xco-ink">
              "If field optionality is the precondition, the allocation problem isn&apos;t about
              choosing between regimes."
            </p>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-8 items-baseline">
            <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
              DM Mono<br />400i
            </p>
            <p className="font-mono italic text-[0.9375rem] leading-[1.6] text-xco-ink">
              // [unverified] governance assumes legionella testing regime — depends on
              Madrid water authority compliance
            </p>
          </div>
        </div>
      </section>

      {/* Weight rule */}
      <section className="max-w-2xl pb-8">
        <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-4">
          Weight Rule
        </h2>
        <p className="font-body text-[24px] text-xco-ink leading-[26px]">
          Four scales: Logo (Untitled Serif 100px), Heading (Untitled Serif 60px), Heading 2
          (Untitled Sans 36px), Body (Untitled Sans 24px). Labels and annotations use DM Mono
          at 0.9375rem. Italic appears in diagram annotations and quoted pull-text only. No bold.
          No light. Restraint is the rule, not a constraint.
        </p>
      </section>
    </div>
  );
}
