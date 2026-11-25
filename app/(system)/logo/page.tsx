import Link from "next/link";
import { WIP } from "@/components/WIP";
import { Logo } from "@/components/xco/Logo";
import { changeLog } from "@/lib/provisional";
import { logoGeometry } from "@/lib/logo";
import { BRAND_NAME } from "@/lib/design-tokens";
import { ProvisionalChange } from "@/components/xco";
import { LogoDownloads } from "./LogoDownloads";
import { ConstructionDiagram } from "./ConstructionDiagram";
import { LockupFigure } from "./LockupFigure";
import { logoVariants } from "@/lib/logo";
import { lockups, coHost, type Lockup } from "@/lib/logo-lockups";

const MISUSE = [
  { label: "Don't retype it", note: "The mark is drawn geometry, not set type. Never rebuild it in a font." },
  { label: "Don't recolour freely", note: "Four variants exist: light and dark, each with an orange x. One quiet extra use: a faint footer watermark at about 7%, cropped by a corner (CH-09). The x may carry dusk; nothing else may carry colour." },
  { label: "Don't stretch it", note: "Scale proportionally. The stroke weight is tied to the cap height." },
  { label: "Don't add effects", note: "No shadows, gradients, outlines, or rounded caps. Terminals are cut flat." },
  { label: "Don't reflow it", note: "The gaps are optically tuned. Never re-space, stack, or reorder the glyphs. One exception: the x may leave the mark as operator, under the rules on /logo/x (CH-08). At rest it is always in place." },
  { label: "Don't box it", note: "Clear space is built into the file. Do not add a frame or a container." },
  { label: "Don't build your own lockup", note: "Use the lockups on this page. A partner's mark never rises above the cap band or leads the row." },
  { label: "Don't recolour a partner", note: "Dark Matter Labs and project marks keep their own colours and their own clear space." },
];

const H2 = "font-mono text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase";
const LEDE = "font-body text-[24px] text-xco-ink leading-[26px] max-w-2xl";
const LABEL = "font-mono text-[0.9375rem] leading-[1.6] text-xco-ink";
const NOTE = "font-mono text-[0.75rem] leading-[1.4] text-xco-ink-muted";
const RULE = "font-mono text-[0.9375rem] leading-[1.6] text-xco-ink";

