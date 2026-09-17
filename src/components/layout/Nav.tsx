"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/ui/Wordmark";
import { MobileMenu } from "@/components/layout/MobileMenu";

export const NAV_LINKS = [
  { label: "Guide", href: "/guide" },
  { label: "Services", href: "/services" },
] as const;

export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Sticky, off-white, 1px bottom line. Contact is the primary button. */
export function Nav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-offwhite/95 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
        <Wordmark />
        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((l) => {
            const active = isActive(pathname, l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-sm py-1 font-medium text-navy ${
                  active ? "border-b-2 border-amber" : "border-b-2 border-transparent hover:border-line"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <Link href="/contact" className="btn btn-primary !min-h-11 !py-2.5">
            Contact
          </Link>
        </div>
        <MobileMenu pathname={pathname} />
      </nav>
    </header>
  );
}
