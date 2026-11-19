import { WIP } from "@/components/WIP";
import { NotionGenerator } from "./NotionGenerator";

export const metadata = { title: "Notion — xCO Style Guide" };

export default function NotionPage() {
  return (
    <div className="space-y-10">
      <header className="flex items-baseline justify-between pb-6">
        <div>
          <h1 className="font-display text-[60px] leading-[60px]">Notion</h1>
          <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink mt-2 max-w-2xl">
            Covers and icons for the xCO Notion space. Name the page and its
            seeded field draws both, so every page gets its own pair, and you
            can make the same pair again from the name alone.
          </p>
        </div>
        <WIP variant="version" />
      </header>
      <NotionGenerator />
    </div>
  );
}
