import { DesignExportGenerator } from "./DesignExportGenerator";

export const metadata = {
  title: "Token Export — xCO Style Guide",
};

export default function DesignExportPage() {
  return (
    <div className="space-y-10">
      <header className="border-b border-xco-ink/[0.12] pb-6 space-y-2">
        <h1 className="font-display text-4xl">Token Export</h1>
        <p className="font-mono text-xs text-xco-ink-muted">
          Design tokens as deployable prompts and config
        </p>
        <p className="font-body text-[1.375rem] text-xco-ink leading-relaxed max-w-2xl">
          Export the xCO design system as a CLAUDE.md prompt, CSS custom
          properties, or Tailwind config — so any codebase can be aligned to
          the same visual language.
        </p>
      </header>
      <DesignExportGenerator />
    </div>
  );
}
