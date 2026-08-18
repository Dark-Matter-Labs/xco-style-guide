import { WIP } from "@/components/WIP";
import { PaperCoverGenerator } from "./PaperCoverGenerator";

export default function PaperCoverPage() {
  return (
    <div className="space-y-10">
      <header className="flex items-baseline justify-between pb-6">
        <div>
          <h1 className="font-display text-[60px] leading-[60px]">Paper Cover</h1>
          <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink mt-2">
            A4 portrait · PDF-ready SVG · 2× PNG for print
          </p>
        </div>
        <WIP variant="version" />
      </header>
      <PaperCoverGenerator />
    </div>
  );
}
