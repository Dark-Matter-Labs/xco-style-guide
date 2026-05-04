import { WIP } from "@/components/WIP";
import { PaperCoverGenerator } from "./PaperCoverGenerator";

export default function PaperCoverPage() {
  return (
    <div className="space-y-10">
      <header className="flex items-baseline justify-between border-b border-xco-ink/[0.12] pb-6">
        <div>
          <h1 className="font-display text-4xl">Paper Cover</h1>
          <p className="font-mono text-xs text-xco-ink-muted mt-2">
            A4 portrait · PDF-ready SVG · 2× PNG for print
          </p>
        </div>
        <WIP variant="v0.1" />
      </header>
      <PaperCoverGenerator />
    </div>
  );
}
