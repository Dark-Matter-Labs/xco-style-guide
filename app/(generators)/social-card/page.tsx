import { WIP } from "@/components/WIP";
import { SocialCardGenerator } from "./SocialCardGenerator";

export default function SocialCardPage() {
  return (
    <div className="space-y-10">
      <header className="flex items-baseline justify-between pb-6">
        <div>
          <h1 className="font-display text-[60px] leading-[60px]">Social Card</h1>
          <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink mt-2">
            LinkedIn · Substack OG · Instagram square
          </p>
        </div>
        <WIP variant="v0.1" />
      </header>
      <SocialCardGenerator />
    </div>
  );
}
