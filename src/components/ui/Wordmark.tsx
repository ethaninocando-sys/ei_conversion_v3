import Link from "next/link";
import { site } from "@/config/site";

interface Props {
  size?: "sm" | "md";
  tone?: "light" | "dark";
  /** Render as a link to "/" (default) or as plain text. */
  asLink?: boolean;
}

/**
 * Text wordmark: site.wordmark in a navy rounded square followed by site.name.
 * Swapping to a real logo later means editing this one file.
 */
export function Wordmark({ size = "md", tone = "dark", asLink = true }: Props) {
  const box = size === "sm" ? "h-8 w-8 text-sm" : "h-10 w-10 text-base";
  const boxTone = tone === "light" ? "bg-offwhite text-navy" : "bg-navy text-offwhite";
  const text = tone === "light" ? "text-offwhite" : "text-navy";
  const inner = (
    <>
      <span
        aria-hidden="true"
        className={`inline-flex ${box} ${boxTone} items-center justify-center rounded-md font-heading font-extrabold tracking-tight`}
      >
        {site.wordmark}
      </span>
      <span className={`font-heading text-lg font-bold ${text}`}>{site.name}</span>
    </>
  );
  if (!asLink) return <span className="inline-flex items-center gap-2.5">{inner}</span>;
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 rounded-md" aria-label={`${site.name} home`}>
      {inner}
    </Link>
  );
}
