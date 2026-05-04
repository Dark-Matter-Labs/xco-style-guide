"use client";

import { useState } from "react";

interface CopyButtonProps {
  text: string;
  label?: string;
}

export function CopyButton({ text, label = "Copy" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: noop
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="font-mono text-xs border border-xco-ink/[0.2] px-3 py-1.5 text-xco-ink-muted hover:text-xco-ink hover:border-xco-ink transition-colors"
    >
      {copied ? "✓ copied" : label}
    </button>
  );
}
