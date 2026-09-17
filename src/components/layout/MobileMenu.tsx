"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Guide", href: "/guide" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
];

/** Below md: a button that opens a full-width panel. Focus trap, Esc closes, no library. */
export function MobileMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const focusables = panel?.querySelectorAll<HTMLElement>("a, button");
    focusables?.[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (e.key === "Tab" && focusables && focusables.length > 0) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        className="btn btn-secondary !min-h-11 !px-3 !py-2"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Close" : "Menu"}
      </button>
      {open && (
        <div
          ref={panelRef}
          id="mobile-menu"
          role="dialog"
          aria-label="Site menu"
          className="absolute inset-x-0 top-16 border-b border-line bg-offwhite px-4 pb-6 pt-2 shadow-none"
        >
          <ul className="flex flex-col">
            {LINKS.map((l) => {
              const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(`${l.href}/`));
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`block border-b border-line py-4 text-lg font-medium text-navy ${
                      active ? "underline decoration-amber decoration-2 underline-offset-4" : ""
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <button type="button" className="btn btn-ghost mt-4 w-full" onClick={() => setOpen(false)}>
            Close menu
          </button>
        </div>
      )}
    </div>
  );
}
