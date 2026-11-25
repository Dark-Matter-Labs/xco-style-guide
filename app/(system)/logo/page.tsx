import Link from "next/link";
import { WIP } from "@/components/WIP";
import { Logo } from "@/components/xco/Logo";
import { changeLog } from "@/lib/provisional";
import { buildEndorsementStripSvg, logoGeometry, logoVariants } from "@/lib/logo";
import { BRAND_NAME } from "@/lib/design-tokens";
import { ProvisionalChange } from "@/components/xco";
import { LogoDownloads } from "./LogoDownloads";
import { CopyButton } from "@/components/CopyButton";
import { signatureHtml, signatureImages } from "@/lib/email-signature";
import { ConstructionDiagram } from "./ConstructionDiagram";

const MISUSE = [
  { label: "Don't retype it", note: "The mark is drawn geometry, not set type. Never rebuild it in a font." },
  { label: "Don't recolour freely", note: "Three colour variants exist, and one quiet fourth use: a faint footer watermark at about 7%, cropped by a corner (CH-09). The x may carry dusk; nothing else may carry colour." },
  { label: "Don't stretch it", note: "Scale proportionally. The stroke weight is tied to the cap height." },
  { label: "Don't add effects", note: "No shadows, gradients, outlines, or rounded caps. Terminals are cut flat." },
  { label: "Don't reflow it", note: "The gaps are optically tuned. Never re-space, stack, or reorder the glyphs. One exception: the x may leave the mark as operator, under the rules on /logo/x (CH-08). At rest it is always in place." },
  { label: "Don't box it", note: "Clear space is built into the file. Do not add a frame or a container." },
  { label: "Don't set DML beside it", note: "Dark Matter Labs appears in the endorsement strip, in a zone of its own, never next to the mark or inside its clear space (CH-15)." },
];

const DML_RULES = [
  "The xCO mark stands alone. Nothing from Dark Matter Labs enters its clear space.",
  "DML appears in the endorsement strip: \u201cAn initiative of\u201d in Untitled Sans, then DM\u2019s own lockup from master artwork.",
  "The strip lives in a different zone from the mark: a footer, back cover, colophon or a signature\u2019s last line.",
  "Size the strip to its zone. DM\u2019s stamp is at least 16px tall on screen and 6mm in print.",
  "Where the strip can\u2019t reach that size (avatars, favicons, anything under 64px), use xCO alone.",
  "DM\u2019s own rules hold: black on light, white on dark, never dusk, clear space one stamp height.",
  "Partners share the mark\u2019s zone (xCO \u00d7 Medulla). DML stays in the strip.",
  "The attached \u201cEndorsed by Dark Matter Labs\u201d lockup stays as a fallback, for a single file someone else places alone.",
];

/** The strip file itself, inline, so the page shows exactly what the download holds. */
const stripMarkup = (variant: "ink" | "paper") =>
  buildEndorsementStripSvg({ variant }).replace(/^<\?xml[^>]*>\s*/, "");

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
          <Logo height={110} xStyle="serif" variant="accent" />
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
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="font-mono text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
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
        <p className="font-mono text-[0.75rem] leading-[1.4] text-xco-ink-muted">
          Dashed line marks the file edge — the clear space is the gap between it and the glyphs.
        </p>
      </section>

      {/* Downloads */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="font-mono text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
            Variants and downloads
          </h2>
          <p className="font-body text-[24px] text-xco-ink leading-[26px] max-w-2xl">
            Pick a variant, then take the file. SVG is the master format.
          </p>
        </div>

        <LogoDownloads />

        <div className="max-w-2xl space-y-3 pt-2">
          <p className="font-mono text-[0.9375rem] leading-[1.6] text-xco-ink">
            [note] The descriptor and the &ldquo;An initiative of&rdquo; label are the one part
            that is live text, set in Untitled Sans, like every label. The descriptor is tracked
            to span the mark flush on both edges. Dark Matter Labs&apos; logo is DM&apos;s own
            master artwork, drawn as paths: never retype it, and keep its clear space of one
            stamp height. An SVG lockup opened on a machine without Untitled Sans will
            substitute those lines; the glyphs themselves are unaffected. PNG lockups carry
            Untitled Sans in the image itself, so for third parties without the font, send the PNG.
          </p>
        </div>
      </section>

      {/* Dark Matter Labs (CH-15) */}
      <section id="dark-matter-labs" className="space-y-8">
        <div className="space-y-2">
          <h2 className="font-mono text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
            Dark Matter Labs
          </h2>
          <p className="font-body text-[24px] text-xco-ink leading-[26px] max-w-2xl">
            xCO is an initiative of Dark Matter Labs. The mark leads alone, and DML appears in
            an endorsement strip that sits in a zone of its own. The words name the relation,
            so nobody has to ask which part is the logo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(["ink", "paper"] as const).map((v) => (
            <div
              key={v}
              className="flex flex-col justify-between gap-16 p-8 min-h-[320px]"
              style={{ background: logoVariants.find((x) => x.id === v)!.bg ?? undefined, border: "1px solid var(--border-default)" }}
            >
              <Logo height={56} inline variant={v} label="xCO" />
              <div
                className="max-w-[300px] [&>svg]:w-full [&>svg]:h-auto"
                dangerouslySetInnerHTML={{ __html: stripMarkup(v) }}
              />
            </div>
          ))}
        </div>
        <p className="font-mono text-[0.75rem] leading-[1.4] text-xco-ink-muted">
          Two zones: the mark at the head, the strip at the foot. Download the strip under Variants and downloads.
        </p>

        <ol className="max-w-3xl space-y-0">
          {DML_RULES.map((r, i) => (
            <li key={r} className="grid grid-cols-[3ch_1fr] gap-3 py-2 font-body text-[16px] leading-[1.5] text-xco-ink" style={{ borderTop: "1px solid var(--border-default)" }}>
              <span className="text-xco-ink-muted tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <span>{r}</span>
            </li>
          ))}
        </ol>

        {/* Email signature: the same two zones, as images mail clients can show */}
        <div id="email-signature" className="space-y-4 max-w-3xl">
          <h3 className="font-mono text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
            Email signature
          </h3>
          <p className="font-body text-[16px] leading-[1.5] text-xco-ink">
            Name and role, the mark, a hairline, then the strip. Mail clients show neither SVG nor
            web fonts, so both marks are PNGs at twice their size, and the words fall back to
            Arial. The mark&apos;s cap is 30px and DM&apos;s stamp {signatureImages.strip.h}px, each at
            its minimum or above, with one stamp of space each side of the hairline.
            Replace [Name] and [Role] after pasting.
          </p>
          <div className="p-6" style={{ background: "#FFFFFF", border: "1px solid var(--border-default)" }}>
            <div dangerouslySetInnerHTML={{ __html: signatureHtml("") }} />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <CopyButton text={signatureHtml()} label="Copy signature HTML" />
            <span className="font-mono text-[0.75rem] leading-[1.4] text-xco-ink-muted">
              Images load from xco-style-guide.vercel.app/email. Regenerate with{" "}
              <code className="font-code">npm run email</code> if the logo changes.
            </span>
          </div>
        </div>

        <div className="max-w-3xl">
          <ProvisionalChange change={changeLog.find((c) => c.id === "CH-15")!} compact />
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
