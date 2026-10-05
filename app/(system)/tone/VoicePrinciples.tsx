import type { CSSProperties, ReactNode } from "react";
import { CopyButton } from "@/components/CopyButton";
import {
  voice,
  strands,
  voicePrinciples,
  voiceSynthesis,
  compass,
  voiceMarkdown,
  type StrandId,
} from "@/lib/voice-principles";

const LABEL = "font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase";
const BODY = "font-body text-[24px] text-xco-ink leading-[26px]";
const MONO = "font-mono font-medium text-[0.9375rem] leading-[1.6]";
const SMALL = "font-mono font-medium text-[0.75rem] leading-[1.5]";

// The three strands as highlighter tints, after the source's key (mint, blue,
// pink), drawn from the palette: teal (aqua), navy (lavender) and dusk
// (peach). Ocean beside teal read as one blue at tint strength; navy does not.
// Tints sit behind ink text, so they never carry the text's contrast; and the
// strand is always named alongside — colour reinforces, the label carries.
const STRAND_TINT: Record<StrandId, { hue: string; pct: number }> = {
  radicality: { hue: "var(--xco-teal)", pct: 26 },
  conjecture: { hue: "var(--xco-navy)", pct: 14 },
  care: { hue: "var(--xco-dusk)", pct: 20 },
};

function tint(strand: StrandId, scale = 1): CSSProperties {
  const { hue, pct } = STRAND_TINT[strand];
  return {
    background: `color-mix(in srgb, ${hue} ${Math.round(pct * scale)}%, transparent)`,
    boxDecorationBreak: "clone",
    WebkitBoxDecorationBreak: "clone",
    padding: "0 0.12em",
  };
}

function Mark({ strand, children }: { strand: StrandId; children: ReactNode }) {
  return <mark className="text-xco-ink" style={tint(strand)}>{children}</mark>;
}

const strandName = (id: StrandId) => strands.find((s) => s.id === id)?.name ?? id;

export function VoicePrinciples() {
  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="space-y-6">
        <p className={`${SMALL} text-xco-ink-muted uppercase tracking-widest`}>{voice.eyebrow}</p>
        <h2 className="doc-display text-xco-ink">
          {strands.map((s, i) => (
            <span key={s.id}>
              <Mark strand={s.id}>{s.titleWord}</Mark>
              {i < strands.length - 1 ? " " : ""}
            </span>
          ))}
        </h2>
        <p className={`${BODY} max-w-2xl`}>{voice.dek}</p>
        <p className={`${MONO} text-xco-ink`}>[proposition] {voice.status}</p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2" aria-label="The three strands of the voice">
          {strands.map((s) => (
            <li key={s.id} className={`${SMALL} text-xco-ink flex items-center gap-2`}>
              <span aria-hidden="true" className="inline-block w-4 h-3" style={tint(s.id, 2)} />
              {s.name}
            </li>
          ))}
        </ul>
      </section>

      {/* The seven principles, each with its editorial decision in the margin */}
      <section className="space-y-0" aria-label="Seven voice principles">
        {voicePrinciples.map((p) => (
          <article
            key={p.n}
            className="grid grid-cols-1 lg:grid-cols-[180px_1fr_260px] gap-x-10 gap-y-4 py-10"
            style={{ borderTop: "1px solid var(--border-default)" }}
          >
            <p className={`${SMALL} text-xco-ink-muted uppercase tracking-widest`}>
              {p.n} / {p.move}
            </p>
            <div className="space-y-4 min-w-0">
              <h3 className="font-display text-[36px] leading-[40px] text-xco-ink">
                <Mark strand={p.strand}>{p.line}</Mark>
              </h3>
              <p className={`${BODY} max-w-2xl`}>{p.body}</p>
              {p.n === "07" && <p className={`${BODY} max-w-2xl`}>{voiceSynthesis}</p>}
            </div>
            <aside className="space-y-2 lg:pt-2" aria-label={`Decision ${p.n}`}>
              <p className={`${SMALL} text-xco-ink-muted uppercase tracking-widest`}>
                Decision {p.n} · {p.decision.name}
              </p>
              <p className={`${MONO} text-xco-ink`}>{p.decision.title}</p>
              <p className={`${SMALL} text-xco-ink-muted`}>{p.decision.rationale}</p>
              <p className={`${SMALL} text-xco-ink-muted`}>Strand: {strandName(p.strand)}</p>
            </aside>
          </article>
        ))}
      </section>

      {/* The editorial compass */}
      <section className="space-y-6" style={{ borderTop: "1.5px solid var(--xco-ink)" }}>
        <h2 className={`${LABEL} pt-6`}>The editorial compass</h2>
        <blockquote className="font-display text-[44px] leading-[48px] text-xco-ink max-w-3xl">
          {compass.clauses.map((c, i) => (
            <span key={c.text}>
              <Mark strand={c.strand}>{c.text}</Mark>
              {i < compass.clauses.length - 1 ? <br /> : null}
            </span>
          ))}
        </blockquote>
        <p className={`${BODY} max-w-2xl`}>{compass.coda}</p>
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <CopyButton text={voiceMarkdown()} label="Copy as Markdown — for the wiki and website" />
          <p className={`${SMALL} text-xco-ink-muted`}>{voice.source}</p>
        </div>
      </section>
    </div>
  );
}
