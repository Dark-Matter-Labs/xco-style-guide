import { AlignGenerator } from "./AlignGenerator";

export const metadata = {
  title: "Align — xCO Style Guide",
};

export default function AlignPage() {
  return (
    <div className="space-y-10">
      <header className="flex items-baseline justify-between pb-6">
        <div>
          <h1 className="font-display text-[3rem] leading-[1.1]">Align</h1>
          <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink mt-2">
            Pull external imagery into the xCO visual system — tritone palette mapping
          </p>
        </div>
      </header>
      <AlignGenerator />
    </div>
  );
}
