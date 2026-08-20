import { SiteNav, ReadingProgress, Grain, type NavLink } from "@/components/doc";

const sections: NavLink[] = [
  { href: "/logo", label: "Logo" },
  { href: "/typography", label: "Type" },
  { href: "/colour", label: "Colour" },
  { href: "/grid", label: "Grid" },
  { href: "/diagrams", label: "Diagrams" },
  { href: "/tone", label: "Tone" },
  { href: "/components", label: "Components" },
  { href: "/grammar", label: "Grammar" },
];

export default function SystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Grain />
      <ReadingProgress />
      <SiteNav links={sections} register="system" />
      {children}
    </div>
  );
}
