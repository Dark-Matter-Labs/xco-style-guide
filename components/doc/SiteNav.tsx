"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DarkModeToggle } from "@/components/DarkModeToggle";

export interface NavLink {
  href: string;
  label: string;
}

interface SiteNavProps {
  links: NavLink[];
  /** Shown next to the wordmark, e.g. "system" or "instruments". */
  register: string;
  width?: "6xl" | "7xl";
}

// Sticky translucent bar. Marks the current section so the nav states where
// you are, rather than only where you can go.
export function SiteNav({ links, register, width = "6xl" }: SiteNavProps) {
  const pathname = usePathname();
  const max = width === "7xl" ? "max-w-7xl" : "max-w-6xl";

  return (
    <nav className="doc-nav">
      <div className={`${max} mx-auto px-8 h-14 flex items-center gap-8`}>
        <Link
          href="/"
          className="shrink-0 flex items-baseline gap-2.5 group"
          aria-label="xCO home"
        >
          <span className="font-display text-[22px] leading-none text-xco-ink group-hover:text-xco-dusk transition-colors">
            xCO
          </span>
          <span className="font-mono font-medium text-[0.6875rem] leading-none uppercase tracking-widest text-xco-ink-muted">
            {register}
          </span>
        </Link>

        <div className="flex items-center gap-5 overflow-x-auto flex-1">
          {links.map(({ href, label }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                data-active={active}
                aria-current={active ? "page" : undefined}
                className="doc-navlink font-mono font-medium text-[0.8125rem] leading-none text-xco-ink-muted hover:text-xco-ink"
              >
                {label}
              </Link>
            );
          })}
        </div>

        <DarkModeToggle />
      </div>
    </nav>
  );
}
