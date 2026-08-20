"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
    <nav className="doc-nav">
      <div className="doc-wrap h-14 flex items-center gap-8">
        <Link href="/" className="shrink-0 flex items-baseline gap-2.5 group" aria-label="xCO home">
          <span
            className="font-display text-[20px] leading-none text-xco-ink"
            style={{ letterSpacing: "-0.04em" }}
          >
            xCO
          </span>
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
