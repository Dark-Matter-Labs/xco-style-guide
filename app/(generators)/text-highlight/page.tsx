import { TextHighlightGenerator } from "./TextHighlightGenerator";

export const metadata = {
  title: "Text Highlight — xCO Style Guide",
};

export default function TextHighlightPage() {
  return (
    <div className="space-y-10">
      <header className="flex items-baseline justify-between border-b border-xco-ink/[0.12] pb-6">
        <div>
          <h1 className="font-display text-4xl">Text Highlight</h1>
          <p className="font-mono text-xs text-xco-ink-muted mt-2">
            Importance as colour temperature or scale — sidenotes aligned to term height
          </p>
        </div>
      </header>
      <TextHighlightGenerator />
    </div>
  );
}
