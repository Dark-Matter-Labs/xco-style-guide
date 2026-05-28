import { TextHighlightGenerator } from "./TextHighlightGenerator";

export const metadata = {
  title: "Text Highlight — xCO Style Guide",
};

export default function TextHighlightPage() {
  return (
    <div className="space-y-10">
      <header className="flex items-baseline justify-between pb-6">
        <div>
          <h1 className="font-display text-[60px] leading-[60px]">Text Highlight</h1>
          <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink mt-2">
            Importance as colour temperature or scale — sidenotes aligned to term height
          </p>
        </div>
      </header>
      <TextHighlightGenerator />
    </div>
  );
}
