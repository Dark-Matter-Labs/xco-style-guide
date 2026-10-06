// Provisional changes — suggested revisions, shown open to visible iteration.
//
// From the Polyphonic Communication Style Guide v8.1 §11B and the annotation
// contract: "an annotation that proposes a change keeps its target version and
// response state; an adopted revision creates a new version and preserves the
// previous words." This module makes that a working convention for the style
// guide, the wiki and the website. A suggested change is provisional until a
// named person adopts it, and it stays visible — with what it replaces —
// while it is open.
//
// The copy here is written in the plain register (lib/ste.ts), STE-flavoured.

import { highlightTokens, identityScales } from "@/lib/design-tokens";

export type ChangeStatus = "proposed" | "in-review" | "adopted" | "declined" | "superseded";

export const changeStatuses: { id: ChangeStatus; label: string; provisional: boolean; meaning: string }[] = [
  { id: "proposed", label: "Proposed", provisional: true, meaning: "Someone suggested the change. Nobody reviewed it yet." },
  { id: "in-review", label: "In review", provisional: true, meaning: "A named reviewer is reading the change. The current wording still applies." },
  { id: "adopted", label: "Adopted", provisional: false, meaning: "A named person accepted the change. It is the current version. The previous words stay in the record." },
  { id: "declined", label: "Declined", provisional: false, meaning: "A named person did not accept the change. The proposal and the reason stay in the record." },
  { id: "superseded", label: "Superseded", provisional: false, meaning: "A later change replaced this one. Follow the link to the newer record." },
];

export const isProvisional = (s: ChangeStatus) => changeStatuses.find((c) => c.id === s)!.provisional;
export const statusLabel = (s: ChangeStatus) => changeStatuses.find((c) => c.id === s)!.label;

/** The convention, as rules. Each is one instruction. */
export const provisionalRules = [
  { n: "01", rule: "Mark the change where it lives.", detail: "Show a suggested change at its target — the sentence, token, page or section. A log entry alone is not enough." },
  { n: "02", rule: "Say that it is provisional.", detail: "Write the status in words: [PROVISIONAL / proposed]. The lavender fill supports the label. It never carries the meaning alone." },
  { n: "03", rule: "Keep the previous wording visible.", detail: "Show what the change replaces, next to the proposal. A reader must see both to judge the change." },
  { n: "04", rule: "Name who proposed it, when and why.", detail: "Give a person or group, a date and one reason. Do not write “it was decided”." },
  { n: "05", rule: "Give a route to respond.", detail: "Link the pull request, comment thread or steward. An open change asks for a reply." },
  { n: "06", rule: "Adopt by a named decision.", detail: "Adoption creates a new version. Record who adopted it and when. Keep the previous words." },
  { n: "07", rule: "Keep declined and superseded changes.", detail: "Do not delete a proposal. Its record shows how the thinking moved." },
  { n: "08", rule: "Never present a provisional change as current.", detail: "Until adoption, the current wording applies. Say so where the two could be confused." },
] as const;

export interface ChangeRecord {
  id: string;
  title: string;
  /** Where the change lives — a page, token, section or address. */
  target: string;
  href?: string;
  status: ChangeStatus;
  proposedBy: string;
  date: string;
  why: string;
  /** What the change replaces, when there is a previous wording. */
  previous?: string;
  proposed?: string;
  /** Who decided, when, and any note. */
  decision?: string;
  respond?: { label: string; href: string };
}

const PR = (n: number) => ({ label: `PR #${n}`, href: `https://github.com/Dark-Matter-Labs/xco-style-guide/pull/${n}` });

/** The style guide's own change record. Newest first. */
export const changeLog: ChangeRecord[] = [
  {
    id: "CH-07",
    title: "The plain register — STE by licence",
    target: "Tone of voice / the plain register",
    href: "/tone#plain-register",
    status: "in-review",
    proposedBy: "Gurden",
    date: "2026-10-06",
    why: "Decision text, instructions and agent prompts must not be misread. Simplified Technical English removes the main causes of misreading.",
    proposed: "Strict STE for Decision text. STE-flavoured for Explanation. Encounter writing exempt.",
    respond: PR(36),
  },
  {
    id: "CH-06",
    title: "Provisional changes, open to visible iteration",
    target: "Changes / the convention",
    href: "/changes",
    status: "in-review",
    proposedBy: "Gurden",
    date: "2026-10-06",
    why: "Suggested changes to the guide, the wiki and the website must show their status and what they replace.",
    respond: PR(36),
  },
  {
    id: "CH-05",
    title: "PB-1 highlight placements",
    target: "Grammar / Proof block / PB-1",
    href: "/grammar/proof",
    status: "proposed",
    proposedBy: "Style guide (authored reading)",
    date: "2026-10-05",
    why: "The 8.1 source file was not available to confirm which phrases carry each highlight role. The roles follow the 8.1 key. The placements are this site's reading.",
    decision: "Waiting for Indy's review.",
    respond: PR(35),
  },
  {
    id: "CH-04",
    title: "Grammar synced to the style guide v8.1",
    target: "Grammar",
    href: "/grammar",
    status: "adopted",
    proposedBy: "Indy",
    date: "2026-10-05",
    why: "v8.1 adds seven references, the page and margin, the proof block, the situated atlas, material worlds and reusable patterns.",
    previous: "Polyphonic Grammar v6.1",
    proposed: "Polyphonic Grammar v8.1",
    decision: "Merged 2026-10-05.",
    respond: PR(35),
  },
  {
    id: "CH-03",
    title: "The v8.1 palette — Field, Signal, Matter",
    target: "Colour / every token",
    href: "/colour",
    status: "adopted",
    proposedBy: "Indy",
    date: "2026-10-05",
    why: "v8.1 sets one colour contract from three identity scales.",
    previous: "paper #f4f1e9 · ink #20201e · dusk #ff5a00",
    proposed: "paper #F6F1E5 · ink #101F24 · dusk #F47743",
    decision: "Adopted in chat, merged 2026-10-05.",
    respond: PR(34),
  },
  {
    id: "CH-02",
    title: "Writing practice — five habits before a text goes out",
    target: "Tone of voice / writing practice",
    href: "/tone#writing-practice",
    status: "adopted",
    proposedBy: "Sarah, with Indy's caveat on attribution",
    date: "2026-10-05",
    why: "Team feedback on brevity, audience, attribution, positionality and a critical pause in AI-assisted drafting.",
    decision: "Adopted and merged 2026-10-05. Open item: Sarah to confirm how she is credited.",
    respond: PR(33),
  },
  {
    id: "CH-01",
    title: "Voice principles — “Radical conjecture, held with care.”",
    target: "Tone of voice / voice principles",
    href: "/tone",
    status: "adopted",
    proposedBy: "Indy",
    date: "2026-10-05",
    why: "Indy drafted how xCO's voice should change.",
    decision: "Adopted and merged 2026-10-05. Open item: Indy to review the integrated page.",
    respond: PR(31),
  },
];

