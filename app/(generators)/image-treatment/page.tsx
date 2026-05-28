import { WIP } from "@/components/WIP";
import { ImageTreatmentGenerator } from "./ImageTreatmentGenerator";

export default function ImageTreatmentPage() {
  return (
    <div className="space-y-10">
      <header className="flex items-baseline justify-between pb-6">
        <div>
          <h1 className="font-display text-[60px] leading-[60px]">Image Treatment</h1>
          <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink mt-2">
            Dot-matrix → sharp · evolutionary resolution · Substack placeholders
          </p>
        </div>
        <WIP variant="v0.1" />
      </header>
      <ImageTreatmentGenerator />
    </div>
  );
}
