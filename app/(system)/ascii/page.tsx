import Link from "next/link";
import { WIP } from "@/components/WIP";
import { RAMP } from "@/app/(generators)/event-series/render/ascii";
import { AsciiSpecimens } from "./AsciiSpecimens";

// ASCII fields as used on the optionality site (Dark-Matter-Labs/eco,
// components/narrative/AsciiField.tsx) and on the event cards
// (app/(generators)/event-series/render/ascii.ts). The rules below are read off
// those two implementations.

const LABEL = "font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink";
const BODY = "font-body text-[24px] text-xco-ink leading-[26px]";

const RULES = [
  "Use the ramp, light to dense, and nothing else. There are no solid blocks (█ ▓): the densest glyph is @, so dense bands still read as texture.",
  "Set the glyphs in Untitled Sans on a square cell, not in a monospace. The cell is 13px on the site, 10px on narrow screens. On the cards it is 20px per 1000px of the card's short side.",
  "Draw glyphs in the colour of the surface they sit on: ink on chalk, chalk on Field. Density and opacity carry the image, not hue.",
  "Use one accent at most: the ember, for the collapse's beacons. Use no more than three beacons.",
  "Keep the field quiet behind text. On the site it fades under every text block, so words keep their contrast. Never set body text over a dense band.",
  "Treat the field as ground, not content. Hide it from screen readers (aria-hidden). Where it stands as an image, the alt text says it is a generated pattern, not a record.",
  "Motion answers the reader. On the site the field follows scroll. On a card it loops, and the last frame meets the first. With reduced motion, show one still frame.",
  "Choose the field for what it means: collapse, storm, eye and lattice carry the optionality narrative. Line, ripples and ridges are for listening. Never use one only as decoration.",
  "Use ASCII for fields only. Never set the wordmark, headings or words as ASCII art, and never use box-drawing frames.",
];

export default function AsciiPage() {
  return (
    <div className="doc-wrap py-12 space-y-16">
      <header className="flex items-baseline justify-between pb-6">
        <h1 className="doc-display text-xco-ink">ASCII</h1>
        <WIP variant="version" />
      </header>

      <section className="max-w-2xl space-y-4">
        <p className={BODY}>
          An ASCII field is a scalar field drawn in glyphs: each cell takes a character from a density
          ramp. It is the ground of the optionality site, where one field moves from collapse, through
          a storm and its calm eye, to an ordered lattice as the reader scrolls. The event cards use the
          same fields, one state at a time.
        </p>
        <p className={BODY}>
          It suits xCO because it is computational and plain about it. It is generated, and it looks
          generated: it is not a picture of anything.
        </p>
      </section>

      <section>
        <h2 className={`${LABEL} tracking-widest uppercase mb-4`}>Ramp</h2>
        <p
          className="font-body text-[36px] leading-[40px] text-xco-ink whitespace-pre overflow-x-auto"
          aria-label="Ramp: space, then dot, middle dot, comma, colon, semicolon, i r s x n v u o, chi, hash, percent, at"
        >
          {RAMP}
        </p>
        <p className={`${LABEL} mt-2 text-xco-ink-muted`}>Light → dense. Space is the lightest step.</p>
      </section>

      <section>
        <h2 className={`${LABEL} tracking-widest uppercase mb-8`}>Fields</h2>
        <AsciiSpecimens />
        <p className={`${LABEL} mt-8`}>
          To see them moving, or to export one, use the{" "}
          <Link href="/event-series" className="underline underline-offset-4">event-series generator</Link>.
        </p>
      </section>

      <section className="pb-12">
        <h2 className={`${LABEL} tracking-widest uppercase mb-6`}>Rules</h2>
        <ul className="space-y-3 max-w-2xl">
          {RULES.map((rule, i) => (
            <li key={i} className="flex items-baseline gap-4">
              <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-dusk-ink shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className={BODY}>{rule}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
