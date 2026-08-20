import { SiteNav, ReadingProgress, type NavLink } from "@/components/doc";

const sections: NavLink[] = [
  { href: "/logo", label: "Logo" },
  { href: "/typography", label: "Typography" },
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
      <ReadingProgress />
      <SiteNav links={sections} register="system" />
      {children}
    </div>
  );
}