// ── Exports for the wiki and the website ─────────────────────────────

const provisionalFill = highlightTokens.find((h) => h.id === "provisional")!;

/** How one change reads in Markdown — a pattern for the wiki. */
export function changeMarkdown(c: ChangeRecord): string {
  const head = `> **[${isProvisional(c.status) ? "PROVISIONAL" : "RECORD"} / ${statusLabel(c.status).toLowerCase()}]** ${c.id} · ${c.target} · proposed by ${c.proposedBy} · ${c.date}`;
  return [
    head,
    ">",
    c.previous && c.proposed ? `> ~~${c.previous}~~ → **${c.proposed}**` : c.proposed ? `> **${c.proposed}**` : null,
    c.previous || c.proposed ? ">" : null,
    `> Why: ${c.why}`,
    c.decision ? `> Decision: ${c.decision}` : null,
    c.respond ? `> Respond: [${c.respond.label}](${c.respond.href})` : null,
  ]
    .filter((l): l is string => l !== null)
    .join("\n");
}

/** The convention as Markdown, with a blank template for wiki pages. */
export function provisionalMarkdown(): string {
  return [
    "## Provisional changes — open to visible iteration",
    "",
    "A suggested change is provisional until a named person adopts it. Show it where it lives, with what it replaces.",
    "",
    ...provisionalRules.map((r) => `${Number(r.n)}. **${r.rule}** ${r.detail}`),
    "",
    "### Statuses",
    "",
    ...changeStatuses.map((s) => `- **${s.label}**${s.provisional ? " (provisional)" : ""} — ${s.meaning}`),
    "",
    "### Template",
    "",
    "```markdown",
    "> **[PROVISIONAL / proposed]** CH-00 · <page or section> · proposed by <name> · <YYYY-MM-DD>",
    ">",
    "> ~~<current wording>~~ → **<proposed wording>**",
    ">",
    "> Why: <one reason>",
    "> Respond: [<pull request or thread>](<link>)",
    "```",
    "",
  ].join("\n");
}

/** The instruction an agent follows when it suggests a change to a wiki page. */
export function provisionalPrompt(): string {
  return [
    "SUGGESTED CHANGES ARE PROVISIONAL:",
    "- Do not overwrite the current wording. Show your change as a provisional block at its target.",
    "- Use this form: “> **[PROVISIONAL / proposed]** <id> · <target> · proposed by <agent or person> · <date>”, then “~~current~~ → **proposed**”, then “Why:” with one reason.",
    "- Keep the current wording visible. Do not delete it.",
    "- Do not mark a change adopted. Only a named person adopts a change.",
  ].join("\n");
}

/** A website pattern: semantic del/ins with a status label in words. */
export const provisionalHTML = `<aside class="xco-change" data-status="proposed" aria-label="Provisional change CH-00">
  <p class="xco-change__label">[PROVISIONAL / proposed] CH-00 · proposed by Indy · 2026-10-06</p>
  <p>
    <del class="xco-change__previous">The current wording.</del>
    <ins class="xco-change__proposed">The proposed wording.</ins>
  </p>
  <p class="xco-change__why">Why: one reason, in one sentence.</p>
  <a class="xco-change__respond" href="#">Respond to this change</a>
</aside>`;

export function provisionalCSS(): string {
  return `.xco-change {
  border-left: 2px dashed ${identityScales.field[600]};
  padding: .75rem 1rem;
  margin-block: 1rem;
}
.xco-change__label { font: .75rem/1.5 ui-monospace, monospace; letter-spacing: .04em; }
.xco-change__previous { color: ${identityScales.matter[700]}; text-decoration-thickness: 1px; }
.xco-change__proposed {
  text-decoration: none;
  color: ${identityScales.matter[900]};
  background: ${provisionalFill.hex}; /* 8.1 local role: provisional state */
  padding: .04em .17em;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}
.xco-change__previous::before { content: "Current: "; font-style: italic; }
.xco-change__proposed::before { content: "Proposed: "; font-style: italic; }
.xco-change[data-status="adopted"] { border-left-style: solid; }
.xco-change[data-status="adopted"] .xco-change__proposed { background: none; }`;
}
