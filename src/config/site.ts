/**
 * THE ONE FILE for brand identity. Renaming the business (for example to
 * "E2 Results") means editing this file, swapping src/app/icon.svg, and
 * verifying the new domain in Resend. Nothing else references the brand name.
 *
 * Anything in [BRACKETS] must be filled in by the owner before the site goes
 * live. `scripts/check-env.ts` refuses to build once the real domain is
 * connected while any bracket placeholder remains here or under src/content.
 */

// VERCEL_PROJECT_PRODUCTION_URL is the project's stable production domain.
// VERCEL_URL is per-deployment, so it must only be used for previews, or
// canonical URLs on the live site would point at a one-off deployment.
const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const deploymentUrl = process.env.VERCEL_URL;
const isProduction = process.env.VERCEL_ENV === "production";

function resolveUrl(): string {
  // `||` not `??`: Vercel passes unset variables through as "".
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (isProduction && productionUrl) return `https://${productionUrl}`;
  if (deploymentUrl) return `https://${deploymentUrl}`;
  if (productionUrl) return `https://${productionUrl}`;
  return "http://localhost:3000";
}

export const site = {
  name: "Ei Conversion",
  wordmark: "Ei",
  legalName: "[LEGAL ENTITY NAME]",
  tagline: "[TAGLINE: one sentence, e.g. Marketing that fits your trade]",
  domain: "ei-conversion.com",
  url: resolveUrl(),
  ownerFirstName: "[OWNER FIRST NAME]",
  /** Sending address (Phase 2, after Resend domain verification). */
  fromEmail: "hello@ei-conversion.com",
  /** Shown publicly and used by the Phase 1 mailto link. */
  contactEmail: "[OWNER EXISTING EMAIL]",
  /** CAN-SPAM footer on list mail; also Organization JSON-LD. */
  mailingAddress: "[MAILING ADDRESS]",
  serviceArea: "[SERVICE AREA, e.g. Greater Tampa Bay]",
  city: "[CITY, STATE]",
  /**
   * IANA timezone used for "today" in the daily quiz.
   * TODO(owner): confirm. Lives in a comment, so the build guard cannot catch it.
   */
  timezone: "America/New_York",
} as const;

export type Site = typeof site;
