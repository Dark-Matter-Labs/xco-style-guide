import { DesignExportGenerator } from "./DesignExportGenerator";

export const metadata = {
  title: "Token Export — xCO Style Guide",
};

export default function DesignExportPage() {
  return (
    <div className="space-y-10">
      <header className="pb-6 space-y-2">
        <h1 className="font-display text-[3rem] leading-[1.1]">Token Export</h1>
        <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
          Design tokens as deployable prompts and config
        </p>
        <p className="font-body text-[1.375rem] text-xco-ink leading-[1.7] max-w-2xl">
          Export the xCO design system as a CLAUDE.md prompt, CSS custom
          properties, or Tailwind config — so any codebase can be aligned to
          the same visual language.
        </p>
      </header>
      <DesignExportGenerator />
    </div>
  );
}
