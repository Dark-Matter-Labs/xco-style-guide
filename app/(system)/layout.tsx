import Link from "next/link";
import { DarkModeToggle } from "@/components/DarkModeToggle";

const sections = [
  { href: "/logo", label: "Logo" },
  { href: "/typography", label: "Typography" },
  { href: "/colour", label: "Colour" },
  { href: "/grid", label: "Grid" },
  { href: "/diagrams", label: "Diagrams" },
  { href: "/tone", label: "Tone" },
  { href: "/components", label: "Components" },
];

export default function SystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-xco-paper">
      <nav className="px-8 py-4 sticky top-0 bg-xco-paper z-10">
        <div className="max-w-6xl mx-auto flex items-center gap-8">
          <Link
            href="/"
            className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink hover:text-xco-dusk transition-colors shrink-0"
          >
            ← xCO
          </Link>
          <div className="flex items-center gap-6 overflow-x-auto flex-1">
            {sections.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink hover:text-xco-dusk transition-colors whitespace-nowrap"
              >
                {label}
              </Link>
            ))}
          </div>
          <DarkModeToggle />
        </div>
      </nav>
      <div className="max-w-6xl mx-auto px-8 py-12">{children}</div>
    </div>
  );
}
