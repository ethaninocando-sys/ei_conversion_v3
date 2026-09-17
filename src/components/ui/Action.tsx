"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { track } from "@/lib/analytics";

type Variant = "solid" | "outline" | "quiet";

interface Props {
  children: ReactNode;
  variant?: Variant;
  href?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  trackEvent?: boolean;
  className?: string;
  ariaLabel?: string;
}

const variantClass: Record<Variant, string> = {
  solid: "action",
  outline: "action action-outline",
  quiet: "action action-quiet",
};

/**
 * Three actions, no more. Solid is an ink rectangle, outline is the same
 * rectangle drawn, quiet is an underlined link with an arrow. Nothing is
 * rounded and nothing has a shadow.
 */
export function Action({
  children,
  variant = "solid",
  href,
  type = "button",
  onClick,
  disabled,
  trackEvent = true,
  className = "",
  ariaLabel,
}: Props) {
  const classes = `${variantClass[variant]} ${className}`.trim();
  const label = typeof children === "string" ? children : (ariaLabel ?? "");

  const handleClick = () => {
    if (trackEvent) track("cta_click", { label, href });
    onClick?.();
  };

  const body = (
    <>
      {children}
      {variant === "quiet" && (
        <span aria-hidden="true" className="translate-y-px">
          &rarr;
        </span>
      )}
    </>
  );

  if (href) {
    if (/^(https?:|mailto:|tel:)/.test(href)) {
      return (
        <a href={href} className={classes} onClick={handleClick} aria-label={ariaLabel}>
          {body}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} onClick={handleClick} aria-label={ariaLabel}>
        {body}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={handleClick} disabled={disabled} aria-label={ariaLabel}>
      {body}
    </button>
  );
}
