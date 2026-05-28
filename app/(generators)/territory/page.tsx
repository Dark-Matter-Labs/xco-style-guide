import { TerritoryGenerator } from "./TerritoryGenerator";

export const metadata = {
  title: "Territory — xCO Style Guide",
};

export default function TerritoryPage() {
  return (
    <div className="space-y-10">
      <header className="pb-6 space-y-2">
        <h1 className="font-display text-[60px] leading-[60px]">Territory</h1>
        <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
          Weighted treemap — cell area encodes relative importance
        </p>
        <p className="font-body text-[24px] text-xco-ink leading-[26px] max-w-2xl">
          A squarified treemap where each concept is given a cell proportional
          to its weight. Use it to map option space, portfolio distribution,
          or concept priority across the three regimes.
        </p>
      </header>
      <TerritoryGenerator />
    </div>
  );
}
