import { Instrument_Serif } from "next/font/google";
import { WIP } from "@/components/WIP";
import { EventSeriesGenerator } from "./EventSeriesGenerator";

// Medulla's poster face, offered as the title option on co-hosted cards. Loaded
// here rather than in the root layout: nothing else in the system uses it.
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export default function EventSeriesPage() {
  return (
    <div className="space-y-10">
      <header className="flex items-baseline justify-between pb-6">
        <div>
          <h1 className="font-display text-[60px] leading-[60px]">Event Series</h1>
          <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink mt-2">
            xCO at Medulla · Luma covers, posts and stories, still or looping
          </p>
        </div>
        <WIP variant="version" />
      </header>
      <EventSeriesGenerator instrumentFamily={instrumentSerif.style.fontFamily} />
    </div>
  );
}
