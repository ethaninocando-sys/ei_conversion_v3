import Link from "next/link";
import { site } from "@/config/site";

/**
 * The masthead. Set in the display face, with the initials in accent.
 * Swapping to a drawn logo later means editing this one file.
 */
export function Wordmark({ asLink = true }: { asLink?: boolean }) {
  const inner = (
    <span className="display display-sm whitespace-nowrap">
      <span className="text-accent">{site.wordmark}</span>{" "}
      <span>{site.name.replace(site.wordmark, "").trim()}</span>
    </span>
  );
  if (!asLink) return inner;
  return (
    <Link href="/" aria-label={`${site.name}, home`} className="inline-block">
      {inner}
    </Link>
  );
}
