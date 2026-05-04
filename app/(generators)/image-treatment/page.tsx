import { WIP } from "@/components/WIP";
import { ImageTreatmentGenerator } from "./ImageTreatmentGenerator";

export default function ImageTreatmentPage() {
  return (
    <div className="space-y-10">
      <header className="flex items-baseline justify-between border-b border-xco-ink/[0.12] pb-6">
        <div>
          <h1 className="font-display text-4xl">Image Treatment</h1>
          <p className="font-mono text-xs text-xco-ink-muted mt-2">
            Dot-matrix → sharp · evolutionary resolution · Substack placeholders
          </p>
        </div>
        <WIP variant="v0.1" />
      </header>
      <ImageTreatmentGenerator />
    </div>
  );
}
