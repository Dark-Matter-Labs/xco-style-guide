"use client";

import { useState } from "react";
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
      "Add inside the @theme {} block in your globals.css. Creates Tailwind utilities like bg-xco-ocean, text-xco-dusk, font-body.",
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

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(active);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeExport.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">

      {/* ── Controls ── */}
      <aside className="w-full lg:w-72 shrink-0 space-y-6">

        {/* Export type selector */}
        <div className="space-y-1">
          <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-3">
            Export format
          </h2>
          {EXPORTS.map(({ id, label, tag }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`w-full text-left flex items-center justify-between gap-3 py-2.5 px-3 border transition-colors ${
                active === id
                  ? "border-xco-ocean bg-xco-ocean/[0.05] text-xco-ink"
                  : "border-xco-ink text-xco-ink"
              }`}
            >
              <span className="font-mono font-medium text-[0.9375rem] leading-[1.6]">{label}</span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.5 shrink-0 ${
                  active === id
                    ? "bg-xco-ocean text-xco-paper"
                    : "bg-transparent text-xco-ink"
                }`}
              >
                {tag}
              </span>
            </button>
          ))}
        </div>

        {/* Description */}
        <div className="pt-4 space-y-3">
          <p className="font-body text-[1.375rem] leading-[1.7] text-xco-ink">
            {activeExport.description}
          </p>
          {active === "claude" && (
            <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink leading-snug">
              Works with any framework. Claude Code reads CLAUDE.md automatically at session start.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-4">
          <button
            onClick={handleCopy}
            className={`w-full font-mono font-medium text-[0.9375rem] leading-[1.6] px-3 py-2.5 border transition-colors ${
              copied === active
                ? "bg-xco-ocean text-xco-paper border-xco-ocean"
                : "text-xco-ink border-xco-ink hover:border-xco-ink hover:bg-xco-ink/[0.04]"
            }`}
          >
            {copied === active ? "Copied to clipboard" : "Copy to clipboard"}
          </button>
          <button
            onClick={handleDownload}
            className="w-full font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink border border-xco-ink px-3 py-2.5 hover:border-xco-ink hover:text-xco-ink transition-colors"
          >
            ↓ Download — {activeExport.filename}
          </button>
        </div>

        {/* Usage hint for Claude */}
        {active === "claude" && (
          <div className="border border-xco-ink p-3 space-y-1.5">
            <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink uppercase tracking-widest">
              How to use
            </p>
            <ol className="space-y-1.5 font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink leading-snug list-none">
              <li>1. Copy or download the CLAUDE.md</li>
              <li>2. Place it at your project root</li>
              <li>3. Add the CSS tokens (copy the CSS export)</li>
              <li>4. Run <span className="text-xco-ink">claude</span> in that directory</li>
            </ol>
          </div>
        )}
      </aside>

      {/* ── Preview ── */}
      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
            {activeExport.filename} — {content.split("\n").length} lines
          </span>
          <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
            {(new Blob([content]).size / 1024).toFixed(1)} KB
          </span>
        </div>

        <div className="border border-xco-ink overflow-hidden">
          <pre className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink p-6 overflow-x-auto overflow-y-auto max-h-[70vh] bg-xco-paper whitespace-pre">
            {content}
          </pre>
        </div>

        <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
          Generated from{" "}
          <span className="text-xco-ink">lib/design-tokens.ts</span> — always reflects the current token set.
        </p>
      </div>
    </div>
  );
}
