import { WIP } from "@/components/WIP";
import { Logo } from "@/components/xco/Logo";
import { logoGeometry } from "@/lib/logo";
import { BRAND_NAME } from "@/lib/design-tokens";
import { GroupMark, groundHex } from "@/components/xco";
import {
  groupMarks,
  groupColors,
  aperturePositions,
  markRules,
  allocationStatus,
  auditPairs,
  contrastRatio,
  MARK_CONTRAST_MIN,
  VALUE_TWIN_MAX,
  ANGLE_TWIN_MAX,
} from "@/lib/group-marks";
import { paletteHex } from "@/lib/design-tokens";
import { LogoDownloads } from "./LogoDownloads";
import { ConstructionDiagram } from "./ConstructionDiagram";

const MISUSE = [
  { label: "Don't retype it", note: "The mark is drawn geometry, not set type. Never rebuild it in a font." },
  { label: "Don't recolour freely", note: "Three variants exist. The x may carry dusk; nothing else may carry colour." },
  { label: "Don't stretch it", note: "Scale proportionally. The stroke weight is tied to the cap height." },
  { label: "Don't add effects", note: "No shadows, gradients, outlines, or rounded caps. Terminals are cut flat." },
  { label: "Don't reflow it", note: "The gaps are optically tuned. Never re-space, stack, or reorder the glyphs." },
  { label: "Don't box it", note: "Clear space is built into the file. Do not add a frame or a container." },
];

