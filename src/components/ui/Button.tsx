"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { track } from "@/lib/analytics";

type Variant = "primary" | "secondary" | "ghost";

interface Props {
  children: ReactNode;
  variant?: Variant;
  href?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  /** When set, fires track("cta_click", { label, href }) on click. */
  trackEvent?: boolean;
  className?: string;
  ariaLabel?: string;
}

/**
 * Every CTA on the site. Renders a Next <Link> when href is given.
 * Inside a Section tone="navy" the secondary and ghost variants switch to
 * off-white via the [data-tone="navy"] rules in globals.css.
 */
export function Button({
  children,
  variant = "primary",
  href,
  type = "button",
  onClick,
  disabled,
  trackEvent = true,
  className = "",
  ariaLabel,
}: Props) {
  const classes = `btn btn-${variant} ${className}`.trim();
  const label = typeof children === "string" ? children : ariaLabel ?? "";

  const handleClick = () => {
    if (trackEvent) track("cta_click", { label, href });
    onClick?.();
  };

  if (href) {
    const external = /^(https?:|mailto:|tel:)/.test(href);
    if (external) {
      return (
        <a href={href} className={classes} onClick={handleClick} aria-label={ariaLabel}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} onClick={handleClick} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={handleClick} disabled={disabled} aria-label={ariaLabel}>
      {children}
    </button>
  );
}
