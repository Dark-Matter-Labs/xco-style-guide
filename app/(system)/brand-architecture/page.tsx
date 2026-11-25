import Link from "next/link";
import type { Metadata } from "next";
import { WIP } from "@/components/WIP";
import { GroupMark, Logo, ProvisionalChange } from "@/components/xco";
import { groupMarks } from "@/lib/group-marks";
import { changeLog } from "@/lib/provisional";

export const metadata: Metadata = { title: "Brand architecture — xCO" };

const BODY = "font-body text-[24px] text-xco-ink leading-[26px]";
const MONO = "font-mono text-[0.9375rem] leading-[1.6]";
const LABEL = "font-mono text-[0.75rem] leading-[1.4] text-xco-ink-muted uppercase tracking-widest";

const change = changeLog.find((c) => c.id === "CH-16")!;
const groups = ["positions-options-stewards", "oceans-continuity-studio"].map(
  (id) => groupMarks.find((m) => m.id === id)!,
);

const tiers = [
  {
    tier: "Strict — must",
    rules: [
      "The xCO logotype appears on every outward artefact, unaltered, from the downloads on /logo.",
      "The group name is set in Untitled Sans 400: in the descriptor slot under the logotype, or leading on its own with an endorsement strip, “an xCO group” and the logotype, in a zone of its own.",
      "When a group leads, the endorsement strip is required on every outward surface that can hold it. Below 64px (avatars, favicons) the group mark goes alone. Partners share the name’s zone; xCO stays in the strip.",
      "The group mark is its aperture avatar from /logo/groups, and nothing else. No redrawn, recoloured or new marks.",
      "Untitled Sans for all text. DM Mono for code only.",
      "The x may carry dusk. Nothing else carries colour.",
      "Text and marks pass the accessibility gate (npm run a11y) before they go out.",
      "Any departure from these rules is a change record on /changes, with a Respond link.",
    ],
  },
  {
    tier: "Recommended — should",
    rules: [
      "Options: navy and ink grounds, the diagnostic mode (Three Regimes, territory, option field), the plain register for positions.",
      "Studio: ocean and teal grounds, the sensory mode (growth, scanlines, tritone imagery), the open register.",
      "Start from the Docs and Slides templates.",
      "Follow the voice principles on /tone: precise about what is known, explicit about what is being tested.",
      "Mark drafts and versions (v0.1) as the rest of xCO does.",
    ],
  },
  {
    tier: "Free — may",
    rules: [
      "Titles and project names inside a piece, at any size the layout needs.",
      "Their own photography and field imagery, treated or not.",
      "Diagram content and layout within the grid.",
      "Internal docs, chats and working files: any layout. The group avatar is enough.",
      "Co-branded pieces with partners: logos at equal optical height, divided by a rule.",
    ],
  },
];

const contexts = [
  { ctx: "Funder or investor deck", lead: "xCO leads. The group sits in the descriptor slot." },
  { ctx: "Public report or paper", lead: "The group leads. The endorsement strip sits on the back cover or colophon." },
  { ctx: "Workshop or event", lead: "The group leads. The strip sits in the footer." },
  { ctx: "Social post", lead: "From xCO’s accounts, as xCO. A group channel uses its avatar, with the strip in its profile." },
  { ctx: "Partner co-brand", lead: "The group name beside the partner at equal height; the strip in the footer." },
  { ctx: "Internal doc, chat, working file", lead: "The group avatar. Free." },
  { ctx: "A product or tool a group builds", lead: "xCO by default. It may earn its own identity by change record, as d.INO did (CH-09), with “made by xCO” or the faint footer watermark." },
];

function Endorsed({ name }: { name: string }) {
  return (
    <div className="space-y-6">
      <p className="font-body text-[28px] leading-[30px] text-xco-ink">{name}</p>
      <div className="flex items-center gap-2 pt-3" style={{ borderTop: "1px solid var(--border-default)" }}>
        <span className={LABEL}>An</span>
        <Logo height={28} />
        <span className={LABEL}>group</span>
      </div>
    </div>
  );
}

export default function BrandArchitecturePage() {
  return (
    <div className="doc-wrap py-12 space-y-24">
      <header className="space-y-4 pb-6">
        <div className="flex items-baseline justify-between">
          <h1 className="doc-display text-xco-ink">Brand architecture</h1>
          <WIP variant="version" />
        </div>
        <p className={`${BODY} max-w-2xl`}>
          xCO Options and xCO Studio are xCO groups, not separate brands. Each may lead
          with its own name, endorsed by xCO, the way xCO is endorsed by Dark Matter Labs.
          Neither has a logo of its own: the group mark is the only mark.
        </p>
        <div className="max-w-3xl">
          <ProvisionalChange change={change} />
        </div>
      </header>

      <section className="space-y-8">
        <h2 className={`${MONO} text-xco-ink tracking-widest uppercase`}>The two groups</h2>
        <div className="grid gap-12 md:grid-cols-2">
          {groups.map((m) => (
            <div key={m.id} className="space-y-6">
              <div className="flex items-center gap-4">
                <GroupMark mark={m} size={64} />
                <div>
                  <p className={`${MONO} text-xco-ink`}>{m.id === "oceans-continuity-studio" ? "xCO Studio" : "xCO Options"}</p>
                  <p className={`${MONO} text-xco-ink-muted`}>{m.name} · {m.aperture}°</p>
                </div>
              </div>
              <Endorsed name={m.id === "oceans-continuity-studio" ? "Oceans Continuity Studio" : "Positions & Options Stewards"} />
            </div>
          ))}
        </div>
        <p className={`${MONO} max-w-2xl text-xco-ink`}>
          [rule] When a group leads, its name stands alone and xCO appears in an
          endorsement strip, “an xCO group” and the logotype, in a zone of its own:
          footer, back cover, colophon. The same pattern as the Dark Matter Labs strip on /logo.
        </p>
      </section>

      <section className="space-y-8">
        <h2 className={`${MONO} text-xco-ink tracking-widest uppercase`}>Three tiers</h2>
        <div className="grid gap-10 md:grid-cols-3">
          {tiers.map((t) => (
            <div key={t.tier} className="space-y-4">
              <h3 className={`${LABEL} pb-2`} style={{ borderBottom: "1px solid var(--border-default)" }}>{t.tier}</h3>
              <ul className="space-y-3">
                {t.rules.map((r) => (
                  <li key={r} className={`${MONO} text-xco-ink`}>{r}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-8 pb-16">
        <h2 className={`${MONO} text-xco-ink tracking-widest uppercase`}>Which brand leads</h2>
        <p className={`${BODY} max-w-2xl`}>
          The same for both groups. xCO leads where xCO is the party being funded or
          speaking; the group leads where its own work is the subject.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse">
            <thead>
              <tr>
                <th scope="col" className={`${LABEL} text-left py-3 pr-6`}>Context</th>
                <th scope="col" className={`${LABEL} text-left py-3`}>Who leads</th>
              </tr>
            </thead>
            <tbody>
              {contexts.map((c) => (
                <tr key={c.ctx} style={{ borderTop: "1px solid var(--border-default)" }}>
                  <th scope="row" className={`${MONO} text-xco-ink text-left font-normal align-top py-3 pr-6`}>{c.ctx}</th>
                  <td className={`${MONO} text-xco-ink align-top py-3`}>{c.lead}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={`${MONO} max-w-2xl text-xco-ink-muted`}>
          Group marks and their audit live on <Link href="/logo/groups" className="underline underline-offset-4 hover:text-xco-dusk-ink">/logo/groups</Link>.
        </p>
      </section>
    </div>
  );
}