export default function LogoPage() {
  const g = logoGeometry;

  return (
    <div className="doc-wrap py-12 space-y-24">
      <header className="flex items-baseline justify-between pb-6">
        <h1 className="doc-display text-xco-ink">Logo</h1>
        <WIP variant="version" />
      </header>

      {/* Hero */}
      <section className="space-y-12">
        <div
          className="flex items-center justify-center py-20"
          style={{ background: "var(--xco-paper-quiet)" }}
        >
          <Logo height={120} />
        </div>

        <div className="max-w-2xl space-y-4">
          <p className="font-body text-[24px] text-xco-ink leading-[26px]">
            The {BRAND_NAME} logotype is constructed, not typeset. Every glyph is drawn from
            one circle radius and one stroke weight, so the mark is exact at any size and
            renders identically with no fonts installed.
          </p>
          <p className="font-body text-[24px] text-xco-ink leading-[26px]">
            The C and the O are the same circle. The C is that circle with an aperture
            cut; the O is closed. Same geometry, different openness — the optionality
            argument stated in the letterforms rather than described alongside them.
          </p>
          <p className="font-body text-[24px] text-xco-ink leading-[26px]">
            The lowercase x is the operator acting on them. Its reduced height is not a
            stylistic choice: it encodes the naming rule as a visual fact.
          </p>
        </div>
      </section>

      {/* Construction */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
            Construction
          </h2>
          <p className="font-body text-[24px] text-xco-ink leading-[26px] max-w-2xl">
            Everything derives from the cap height. Change it and the mark scales exactly —
            there are no independent values to keep in sync.
          </p>
        </div>

        <div style={{ border: "1px solid var(--border-default)" }} className="p-6">
          <ConstructionDiagram />
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {[
            { k: "Cap height", v: `${g.cap}`, n: "the base unit" },
            { k: "Stroke", v: `${g.stroke}`, n: "single weight, all glyphs" },
            { k: "x-height", v: `${g.xHeight}`, n: "cap ÷ φ" },
            { k: "Radius", v: `${g.radius}`, n: "shared by C and O" },
            { k: "Aperture", v: `${g.aperture}°`, n: "the C's opening" },
            { k: "Gaps", v: `${g.gapXC} / ${g.gapCO}`, n: "x→C / C→O, optical" },
          ].map((item) => (
            <div key={item.k} className="space-y-1">
              <dt className="font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink-muted uppercase tracking-widest">
                {item.k}
              </dt>
              <dd className="doc-h2 text-xco-ink">{item.v}</dd>
              <p className="font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink-muted">
                {item.n}
              </p>
            </div>
          ))}
        </dl>

        <div className="max-w-2xl">
          <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
            [rule] The two gaps differ on purpose. Round-to-round sits far tighter than
            flat-to-round — at equal metric gaps the C/O pair reads as a hole. The values are
            tuned by eye and held in code so the mark cannot drift.
          </p>
        </div>
      </section>

      {/* Scale */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
            Scale
          </h2>
          <p className="font-body text-[24px] text-xco-ink leading-[26px] max-w-2xl">
            The mark holds down to 24px tall. Below that the aperture closes optically and
            the C reads as an O — use the wordmark in live text instead.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-10">
          {[120, 72, 48, 32, 24].map((h) => (
            <div key={h} className="space-y-3">
              <Logo height={h} />
              <p className="font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink-muted">
                {h}px
              </p>
            </div>
          ))}
          <div className="space-y-3 opacity-40">
            <Logo height={16} />
            <p className="font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-dusk">
              16px — too small
            </p>
          </div>
        </div>
      </section>

      {/* Clear space */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
            Clear space
          </h2>
          <p className="font-body text-[24px] text-xco-ink leading-[26px] max-w-2xl">
            Clear space equals the x-height on every side, and it is already inside the
            file&apos;s viewBox. Place the mark flush and the spacing is correct — do not add
            your own padding on top.
          </p>
        </div>

        <div
          className="relative inline-flex p-0"
          style={{ border: "1px dashed var(--xco-ocean)" }}
        >
          <Logo height={96} />
        </div>
        <p className="font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink-muted">
          Dashed line marks the file edge — the clear space is the gap between it and the glyphs.
        </p>
      </section>

      {/* Downloads */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
            Variants and downloads
          </h2>
          <p className="font-body text-[24px] text-xco-ink leading-[26px] max-w-2xl">
            Pick a variant, then take the file. SVG is the master format.
          </p>
        </div>

        <LogoDownloads />

        <div className="max-w-2xl space-y-3 pt-2">
          <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
            [note] The descriptor lockup is the one part that is live text, set in DM Mono.
            It rasterises correctly to PNG because the exporter loads that face, but an SVG
            lockup opened on a machine without DM Mono will substitute the descriptor line.
            The glyphs themselves are unaffected. For third parties, send the PNG lockup or
            the plain SVG.
          </p>
        </div>
      </section>

      {/* Misuse */}

      {/* ── Aperture system ─────────────────────────────────────────────
          Documented from lib/group-marks.ts, the same module the PNG
          generator renders from. The audit below is computed at build time,
          so a bad combination surfaces here rather than in a chat list. */}
      <section className="space-y-10">
        <div className="space-y-2">
          <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
            Aperture system
          </h2>
          <p className="font-body text-[24px] text-xco-ink leading-[26px] max-w-2xl">
            One device for any family of related marks — Signal groups today,
            anything needing a set tomorrow. Every mark is this same lockup with
            the C&apos;s aperture rotated: the logotype&apos;s own argument made
            literal, the same circle at a different openness.
          </p>
          <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
            [rule] A mark is ground <em>and</em> aperture. No pair may be weak on
            both channels at once.
          </p>
        </div>

        {/* The eight positions */}
        <div className="space-y-4">
          <p className="font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink-muted uppercase tracking-widest">
            Eight positions, {aperturePositions.length} of {aperturePositions.length} allocated
          </p>
          <div className="flex flex-wrap gap-5">
            {aperturePositions.map((deg) => {
              const owner = groupMarks.find((m) => m.aperture === deg);
              return (
                <div key={deg} className="space-y-2">
                  {owner ? (
                    <GroupMark mark={owner} size={64} />
                  ) : (
                    <div
                      className="w-16 h-16 rounded-full"
                      style={{ border: "1px dashed var(--rule)" }}
                    />
                  )}
                  <p className="font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink text-center">
                    {deg}°
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Registry */}
        <div className="space-y-4">
          <p className="font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink-muted uppercase tracking-widest">
            Registry
          </p>
          <div className="space-y-0">
            {groupMarks.map((m) => {
              const bg = groundHex(m);
              const markContrast = Math.min(
                contrastRatio(paletteHex[m.c], bg),
                contrastRatio(paletteHex[m.x], bg),
              );
              const groundLabel =
                m.ground.kind === "token"
                  ? m.ground.token
                  : groupColors[m.ground.color].label;
              return (
                <div
                  key={m.id}
                  className="grid grid-cols-[56px_1fr] lg:grid-cols-[56px_260px_1fr] gap-x-5 gap-y-2 py-5 items-start"
                  style={{ borderTop: "1px solid var(--rule)" }}
                >
                  <GroupMark mark={m} size={48} />
                  <div className="min-w-0 space-y-1">
                    <p className="font-mono font-medium text-[0.9375rem] leading-[1.4] text-xco-ink">
                      {m.name}
                    </p>
                    <p className="font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink-muted">
                      {groundLabel} · {m.aperture}° · {markContrast.toFixed(2)}:1
                    </p>
                    <a
                      href={`/signal-groups/${m.file}.png`}
                      className="inline-block font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink-muted hover:text-xco-dusk transition-colors"
                    >
                      {m.file}.png ↓
                    </a>
                  </div>
                  <p className="col-span-2 lg:col-span-1 font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink-muted">
                    {m.note}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Greyscale proof */}
        <div className="space-y-3">
          <p className="font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink-muted uppercase tracking-widest">
            With hue removed
          </p>
          <p className="font-body text-[24px] text-xco-ink leading-[26px] max-w-2xl">
            What a colour-blind reader, a print run, or forced colours leaves
            behind. The apertures still separate every mark — which is the test
            of whether the second channel was ever real.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            {groupMarks.map((m) => (
              <GroupMark key={m.id} mark={m} size={52} greyscale />
            ))}
          </div>
        </div>

        {/* Live audit */}
        <div className="space-y-3">
          <p className="font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink-muted uppercase tracking-widest">
            Pair audit
          </p>
          {(() => {
            const pairs = auditPairs(groundHex);
            const failing = pairs.filter((p) => p.failing);
            const single = pairs.filter((p) => p.singleChannel);
            return (
              <>
                <p className="font-body text-[24px] text-xco-ink leading-[26px] max-w-2xl">
                  {pairs.length} pairs. {failing.length} weak on both channels.{" "}
                  {single.length} rely on a single channel, each with the other
                  channel far — listed below so the thin margins are visible
                  rather than assumed.
                </p>
                {failing.length > 0 && (
                  <div
                    className="p-4 space-y-1"
                    style={{ borderLeft: "3px solid var(--xco-dusk)" }}
                  >
                    {failing.map((p) => (
                      <p
                        key={`${p.a}-${p.b}`}
                        className="font-mono font-medium text-[0.75rem] leading-[1.4]"
                        style={{ color: "var(--xco-dusk)" }}
                      >
                        ✗ {p.a} vs {p.b} — value {p.value.toFixed(2)}:1, angle {p.angle}°
                      </p>
                    ))}
                  </div>
                )}
                <div className="space-y-0 max-w-3xl">
                  {single.map((p) => (
                    <div
                      key={`${p.a}-${p.b}`}
                      className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-x-4 py-2"
                      style={{ borderBottom: "1px solid var(--border-subtle)" }}
                    >
                      <p className="font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink">
                        {p.a} · {p.b}
                      </p>
                      <p className="font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink-muted sm:text-right">
                        value {p.value.toFixed(2)}:1 · angle {p.angle}° ·{" "}
                        {p.value < VALUE_TWIN_MAX ? "aperture carries it" : "ground carries it"}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>

        {/* Rules */}
        <div className="space-y-4">
          <p className="font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink-muted uppercase tracking-widest">
            Rules
          </p>
          <div className="space-y-0 max-w-3xl">
            {markRules.map((r) => (
              <div key={r.rule} className="py-4 space-y-1" style={{ borderBottom: "1px solid var(--rule)" }}>
                <p className="font-display text-[20px] leading-[1.3] text-xco-ink">{r.rule}</p>
                <p className="font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink-muted">
                  {r.detail}
                </p>
              </div>
            ))}
          </div>
          <p className="font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink-muted">
            Thresholds: mark clears {MARK_CONTRAST_MIN}:1 on its ground ·
            grounds under {VALUE_TWIN_MAX}:1 are one tone in greyscale ·
            apertures within {ANGLE_TWIN_MAX}° are one shape at listing size.
          </p>
        </div>

        {/* Adding one */}
        <div
          className="max-w-3xl p-6 space-y-3"
          style={{ border: "1px solid var(--rule)", background: "var(--panel)" }}
        >
          <p className="font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink-muted uppercase tracking-widest">
            Adding a mark
          </p>
          <p className="font-body text-[24px] text-xco-ink leading-[26px]">
            Add an entry to <code className="font-mono text-[0.9375rem]">lib/group-marks.ts</code>{" "}
            and run <code className="font-mono text-[0.9375rem]">npm run avatars</code>. The
            generator fails the run if any pair ends up weak on both channels,
            and this page updates from the same registry.
          </p>
          <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
            [note] Both channels are now fully allocated —{" "}
            {allocationStatus.aperturesUsed}/{allocationStatus.aperturesTotal} apertures,
            every documented tone, plus {allocationStatus.groupColorsUsed} group colours.
          </p>
          <p className="font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink-muted">
            {allocationStatus.nextNeeds}
          </p>
        </div>
      </section>

      <section className="space-y-8 pb-16">
        <div className="space-y-2">
          <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
            Misuse
          </h2>
          <p className="font-body text-[24px] text-xco-ink leading-[26px] max-w-2xl">
            The mark carries the system&apos;s claim to precision. Breaking it breaks that claim.
          </p>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MISUSE.map((m) => (
            <li
              key={m.label}
              className="space-y-2 p-5"
              style={{ borderLeft: "3px solid var(--xco-dusk)", background: "var(--xco-paper-quiet)" }}
            >
              <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
                ✗ {m.label}
              </p>
              <p className="font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink-muted">
                {m.note}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
