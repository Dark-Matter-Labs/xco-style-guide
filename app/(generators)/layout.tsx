import { SiteNav, ReadingProgress, Grain } from "@/components/doc";
import { instruments } from "@/lib/instruments";

export default function GeneratorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Grain />
      <ReadingProgress />
      <SiteNav links={[...instruments]} register="instruments" />
      <main id="main" tabIndex={-1} className="doc-wrap py-12">{children}</main>
    </div>
  );
}
