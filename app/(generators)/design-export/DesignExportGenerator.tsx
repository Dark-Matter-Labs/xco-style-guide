"use client";

import { useState } from "react";
import { download } from "@/lib/media/export";
import { Button, ExportError, labelClass, RadioList, Section, useExport } from "@/components/generator-controls";
import {
  buildClaudePrompt,
  buildCSSVariables,
  buildTailwindV4,
  buildTailwindV3,
} from "./prompts";

type ExportId = "claude" | "css" | "tw4" | "tw3";

const EXPORTS: {
  id: ExportId;
  label: string;
  tag: string;
  description: string;
  filename: string;
  build: () => string;
}[] = [
  {
    id: "claude",
    label: "Claude Code — CLAUDE.md",
    tag: "Primary",
    description:
      "Drop this into your project's CLAUDE.md. Claude Code will apply the xCO visual language — colours, typography, principles, and banned words — to all code it writes for that project.",
    filename: "CLAUDE.md",
    build: buildClaudePrompt,
  },
  {
    id: "css",
    label: "CSS Custom Properties",
    tag: "globals.css",
    description:
      "Paste into your globals.css :root block. Framework-agnostic — works with any stack.",
    filename: "xco-tokens.css",
    build: buildCSSVariables,
  },
  {
    id: "tw4",
    label: "Tailwind v4 — @theme",
    tag: "Tailwind 4",
    description:
      "Add inside the @theme {} block in your globals.css. Creates Tailwind utilities like bg-xco-ocean, text-xco-dusk-ink, font-body.",
    filename: "xco-theme-v4.css",
    build: buildTailwindV4,
  },
  {
    id: "tw3",
    label: "Tailwind v3 — config",
    tag: "Tailwind 3",
    description:
      "Add inside theme.extend in tailwind.config.js for Tailwind v3 projects.",
    filename: "tailwind.config.js",
    build: buildTailwindV3,
  },
];

export function DesignExportGenerator() {
  const [copied, setCopied] = useState<ExportId | null>(null);
  const [active, setActive] = useState<ExportId>("claude");

  const activeExport = EXPORTS.find((e) => e.id === active)!;
  const content = activeExport.build();

  const { error, run } = useExport();
  const handleCopy = () =>
    run("copy", async () => {
      try {
        await navigator.clipboard.writeText(content);
      } catch {
        throw new Error("The browser blocked the clipboard. Use the download instead.");
      }
      setCopied(active);
      setTimeout(() => setCopied(null), 2000);
    });

  const handleDownload = () => download(new Blob([content], { type: "text/plain;charset=utf-8" }), activeExport.filename);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">

      {/* ── Controls ── */}
      <aside className="w-full lg:w-72 shrink-0 space-y-6">
        <Section title="Export format">
          <RadioList name="export" value={active} options={EXPORTS.map(({ id, label, tag }) => ({ id, label, hint: tag }))} onChange={setActive} />
        </Section>

        <div className="space-y-3">
          <p className="font-body text-[24px] leading-[26px] text-xco-ink">
            {activeExport.description}
          </p>
          {active === "claude" && (
            <p className={labelClass}>
              Works with any framework. Claude Code reads CLAUDE.md automatically at session start.
            </p>
          )}
        </div>

        <Section title="Use it">
          <Button onClick={handleCopy} pressed={copied === active}>
            {copied === active ? "Copied to clipboard" : "Copy to clipboard"}
          </Button>
          <Button onClick={handleDownload}>↓ Download — {activeExport.filename}</Button>
          <ExportError error={error} />
        </Section>

        {active === "claude" && (
          <Section title="How to use">
            <ol className={`space-y-1.5 ${labelClass} list-none`}>
              <li>1. Copy or download the CLAUDE.md</li>
              <li>2. Place it at your project root</li>
              <li>3. Add the CSS tokens (copy the CSS export)</li>
              <li>4. Run <code className="font-code">claude</code> in that directory</li>
            </ol>
          </Section>
        )}
      </aside>

      {/* ── Preview ── */}
      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-center justify-between">
          <span className={labelClass}>
            {activeExport.filename} — {content.split("\n").length} lines
          </span>
          <span className={labelClass}>
            {(new Blob([content]).size / 1024).toFixed(1)} KB
          </span>
        </div>

        <div className="border border-xco-ink overflow-hidden">
          <pre tabIndex={0} aria-label="Export preview" className="font-code text-[0.9375rem] leading-[1.6] text-xco-ink p-6 overflow-x-auto overflow-y-auto max-h-[70vh] bg-xco-paper whitespace-pre">
            {content}
          </pre>
        </div>

        <p className={labelClass}>
          Generated from <code className="font-code">lib/design-tokens.ts</code> — always reflects the current token set.
        </p>
      </div>
    </div>
  );
}
