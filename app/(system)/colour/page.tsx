import { colors, surfaceTokens, semanticMeanings, domainColors } from "@/lib/design-tokens";
import { WIP } from "@/components/WIP";

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

const PAPER_HEX = "#f4f1e9";
const INK_HEX = "#20201e";

function relLuminance(hex: string): number {
  const c = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function contrastRatio(a: string, b: string): number {
  const l1 = relLuminance(a);
  const l2 = relLuminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// Pick whichever of ink or paper actually contrasts better against the swatch.
// The previous helper compared a weighted RGB average against a 0.45 cutoff,
// which chose light text on mid-tones like teal and indigo where dark text
// scores higher. This measures the real WCAG ratio instead of estimating it.
function onSwatch(hex: string): string {
  return contrastRatio(PAPER_HEX, hex) >= contrastRatio(INK_HEX, hex)
    ? PAPER_HEX
    : INK_HEX;
}

export default function ColourPage() {
  return (
    <div className="doc-wrap py-12 space-y-20">
      <header className="flex items-baseline justify-between pb-6">
        <h1 className="doc-display text-xco-ink">Colour</h1>
        <WIP variant="version" />
      </header>

      {/* Principle */}
      <section className="max-w-2xl space-y-4">
        <p className="font-body text-[24px] text-xco-ink leading-[26px]">
          A warm off-white paper — never pure white. Near-black ink — never pure black.
          Six semantic meanings each carried by colour and shape together: colour is never
          the sole carrier. The brand lives in structure and type, not colour variety.
        </p>
        <p className="font-body text-[24px] text-xco-ink leading-[26px]">
          Colour here is syntax. Each colour signals a specific thing. When it stops
          signalling something specific, remove it.
        </p>
      </section>

      {/* Surfaces */}
      <section>
        <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-8">
          Surfaces
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {(Object.entries(surfaceTokens) as [keyof typeof surfaceTokens, typeof surfaceTokens[keyof typeof surfaceTokens]][]).map(([name, token]) => {
            // The swatch ground is a fixed hex, so its label must be a fixed
            // colour too. A theme token here inverts in dark mode and puts
            // light text on a light swatch.
            const labelColor = onSwatch(token.hex);
            return (
            <div key={name}>
              <div
                className="h-32 flex flex-col justify-end p-4"
                style={{ backgroundColor: token.hex, border: "1px solid rgba(32,32,30,0.14)" }}
              >
                <p className="font-mono font-medium text-[0.9375rem] leading-[1.6]" style={{ color: labelColor }}>
                  {token.hex}
                </p>
                <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] opacity-60" style={{ color: labelColor }}>
                  {hexToRgb(token.hex)}
                </p>
              </div>
              <div className="pt-3 space-y-1">
                <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
                  paper-{name}
                </p>
                <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
                  {token.cssVar}
                </p>
                <p className="font-body text-[24px] text-xco-ink leading-[26px]">
                  {token.usage}
                </p>
              </div>
            </div>
            );
          })}
        </div>
      </section>

      {/* Ink */}
      <section>
        <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-8">
          Ink
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl">
          {[
            {
              name: "ink",
              hex: colors.ink.hex,
              cssVar: colors.ink.cssVar,
              usage: colors.ink.usage,
              contrast: "16.5:1",
            },
            {
              name: "ink-secondary",
              hex: colors.inkMuted.hex,
              cssVar: colors.inkMuted.cssVar,
              usage: "Secondary text, labels. Use for hierarchy, not decoration.",
              contrast: "6.5:1",
            },
            {
              name: "ink-weak",
              hex: "#686661",
              cssVar: "--xco-ink-weak",
              usage: "Captions, annotations, placeholder text only.",
              contrast: "4.56:1",
            },
          ].map((item) => (
            <div key={item.name}>
              <div
                className="h-32 flex flex-col justify-end p-4"
                style={{ backgroundColor: item.hex }}
              >
                <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-[#f4f1e9]">
                  {item.hex}
                </p>
                <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-[#f4f1e9] opacity-60">
                  {item.contrast} on paper
                </p>
              </div>
              <div className="pt-3 space-y-1">
                <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
                  {item.name}
                </p>
                <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
                  {item.cssVar}
                </p>
                <p className="font-body text-[24px] text-xco-ink leading-[26px]">
                  {item.usage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Semantic meanings */}
      <section>
        <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-4">
          Semantic Meanings
        </h2>
        <p className="font-body text-[24px] text-xco-ink leading-[26px] mb-8 max-w-2xl">
          Six meanings, each with two channels: colour and shape. The shape is the primary
          identifier — colour reinforces but never substitutes. This ensures meaning is
          accessible regardless of colour vision.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {semanticMeanings.map((m) => {
            const textColor = onSwatch(m.hex);
            return (
              <div key={m.name}>
                <div
                  className="h-40 flex flex-col justify-between p-4"
                  style={{ backgroundColor: m.hex }}
                >
                  <span
                    className="text-[40px] leading-none font-body"
                    style={{ color: textColor, opacity: 0.9 }}
                  >
                    {m.shape}
                  </span>
                  <div>
                    <p
                      className="font-mono font-medium text-[0.9375rem] leading-[1.6]"
                      style={{ color: textColor }}
                    >
                      {m.hex}
                    </p>
                    <p
                      className="font-mono font-medium text-[0.9375rem] leading-[1.6]"
                      style={{ color: textColor, opacity: 0.7 }}
                    >
                      {m.shapeLabel}
                    </p>
                  </div>
                </div>
                <div className="pt-4 space-y-1">
                  <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink capitalize">
                    {m.name}
                  </p>
                  <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
                    {m.cssVar}
                  </p>
                  <p className="font-body text-[24px] text-xco-ink leading-[26px]">
                    {m.usage}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 max-w-2xl">
          <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
            [rule] Always pair colour with its shape. A legend should list both the colour
            swatch and the shape symbol. Never ask the viewer to distinguish meanings by
            colour alone.
          </p>
        </div>
      </section>

      {/* Diagram palette */}
      <section>
        <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-4">
          Diagram Palette
        </h2>
        <p className="font-body text-[24px] text-xco-ink leading-[26px] mb-8 max-w-2xl">
          Five tones in two registers. Never mix registers within a single diagram.
          Pick cool (blueprint) or warm (field) — not both.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          <div>
            <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink mb-4 uppercase tracking-widest">
              Cool — Blueprint
            </p>
            <div className="grid grid-cols-3 gap-4">
              {(["navy", "ocean", "teal"] as const).map((key) => (
                <div key={key}>
                  <div
                    className="h-24 flex flex-col justify-end p-3"
                    style={{ backgroundColor: colors[key].hex }}
                  >
                    <p
                      className="font-mono font-medium text-[0.75rem] leading-[1.4]"
                      style={{ color: onSwatch(colors[key].hex) }}
                    >
                      {colors[key].hex}
                    </p>
                  </div>
                  <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink pt-2">
                    {key}
                  </p>
                  <p className="font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink-muted">
                    {colors[key].cssVar}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink mb-4 uppercase tracking-widest">
              Warm — Field
            </p>
            <div className="grid grid-cols-2 gap-4">
              {(["sand", "dusk"] as const).map((key) => (
                <div key={key}>
                  <div
                    className="h-24 flex flex-col justify-end p-3"
                    style={{ backgroundColor: colors[key].hex }}
                  >
                    <p
                      className="font-mono font-medium text-[0.75rem] leading-[1.4]"
                      style={{ color: onSwatch(colors[key].hex) }}
                    >
                      {colors[key].hex}
                    </p>
                  </div>
                  <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink pt-2">
                    {key}
                  </p>
                  <p className="font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink-muted">
                    {colors[key].cssVar}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The 5% dusk rule */}
      <section className="max-w-3xl">
        <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-8">
          The 5% Rule — Dusk
        </h2>
        <p className="font-body text-[24px] text-xco-ink leading-[26px] mb-8">
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

      {/* Domain colours */}
      <section>
        <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-4">
          Domain Colours
        </h2>
        <p className="font-body text-[24px] text-xco-ink leading-[26px] mb-8 max-w-2xl">
          Four orientational tones — for tagging domains, not signalling meanings.
          A bio-coloured element is not in "risk" or "agency": it is bio.
          Never use domain colours as semantic signals.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {domainColors.map((d) => {
            const textColor = onSwatch(d.hex);
            return (
              <div key={d.name}>
                <div
                  className="h-28 flex flex-col justify-end p-3"
                  style={{ backgroundColor: d.hex }}
                >
                  <p
                    className="font-mono font-medium text-[0.75rem] leading-[1.4]"
                    style={{ color: textColor }}
                  >
                    {d.hex}
                  </p>
                </div>
                <div className="pt-3 space-y-1">
                  <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
                    {d.name}
                  </p>
                  <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
                    {d.cssVar}
                  </p>
                  <p className="font-body text-[24px] text-xco-ink leading-[26px]">
                    {d.usage}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Inverse register / dark mode */}
      <section className="max-w-2xl pb-8">
        <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-4">
          Inverse Register
        </h2>
        <p className="font-body text-[24px] text-xco-ink leading-[26px] mb-4">
          The inverse register swaps paper and ink: dark ground (#20201e) with warm ink
          (#f4f1e9). It exists as a reader preference (dark mode) and as an authored choice
          for high-contrast sections using <code className="font-mono text-[0.9375rem]">data-register="inverse"</code>.
        </p>
        <p className="font-body text-[24px] text-xco-ink leading-[26px] mb-4">
          Semantic meanings and domain colours are fixed — they do not swap in either register.
          Only the surface tokens (paper, paper-raised, paper-quiet) and ink tokens invert.
        </p>
        <div
          className="p-6 space-y-2"
          style={{ backgroundColor: "#20201e" }}
        >
          <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-[#f4f1e9]">
            paper: #20201e — ink: #f4f1e9
          </p>
          <p className="font-body text-[24px] leading-[26px] text-[#f4f1e9]">
            Same type system. Same semantic colours. Inverted ground.
          </p>
        </div>
      </section>
    </div>
  );
}
