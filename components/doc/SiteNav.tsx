"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/xco/Logo";
import { RegisterSwitch } from "./RegisterSwitch";

export interface NavLink {
  href: string;
  label: string;
}

interface SiteNavProps {
  links: NavLink[];
  register: string;
}

// Sticky hairline bar. The active section is marked server-side, so it is
// correct before any JS runs.
export function SiteNav({ links, register }: SiteNavProps) {
  const pathname = usePathname();

  return (
    <nav className="doc-nav" aria-label="Site">
      <div className="doc-wrap h-14 flex items-center gap-8">
        {/* h-11: a 44px target. The mark is 15px tall, so without this the link
            was a thin strip — under the guide's own 44px minimum. */}
        <Link href="/" className="shrink-0 flex items-center gap-2.5 h-11 group" aria-label="xCO home">
          {/* The drawn mark, not the name set in a font — the logo page's own
              rule. Set type leaves the x→C→O spacing to the typeface. */}
          <Logo inline height={15} color="currentColor" className="text-xco-ink" />
          <span className="doc-label !text-[9px]">{register}</span>
        </Link>

        <div className="flex items-center gap-5 overflow-x-auto flex-1">
          {links.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                data-active={active}
                aria-current={active ? "page" : undefined}
                className="doc-navlink font-mono font-medium text-[11px] leading-none uppercase text-xco-ink-muted hover:text-xco-ink"
                style={{ letterSpacing: "0.08em" }}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <RegisterSwitch />
      </div>
    </nav>
  );
}
