import { WIP } from "@/components/WIP";
import { ChaosGenerator } from "./ChaosGenerator";

export default function ChaosPage() {
  return (
    <div className="space-y-10">
      <header className="flex items-baseline justify-between pb-6">
        <div>
          <h1 className="font-display text-[60px] leading-[60px]">Chaos</h1>
          <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink mt-2 max-w-2xl">
            Stochastic chaos, held in the identity grammar: a quiet ground, dense
            fine ink, and one followed trajectory in ember. Turn the dial from
            order towards chaos — a strange attractor shaken by noise, particles
            in a turbulent field, walkers that cluster and then take flight.
            Every field is seeded, so it can be named and made again.
          </p>
        </div>
        <WIP variant="version" />
      </header>
      <ChaosGenerator />
    </div>
  );
}
