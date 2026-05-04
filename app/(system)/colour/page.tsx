import { colors } from "@/lib/design-tokens";
import { WIP } from "@/components/WIP";

type SwatchKey = keyof typeof colors;

const orderedKeys: SwatchKey[] = [
  "paper",
  "ink",
  "inkMuted",
  "flag",
  "navy",
  "ocean",
  "teal",
  "sand",
  "dusk",
];

// Text to overlay on swatches — light or dark depending on colour value
const swatchTextClass: Record<SwatchKey, string> = {
  paper:    "text-xco-ink",
  ink:      "text-xco-paper",
  inkMuted: "text-xco-paper",
  flag:     "text-xco-ink",
  rule:     "text-xco-paper",
  navy:     "text-xco-paper",
  ocean:    "text-xco-paper",
  teal:     "text-xco-paper",
  sand:     "text-xco-ink",
  dusk:     "text-xco-ink",
};

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

export default function ColourPage() {
  return (
    <div className="space-y-20">
      <header className="flex items-baseline justify-between border-b border-xco-ink/[0.12] pb-6">
        <h1 className="font-display text-4xl">Colour</h1>
        <WIP variant="v0.1" />
      </header>

      {/* Palette principle */}
      <section className="max-w-2xl">
        <p className="font-body text-[1.375rem] text-xco-ink leading-relaxed">
          Nine tokens. Four core (paper, ink, ink-muted, flag) plus a five-colour extended
          palette for diagrams — two cool registers (navy, ocean, teal) and two warm
          (sand, dusk). Never use all five at once. The brand lives in structure and type,
          not in colour variety.
        </p>
      </section>

      {/* Swatches */}
      <section>
        <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted mb-8">
          Palette
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-xco-ink/[0.12]">
          {orderedKeys.map((key) => {
            const color = colors[key];
            const textClass = swatchTextClass[key];
            return (
              <div key={key} className="bg-xco-paper">
                {/* Swatch block */}
                <div
                  className="h-40 flex flex-col justify-end p-4"
                  style={{ backgroundColor: color.hex }}
                >
                  {"opacity" in color && color.opacity != null ? (
                    <p
                      className={`font-mono text-xs ${textClass} opacity-80`}
                    >
                      {color.hex} / {Math.round(color.opacity * 100)}% opacity
                    </p>
                  ) : (
                    <p className={`font-mono text-xs ${textClass} opacity-80`}>
                      {color.hex}
                    </p>
                  )}
                  <p className={`font-mono text-xs ${textClass} opacity-50`}>
                    {hexToRgb(color.hex)}
                  </p>
                </div>
                {/* Token info */}
                <div className="p-4 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <p className="font-ui text-sm font-medium text-xco-ink capitalize">
                      {key === "inkMuted" ? "ink-muted" : key}
                    </p>
                    {"cssVar" in color && (
                      <code className="font-mono text-xs text-xco-ink-muted">
                        {color.cssVar}
                      </code>
                    )}
                  </div>
                  <p className="font-body text-sm text-xco-ink-muted italic leading-relaxed">
                    {color.usage}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* The 5% dusk rule — worked example */}
      <section className="max-w-3xl">
        <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted mb-8">
          The 5% Rule — Dusk
        </h2>
        <p className="font-body text-[1.375rem] text-xco-ink leading-relaxed mb-8">
          Dusk is the one earned warm accent. It should never exceed ~5% of any surface.
          When it does, it stops signalling emphasis and starts signalling anxiety.
          Below: dusk at the right proportion, then at the wrong proportion.
        </p>

        {/* Right proportion */}
        <div className="mb-6">
          <p className="font-mono text-xs text-xco-ink-muted mb-3">
            ✓ ~5% — emphasis, not decoration
          </p>
          <div className="relative h-16 bg-xco-paper border border-xco-ink/[0.12] overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-xco-dusk"
              style={{ width: "5%" }}
            />
            <div className="absolute left-[7%] top-1/2 -translate-y-1/2">
              <p className="font-mono text-xs text-xco-ink-muted">
                5% dusk — the active axis on the Frontier dimension
              </p>
            </div>
          </div>
        </div>

        {/* Wrong proportion */}
        <div>
          <p className="font-mono text-xs text-xco-ink-muted mb-3">
            ✗ 40% — no longer emphasis, now just noise
          </p>
          <div className="relative h-16 bg-xco-paper border border-xco-ink/[0.12] overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-xco-dusk"
              style={{ width: "40%" }}
            />
            <div className="absolute left-[43%] top-1/2 -translate-y-1/2">
              <p className="font-mono text-xs text-xco-ink-muted">
                too much — dusk becomes wallpaper
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dark mode note */}
      <section className="max-w-2xl pb-8">
        <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted mb-4">
          Dark Mode
        </h2>
        <p className="font-body text-[1.375rem] text-xco-ink-muted leading-relaxed">
          A dark-mode variant exists (paper ↔ ink swap) but is not the primary register.
          Paper + ink is the default. Dark mode applies to: terminal output, code blocks,
          embedded media. It is never the hero surface.
        </p>
        <WIP variant="wip" label="[wip] dark mode variant not yet designed" className="mt-4" />
      </section>
    </div>
  );
}
