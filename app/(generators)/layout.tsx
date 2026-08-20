import { SiteNav, ReadingProgress, Grain, type NavLink } from "@/components/doc";

const generators: NavLink[] = [
  { href: "/three-regimes",   label: "Three Regimes" },
  { href: "/social-card",     label: "Social Card" },
  { href: "/paper-cover",     label: "Paper Cover" },
  { href: "/image-treatment", label: "Image Treatment" },
  { href: "/option-field",    label: "Option Field" },
  { href: "/align",           label: "Align" },
  { href: "/text-highlight",  label: "Text Highlight" },
  { href: "/territory",       label: "Territory" },
  { href: "/design-export",   label: "Token Export" },
];

export default function GeneratorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Grain />
      <ReadingProgress />
      <SiteNav links={generators} register="instruments" />
      <div className="doc-wrap py-12">{children}</div>
    </div>
  );
}
