import { WIP } from "@/components/WIP";
import { AsemicGenerator } from "./AsemicGenerator";

export default function AsemicPage() {
  return (
    <div className="space-y-10">
      <header className="flex items-baseline justify-between pb-6">
        <div>
          <h1 className="font-display text-[60px] leading-[60px]">Asemic</h1>
          <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink mt-2 max-w-2xl">
            Writing with no fixed meaning, grown from xCO&apos;s own sentences. Each long
            word becomes a cluster of marks mirrored about a thread; short words and
            punctuation become small stacks; a line break lets the thread run on alone.
            The beads are the logotype&apos;s O and C, and the x, in dusk, opens the line.
            Every sheet is seeded, so it can be named and made again.
          </p>
        </div>
        <WIP variant="version" />
      </header>
      <AsemicGenerator />
    </div>
  );
}
