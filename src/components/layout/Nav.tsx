"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/ui/Wordmark";
import { MobileMenu } from "@/components/layout/MobileMenu";

export const NAV_LINKS = [
  { label: "Guide", href: "/guide" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
] as const;

export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Flat masthead rule. No blur, no floating pill, no shadow. */
export function Nav() {
  const pathname = usePathname();
  return (
    <header className="border-b border-rule bg-paper">
      <nav
        aria-label="Main"
        className="mx-auto flex h-[4.5rem] w-full max-w-[78rem] items-center justify-between px-5 md:px-10"
      >
        <Wordmark />
        <ul className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((l) => {
            const active = isActive(pathname, l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`marker !text-[0.75rem] transition-colors hover:text-ink ${
                    active ? "!text-ink underline decoration-accent decoration-2 underline-offset-[0.6em]" : ""
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <MobileMenu pathname={pathname} />
      </nav>
    </header>
  );
}