/** Each lockup twice: with its logic drawn, then light and dark as they ship. */
function LockupSet({ ids }: { ids: Lockup[] }) {
  return (
    <div className="space-y-12">
      {ids.map((id) => {
        const l = lockups.find((x) => x.id === id)!;
        return (
          <figure key={id} className="space-y-4 max-w-3xl">
            <div style={{ border: "1px solid var(--border-default)" }}>
              <LockupFigure lockup={id} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div style={{ border: "1px solid var(--border-default)" }}>
                <LockupFigure lockup={id} variant="light" logic={false} />
              </div>
              <div style={{ border: "1px solid var(--border-default)" }}>
                <LockupFigure lockup={id} variant="dark" logic={false} />
              </div>
            </div>
            <figcaption className="space-y-1">
              <p className={LABEL}>{l.label}</p>
              <p className={NOTE}>
                {l.note}
                {l.download ? " In the downloads below." : " Not in the downloads: it carries another organisation\u2019s artwork."}
              </p>
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}

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
            stylistic choice: it encodes the naming rule as a visual fact.{" "}
            <Link href="/logo/x" className="underline underline-offset-4 hover:text-xco-dusk-ink">
              See the x as operator →
            </Link>
          </p>
        </div>
      </section>

      {/* Proposal: serif x */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="font-mono text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
            Proposed — serif x
          </h2>
          <p className="font-body text-[24px] text-xco-ink leading-[26px] max-w-2xl">
            The x drawn from Untitled Serif, our heading face, beside the constructed C
            and O. The operator speaks in the system&apos;s editorial voice while the
            circles stay geometry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(["mono", "serif"] as const).map((s) => (
            <div key={s} className="space-y-3">
              <div
                className="flex items-end justify-center gap-8 py-12"
                style={{ background: "var(--xco-paper-quiet)" }}
              >
                <Logo height={110} xStyle={s} />
                <Logo height={32} xStyle={s} />
              </div>
              <p className="font-mono text-[0.75rem] leading-[1.4] text-xco-ink-muted">
                {s === "mono" ? "Current — constructed, monoline" : "Proposed — Untitled Serif x"}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-12 py-10" style={{ background: "var(--xco-paper-quiet)" }}>
          <Logo height={110} xStyle="serif" variant="light-accent" />
          <Logo height={200} xStyle="serif" withEndorsement />
        </div>

        <p className="font-mono text-[0.9375rem] leading-[1.6] text-xco-ink max-w-2xl">
          [proposal] Not adopted. Before it can be: the x→C gap needs re-measuring
          (<code className="font-code">npm run logo:spacing</code> still checks the monoline
          x), the lockup lines are still aligned to the monoline x&apos;s ink, and Klim&apos;s
          licence must cover outlining a glyph into a logo. Downloads stay monoline.
        </p>
      </section>

      {/* Construction */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="font-mono text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
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
            { k: "Gaps", v: `${g.gapXC} / ${String(g.gapCO).replace("-", "\u2212")}`, n: "x→C / C→O, measured" },
          ].map((item) => (
            <div key={item.k} className="space-y-1">
              <dt className="font-mono text-[0.75rem] leading-[1.4] text-xco-ink-muted uppercase tracking-widest">
                {item.k}
              </dt>
              <dd className="doc-h2 text-xco-ink">{item.v}</dd>
              <dd className="font-mono text-[0.75rem] leading-[1.4] text-xco-ink-muted">
                {item.n}
              </dd>
            </div>
          ))}
        </dl>

        <div className="max-w-2xl">
          <p className="font-mono text-[0.9375rem] leading-[1.6] text-xco-ink">
            [rule] The two gaps are equal in optical space, not in metric distance. The
            C&apos;s aperture faces the O and pours white into that gap, so C→O is negative:
            the boxes overlap before the pair holds as much space as x→C. Measured, not
            eyeballed — <code className="font-code">npm run logo:spacing</code> fails if the
            pairs drift more than 10% apart.
          </p>
        </div>
      </section>

      {/* Scale */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="font-mono text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
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
              <p className="font-mono text-[0.75rem] leading-[1.4] text-xco-ink-muted">
                {h}px
              </p>
            </div>
          ))}
          <div className="space-y-3 opacity-40">
            <Logo height={16} />
            <p className="font-mono text-[0.75rem] leading-[1.4] text-xco-dusk-ink">
              16px — too small
            </p>
          </div>
        </div>
      </section>

      {/* Clear space */}
      <section id="clear-space" className="space-y-8">
        <div className="space-y-2">
          <h2 className={H2}>Clear space</h2>
          <p className={LEDE}>
            The x is the unit. Clear space is half the x-height, ½x, measured from the ink on
            every side. It is already inside every file, so place the file flush and the
            spacing is correct. Do not add your own padding on top.
          </p>
        </div>

        <div className="max-w-3xl" style={{ border: "1px solid var(--border-default)" }}>
          <LockupFigure lockup="mark" />
        </div>
        <p className={NOTE}>
          Shaded: the clear space. Solid line: the file edge. Dashed line: the ink. The square
          in the margin is ½x, {g.clear} units at a cap height of {g.cap}.
        </p>
        <p className={`${RULE} max-w-2xl`}>
          [rule] ½x is the minimum. Give the mark more room when you can, never less. Inside a
          lockup, gaps are ½x or 1x. A partner keeps its own clear space where it is larger:
          Dark Matter Labs asks for one stamp height.
        </p>
      </section>

      {/* Variants */}
      <section id="variants" className="space-y-8">
        <div className="space-y-2">
          <h2 className={H2}>Variants</h2>
          <p className={LEDE}>
            Two modes, light and dark. Each has an orange-x companion, where the x, and only
            the x, carries dusk. The C and the O never change colour.
          </p>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
          {logoVariants.map((v) => (
            <li key={v.id} className="space-y-3">
              <div style={{ border: "1px solid var(--border-default)" }}>
                <LockupFigure lockup="mark" variant={v.id} logic={false} />
              </div>
              <p className={LABEL}>{v.label}</p>
              <p className={NOTE}>{v.usage}</p>
            </li>
          ))}
        </ul>
        <p className={`${RULE} max-w-2xl`}>
          [rule] One orange x per surface. If the page already carries dusk somewhere that
          speaks, use the plain variant.
        </p>
      </section>

      {/* Lockups and stacks */}
      <section id="lockups" className="space-y-10">
        <div className="space-y-2">
          <h2 className={H2}>Lockups and stacks</h2>
          <p className={LEDE}>
            The full name, Expanding Civilizational Optionality, travels with the logotype in
            two arrangements. The stack sets it below on one line, tracked to the
            logotype&apos;s ink on both edges. The horizontal lockup sets it beside, on three
            lines that fill the cap band from cap line to baseline.
          </p>
        </div>
        <LockupSet ids={["stacked", "horizontal"]} />
        <p className={`${RULE} max-w-2xl`}>
          [rule] Use the logotype alone where the name is already spelled out nearby. Use the
          stack where width is short: a portrait cover, a profile image. Use the horizontal
          lockup where height is short: a header, a footer, a slide strip.
        </p>
      </section>

      {/* With Dark Matter Labs */}
      <section id="with-dml" className="space-y-10">
        <div className="space-y-2">
          <h2 className={H2}>With Dark Matter Labs</h2>
          <p className={LEDE}>
            xCO is an initiative of Dark Matter Labs. Two lockups say so. The endorsed stack
            names the relationship in words, with DM small below. The side-by-side lockup gives
            the two equal standing, split by a rule, with DM&apos;s stamp filling the
            same band as the x.
          </p>
        </div>
        <LockupSet ids={["endorsed", "with-dml"]} />
        <p className={`${RULE} max-w-2xl`}>
          [rule] DM&apos;s logo is DM&apos;s master artwork, drawn as paths. Never retype or
          recolour it: black on light, white on dark. Its clear space is one stamp height, so
          its side of the file is wider than ½x.
        </p>
      </section>

      {/* With projects and partners */}
      <section id="with-projects" className="space-y-10">
        <div className="space-y-2">
          <h2 className={H2}>With projects and partners</h2>
          <p className={LEDE}>
            For a co-host or a project, xCO leads, a drawn × follows, and the other mark sits in
            the cap band. The × is ½x square at half the logotype&apos;s stroke, so it reads as
            part of the mark, not as a typed character. Medulla, which co-hosts the event
            series, is the worked example.
          </p>
        </div>
        <LockupSet ids={["with-project", "with-partner", "with-project-endorsed"]} />
        <ul className={`${RULE} max-w-2xl space-y-2`}>
          <li>[rule] The partner&apos;s mark fits the cap band and is at most {coHost.partnerMaxWidth} caps wide. Scale it down until both are true.</li>
          <li>[rule] A round mark is drawn at {Math.round(coHost.discScale * 100)}% of the cap height, because round forms overshoot optically.</li>
          <li>[rule] Partner marks keep their own colours. On a light ground, a white disc gets a hairline ring for an edge, never a new fill.</li>
          <li>[rule] When Dark Matter Labs must be named too, add the endorsement below the row, flush left. Never put three marks in one row.</li>
        </ul>
      </section>

      {/* Downloads */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="font-mono text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
            Downloads
          </h2>
          <p className="font-body text-[24px] text-xco-ink leading-[26px] max-w-2xl">
            Pick a variant and a lockup, then take the file. SVG is the master format.
          </p>
        </div>

        <LogoDownloads />

        <div className="max-w-2xl space-y-3 pt-2">
          <p className="font-mono text-[0.9375rem] leading-[1.6] text-xco-ink">
            [note] The name lines and the &ldquo;An initiative of&rdquo; label are the one part
            that is live text, set in Untitled Sans, like every label. Dark Matter Labs&apos; logo is DM&apos;s own
            master artwork, drawn as paths: never retype it, and keep its clear space of one
            stamp height. An SVG lockup opened on a machine without Untitled Sans will
            substitute those lines; the glyphs themselves are unaffected. PNG lockups carry
            Untitled Sans in the image itself, so for third parties without the font, send the PNG.
          </p>
        </div>
      </section>

      {/* Watermark (CH-09; the time print is CH-11) */}
      <section id="watermark" className="space-y-8">
        <div className="space-y-2">
          <h2 className="font-mono text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
            Watermark
          </h2>
          <p className="font-body text-[24px] text-xco-ink leading-[26px] max-w-2xl">
            A fourth, quiet use: the full logo at about 7%, behind a footer, cropped by its
            bottom-right corner. It is felt, not read, so it is never the only place the name
            appears, never sits under a control, and is hidden from screen readers. Text over it
            keeps its contrast. Adopted with CH-09 for d.INO products.
          </p>
        </div>
        <div className="relative overflow-hidden max-w-2xl h-[140px] p-6" style={{ border: "1px solid var(--border-default)" }}>
          <p className="relative font-body text-[16px] text-xco-ink-muted">d.INO is made by xCO, at Dark Matter Labs.</p>
          <div className="absolute pointer-events-none" style={{ right: -40, bottom: -30, opacity: 0.07 }} aria-hidden="true">
            <Logo height={170} />
          </div>
        </div>
        <div className="max-w-3xl">
          <ProvisionalChange change={changeLog.find((c) => c.id === "CH-11")!} compact />
        </div>
      </section>

      {/* Misuse */}

      {/* Group marks — their own page since 24 November 2026 */}
      <section className="space-y-2 max-w-2xl">
        <h2 className="font-mono text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
          Group marks
        </h2>
        <p className="font-body text-[24px] text-xco-ink leading-[26px]">
          One lockup with the C&apos;s aperture rotated, for any family of related
          marks.{" "}
          <Link href="/logo/groups" className="underline underline-offset-4 hover:text-xco-dusk-ink">
            See group marks →
          </Link>
        </p>
      </section>

      <section className="space-y-8 pb-16">
        <div className="space-y-2">
          <h2 className="font-mono text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
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
              <p className="font-mono text-[0.9375rem] leading-[1.6] text-xco-ink">
                ✗ {m.label}
              </p>
              <p className="font-mono text-[0.75rem] leading-[1.4] text-xco-ink-muted">
                {m.note}
              </p>
            </li>
          ))}
        </ul>

        <div className="max-w-3xl space-y-4">
          <ProvisionalChange change={changeLog.find((c) => c.id === "CH-08")!} compact />
          <ProvisionalChange change={changeLog.find((c) => c.id === "CH-10")!} compact />
        </div>
      </section>
    </div>
  );
}
