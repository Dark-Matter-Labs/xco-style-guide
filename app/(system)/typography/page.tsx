import { typography } from "@/lib/design-tokens";
import { WIP } from "@/components/WIP";

const specimens: Record<string, string> = {
  heading: "Three Regimes of Optionality",
  body: "Madrid faces +7.5°C. The question is not whether to respond at proportional scale, but what response at that scale looks like when capital systematically under-prices preconditions.",
  small: "// [inference] assumes legionella testing compliance — unverified with Madrid water authority",
};

const faceClass: Record<string, string> = {
  display: "font-display",
  body:    "font-body",
  ui:      "font-ui",
  mono:    "font-mono",
};

export default function TypographyPage() {
  return (
    <div className="space-y-20">
      <header className="flex items-baseline justify-between pb-6">
        <h1 className="font-display text-[3rem] leading-[1.1]">Typography</h1>
        <WIP variant="v0.1" />
      </header>

      {/* Caveat */}
      <section className="max-w-2xl">
        <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
          <span className="text-xco-dusk">[note]</span> Suisse Works and Suisse Int&apos;l are
          licensed typefaces from Swiss Typefaces. If unavailable, the system falls back to
          Times New Roman (serif) and Helvetica Neue (sans-serif). DM Mono is loaded via Google Fonts.
        </p>
      </section>

      {/* Three scales */}
      <section>
        <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-8">
          Three Scales
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
                <p className={`${faceClass[key]} text-[1.375rem] leading-[1.7] text-xco-ink`}>
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

      {/* Italic specimens — functional documentation */}
      <section>
        <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-8">
          Italic — Diagram Annotations Only
        </h2>
        <div className="space-y-8">
          <div className="grid grid-cols-[160px_1fr] gap-8 items-baseline">
            <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
              Suisse Works<br />400i
            </p>
            <p className="font-display italic text-[3rem] leading-[1.1] text-xco-ink">
              "If field optionality is the precondition, the allocation problem isn't about
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
        <p className="font-body text-[1.375rem] text-xco-ink leading-[1.7]">
          Three scales only: Heading (Suisse Works serif, 3rem), Body (Suisse Int&apos;l sans, 1.375rem),
          Small (DM Mono medium, 0.9375rem). Italic appears in diagram annotations and quoted pull-text.
          No bold. No light. Restraint is the rule, not a constraint.
        </p>
      </section>
    </div>
  );
}
