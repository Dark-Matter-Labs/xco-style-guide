import { AlignGenerator } from "./AlignGenerator";

export const metadata = {
  title: "Align — xCO Style Guide",
};

export default function AlignPage() {
  return (
    <div className="space-y-10">
      <header className="flex items-baseline justify-between border-b border-xco-ink/[0.12] pb-6">
        <div>
          <h1 className="font-display text-4xl">Align</h1>
          <p className="font-mono text-xs text-xco-ink-muted mt-2">
            Pull external imagery into the xCO visual system — tritone palette mapping
          </p>
        </div>
      </header>
      <AlignGenerator />
    </div>
  );
}
