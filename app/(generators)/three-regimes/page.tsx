import { WIP } from "@/components/WIP";
import { ThreeRegimesGenerator } from "./ThreeRegimesGenerator";

export default function ThreeRegimesPage() {
  return (
    <div className="space-y-10">
      <header className="flex items-baseline justify-between pb-6">
        <div>
          <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink mb-1">Generator</p>
          <h1 className="font-display text-[3rem] leading-[1.1]">Three Regimes of Optionality</h1>
        </div>
        <WIP variant="v0.1" />
      </header>

      <section className="max-w-2xl">
        <p className="font-body text-[1.375rem] text-xco-ink leading-[1.7]">
          Frontier / Fortress / Field — where Field is not a peer but the
          precondition. Adjust labels, relationship statement, and caption.
          Export SVG for exact typography; PNG for quick sharing.
        </p>
      </section>

      <ThreeRegimesGenerator />
    </div>
  );
}
