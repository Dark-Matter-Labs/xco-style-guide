import { WIP } from "@/components/WIP";
import { GrowthGenerator } from "./GrowthGenerator";

export default function GrowthPage() {
  return (
    <div className="space-y-10">
      <header className="flex items-baseline justify-between pb-6">
        <div>
          <h1 className="font-display text-[60px] leading-[60px]">Growth</h1>
          <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink mt-2 max-w-2xl">
            Differential growth: a line that lengthens by local rules and folds
            to find room, never crossing itself. Grown from the logo&apos;s
            aperture, it keeps the C&apos;s opening — an option space that
            stays open as it fills.
          </p>
        </div>
        <WIP variant="version" />
      </header>
      <GrowthGenerator />
    </div>
  );
}
