"use client";

// Print-ready holiday cards: one unique folded A6 card per name, matching each
// person's animated card. Paste names, check the previews, then print to PDF.

import { useState } from "react";
import { cardName } from "@/lib/holiday-card/pattern";
import { CardSheets, type Recipient } from "./CardSheets";

const CARD_URL = "https://claude.ai/artifact/HB4ZaJgUoeCTN3Z4BE7nn9";
const SAMPLE = "Ana\nIndy Johar | With thanks for a year of thinking out loud together.\nRobyn";
const LABEL = "block font-mono text-[0.75rem] uppercase tracking-widest text-xco-ink-muted";

/** One line per card: "Name", or "Name | printed message". A name alone leaves the inside blank to write on. */
function parse(list: string, url: string): { recipients: Recipient[]; unlinkable: string[] } {
  const recipients: Recipient[] = [], unlinkable: string[] = [];
  for (const line of list.split("\n")) {
    const [rawName, ...rest] = line.split("|");
    const n = cardName(rawName ?? "");
    if (!n.display) continue;
    if (!n.linkable) unlinkable.push(n.display);
    const message = rest.join("|").trim();
    recipients.push({ display: n.display, seedName: n.seedName, link: `${url.trim()}#${n.slug}`, message: message || undefined });
  }
  return { recipients, unlinkable };
}

export function HolidayCards() {
  const [list, setList] = useState(SAMPLE);
  const [url, setUrl] = useState(CARD_URL);
  const [withQr, setWithQr] = useState(false); // off until the QR encoder is approved; the slot is a placeholder
  const { recipients, unlinkable } = parse(list, url);
  const toWrite = recipients.filter((r) => !r.message).length;

  return (
    <main id="main" className="min-h-screen bg-xco-paper p-6 print:bg-white print:p-0">
      {/* Each page is A5 landscape plus 3 mm bleed; the print shop trims and folds. */}
      <style>{"@page { size: 216mm 154mm; margin: 0 }"}</style>

      <section aria-labelledby="hc-title" className="mx-auto mb-10 max-w-3xl space-y-5 print:hidden">
        <h1 id="hc-title" className="doc-display text-xco-ink">Holiday cards</h1>
        <p className="max-w-2xl text-[18px] leading-[1.45] text-xco-ink">
          One folded A6 card per name. Each grows the same pattern as that person&apos;s animated card,
          so no two are alike. A name on its own leaves the inside blank to write on. Add
          <code className="mx-1 font-code text-[15px]">| message</code> to print a message instead.
        </p>

        <div className="space-y-2">
          <label htmlFor="hc-names" className={LABEL}>Names, one per line</label>
          <textarea
            id="hc-names"
            value={list}
            onChange={(e) => setList(e.target.value)}
            rows={8}
            className="w-full border border-[var(--border-default)] bg-[var(--xco-paper-raised)] p-3 font-body text-[14px] text-xco-ink"
          />
        </div>
        <label htmlFor="hc-qr" className="flex min-h-[44px] items-center gap-3 text-[16px] text-xco-ink">
          <input id="hc-qr" type="checkbox" checked={withQr} onChange={(e) => setWithQr(e.target.checked)} className="h-5 w-5" />
          QR code on the back, opening each person&apos;s animated card
        </label>
        {withQr && (
          <div className="space-y-2">
            <label htmlFor="hc-url" className={LABEL}>Animated card link (the QR code opens it with the name added)</label>
            <input
              id="hc-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full border border-[var(--border-default)] bg-[var(--xco-paper-raised)] p-3 font-code text-[14px] text-xco-ink"
            />
          </div>
        )}

        <p className="text-[15px] text-xco-ink" aria-live="polite">
          {recipients.length} cards · {toWrite} with the inside blank to write on · {recipients.length * 2} PDF pages
        </p>
        {withQr && unlinkable.length > 0 && (
          <p role="alert" className="text-[15px] text-xco-ink">
            The animated card can only show plain letters and hyphens, so it will greet these people as
            &ldquo;Ana&rdquo;: {unlinkable.join(", ")}. Their printed cards are still theirs.
          </p>
        )}
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => window.print()}
            disabled={recipients.length === 0}
            className="min-h-[44px] bg-xco-ink px-5 text-[15px] text-xco-paper disabled:opacity-50"
          >
            Print or save as PDF
          </button>
          <p className="text-[14px] text-xco-ink-muted">
            In the print dialog: no margins, background graphics on, two-sided, flip on short edge.
          </p>
        </div>
      </section>

      <div className="mx-auto flex w-fit flex-col gap-10 print:gap-0">
        {recipients.map((r, i) => <CardSheets key={`${i}-${r.display}`} r={r} index={i} withQr={withQr} />)}
      </div>
    </main>
  );
}
