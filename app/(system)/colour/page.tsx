import { colors } from "@/lib/design-tokens";
import { WIP } from "@/components/WIP";

type SwatchKey = keyof typeof colors;

const orderedKeys: SwatchKey[] = [
  "paper",
  "ink",
  "inkMuted",
  "navy",
  "ocean",
  "teal",
  "sand",
  "dusk",
];

const swatchTextClass: Record<SwatchKey, string> = {
  paper:    "text-xco-ink",
  ink:      "text-xco-paper",
  inkMuted: "text-xco-paper",
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
      <header className="flex items-baseline justify-between pb-6">
        <h1 className="font-display text-[3rem] leading-[1.1]">Colour</h1>
        <WIP variant="v0.1" />
      </header>

      {/* Palette principle */}
      <section className="max-w-2xl">
        <p className="font-body text-[1.375rem] text-xco-ink leading-[1.7]">
          Two surface colours: paper (#FFFFFF) and ink (#1C1B17). No greys.
          Plus a five-colour extended palette for diagrams — two cool registers
          (navy, ocean, teal) and two warm (sand, dusk). Never use all five at
          once. The brand lives in structure and type, not colour variety.
        </p>
      </section>

      {/* Swatches */}
      <section>
        <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-8">
          Palette
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {orderedKeys.map((key) => {
            const color = colors[key];
            const textClass = swatchTextClass[key];
            return (
              <div key={key}>
                <div
                  className="h-40 flex flex-col justify-end p-4"
                  style={{ backgroundColor: color.hex }}
                >
                  {"opacity" in color && color.opacity != null ? (
                    <p className={`font-mono font-medium text-[0.9375rem] leading-[1.6] ${textClass}`}>
                      {color.hex} / {Math.round(color.opacity * 100)}% opacity
                    </p>
                  ) : (
                    <p className={`font-mono font-medium text-[0.9375rem] leading-[1.6] ${textClass}`}>
                      {color.hex}
                    </p>
                  )}
                  <p className={`font-mono font-medium text-[0.9375rem] leading-[1.6] ${textClass} opacity-60`}>
                    {hexToRgb(color.hex)}
                  </p>
                </div>
                <div className="pt-4 space-y-1">
                  <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink capitalize">
                    {key === "inkMuted" ? "ink-muted" : key}
                  </p>
                  {"cssVar" in color && (
                    <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
                      {color.cssVar}
                    </p>
                  )}
                  <p className="font-body text-[1.375rem] text-xco-ink leading-[1.7]">
                    {color.usage}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* The 5% dusk rule */}
      <section className="max-w-3xl">
        <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-8">
          The 5% Rule — Dusk
        </h2>
        <p className="font-body text-[1.375rem] text-xco-ink leading-[1.7] mb-8">
          Dusk is the one earned warm accent. It should never exceed ~5% of any surface.
          When it does, it stops signalling emphasis and starts signalling anxiety.
        </p>

        <div className="mb-8">
          <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink mb-3">
            ✓ ~5% — emphasis, not decoration
          </p>
          <div className="relative h-16 bg-xco-paper overflow-hidden">
            <div className="absolute left-0 top-0 h-full bg-xco-dusk" style={{ width: "5%" }} />
            <div className="absolute left-[7%] top-1/2 -translate-y-1/2">
              <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
                5% dusk — the active axis on the Frontier dimension
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink mb-3">
            ✗ 40% — no longer emphasis, now just noise
          </p>
          <div className="relative h-16 bg-xco-paper overflow-hidden">
            <div className="absolute left-0 top-0 h-full bg-xco-dusk" style={{ width: "40%" }} />
            <div className="absolute left-[43%] top-1/2 -translate-y-1/2">
              <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
                too much — dusk becomes wallpaper
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dark mode note */}
      <section className="max-w-2xl pb-8">
        <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-4">
          Dark Mode
        </h2>
        <p className="font-body text-[1.375rem] text-xco-ink leading-[1.7]">
          A dark-mode variant exists (paper ↔ ink swap) but is not the primary register.
          Paper + ink is the default. Dark mode applies to: terminal output, code blocks,
          embedded media. It is never the hero surface.
        </p>
        <WIP variant="wip" label="[wip] dark mode variant not yet designed" className="mt-4" />
      </section>
    </div>
  );
}
