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
    id: "CH-14",
    title: "Dark Matter Labs shows in an endorsement strip, apart from the mark",
    target: "Logo / Dark Matter Labs",
    href: "/logo#dark-matter-labs",
    status: "adopted",
    proposedBy: "Gurden, from team feedback (Darko, Prateek)",
    date: "2026-11-25",
    why: "Darko could not tell which part of the logo was the logo, DML or xCO. Prateek asked for both: xCO at the centre, but DML holds the brand value today. Four options were drawn on real surfaces: two zones, side by side, an attached endorsement, and a clean mark with a detached strip.",
    previous: "One attached lockup: the descriptor, then \u201cAn initiative of\u201d and DM\u2019s lockup at a quarter of cap height, stacked under the mark. Elsewhere, DML was plain text or absent.",
    proposed: "The xCO mark stands alone. DML appears in an endorsement strip, \u201cAn initiative of\u201d and DM\u2019s own lockup on one line, set in a different zone: footer, back cover, colophon, a signature\u2019s last line. DM\u2019s stamp at least 16px on screen and 6mm in print; below that, xCO alone. The attached lockup stays as a fallback.",
    decision: "Adopted by Gurden, 25 Nov 2026 (option C + A).",
    respond: PR(0),
  },
  {
    id: "CH-13",
    title: "One weight: Untitled at 400",
    target: "Typography / weights",
    href: "/typography",
    status: "adopted",
    proposedBy: "Gurden",
    date: "2026-11-24",
    why: "Only Untitled Sans 400 ships, but the tokens listed a 500 and every label asked for it. The browser could not show it, so the system described a weight it did not have.",
    previous: "Untitled Sans 400 and 500 (medium); labels set in medium.",
    proposed: "Untitled at 400 only. Hierarchy comes from size, case and tracking, never weight.",
    decision: "Adopted by Gurden, 24 Nov 2026 (D18).",
  },
  {
    id: "CH-12",
    title: "PNG exports set in Untitled, not DM Mono",
    target: "Typography / the PNG export",
    href: "/typography",
    status: "adopted",
    proposedBy: "Gurden",
    date: "2026-11-24",
    why: "Labels are Untitled Sans, but every PNG from the instruments and the logo downloads set its text in DM Mono, the one face the rasteriser could load. The export now uses the licensed faces the site already serves.",
    previous: "PNG exports render all text in DM Mono, fetched from Google Fonts, until the rasteriser can load Untitled.",
    proposed: "PNG exports render in Untitled Sans and Untitled Serif, decoded from the site's own web fonts. Characters Untitled lacks fall back to Noto, one glyph at a time. DM Mono is for code only.",
    decision: "Adopted by Gurden, 24 Nov 2026 (F01).",
  },
  {
    id: "CH-11",
    title: "Exports may carry a time print: a faint asemic watermark of the minute they were made",
    target: "Logo / Watermark",
    href: "/logo#watermark",
    status: "proposed",
    proposedBy: "Indy",
    date: "2026-11-24",
    why: "Every snapshot that leaves the instruments carries a mark of its moment. The marks are grown from its own words, and the minute is printed in words beside them.",
    previous: "The full logo may appear at about 7% as a decorative footer watermark, cropped by a corner, never at a size where it must be read.",
    proposed: "Exports from the instruments may also carry a time print: an asemic sheet at about 6%, grown from the artwork's own words and seeded by the minute it was made, with that minute printed along one edge. It is decorative and proves nothing.",
    decision: "Waiting for a named adopter.",
    respond: PR(56),
  },
  {
    id: "CH-10",
    title: "The logotype's parts may be used as marks in the asemic script",
    target: "Logo / Misuse",
    href: "/asemic",
    status: "proposed",
    proposedBy: "Gurden",
    date: "2026-11-24",
    why: "The asemic script gives xCO's language personality and character. Its beads are the logotype's O and C, and the x in dusk opens the thread.",
    previous: "Don't reflow it. Never re-space, stack, or reorder the glyphs.",
    proposed: "The O, the C with its 100° aperture, and the x may appear as marks in the asemic script on /asemic. The logotype itself does not change.",
    decision: "Waiting for a named adopter.",
    respond: PR(54),
  },
  {
    id: "CH-09",
    title: "The x may rest as Dino in d.INO; the logo may sit faint as a watermark",
    target: "Logo / x as operator",
    href: "/logo/x#dino",
    status: "adopted",
    proposedBy: "Gurden",
    date: "2026-11-19",
    why: "d.INO was made by xCO and needs its own identity in the same family. Dino, d.INO's guide, is redrawn from the x, so a person who knows one knows the other.",
    previous: "The x may leave the mark as operator, under the rules on /logo/x. At rest it is always the logo's x, in place.",
    proposed: "Inside d.INO products the x may rest as Dino: its arms grow into legs, tail and neck, and a small x at the crossing, the heart, is the logo's x at rest. The full logo may also appear at about 7% as a decorative footer watermark, cropped by a corner, never at a size where it must be read.",
    decision: "Adopted by Gurden, 19 Nov 2026.",
  },
  {
    id: "CH-08",
    title: "The x may leave the mark",
    target: "Logo / Misuse",
    href: "/logo/x",
    status: "adopted",
    proposedBy: "Gurden",
    date: "2026-11-16",
    why: "The x is the operator in the logotype. On the website it can act on the page — keep the reader's place, frame, walk and expand — under fixed rules.",
    previous: "Don't reflow it. Never re-space, stack, or reorder the glyphs.",
    proposed: "The x may leave the mark as operator, under the rules on /logo/x. At rest it is always the logo's x, in place.",
    decision: "Adopted by Gurden, 24 Nov 2026.",
  },
  {
    id: "CH-07",
    title: "The plain register — STE by licence",
    target: "Tone of voice / the plain register",
    href: "/tone#plain-register",
    status: "adopted",
    proposedBy: "Gurden",
    date: "2026-10-06",
    why: "Decision text, instructions and agent prompts must not be misread. Simplified Technical English removes the main causes of misreading.",
    proposed: "Strict STE for Decision text. STE-flavoured for Explanation. Encounter writing exempt.",
    decision: "Adopted by Gurden, merged 2026-10-06.",
    respond: PR(36),
  },
  {
    id: "CH-06",
    title: "Provisional changes, open to visible iteration",
    target: "Changes / the convention",
    href: "/changes",
    status: "adopted",
    proposedBy: "Gurden",
    date: "2026-10-06",
    why: "Suggested changes to the guide, the wiki and the website must show their status and what they replace.",
    decision: "Adopted by Gurden, merged 2026-10-06.",
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
    decision: "Closed by Gurden, 24 Nov 2026, in the year-end clean-up. Indy's review was not received.",
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
    decision: "Adopted and merged 2026-10-05. The open item, Sarah to confirm how she is credited, was closed by Gurden, 24 Nov 2026, in the year-end clean-up.",
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
    decision: "Adopted and merged 2026-10-05. The open item, Indy to review the integrated page, was closed by Gurden, 24 Nov 2026, in the year-end clean-up.",
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
.xco-change__label { font: .75rem/1.5 "Untitled Sans", system-ui, sans-serif; letter-spacing: .04em; }
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
