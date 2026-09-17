/**
 * THE ONE FILE for brand identity. Renaming the business (for example to
 * "E2 Results") means editing this file, swapping src/app/icon.svg, and
 * verifying the new domain in Resend. Nothing else references the brand name.
 *
 * Anything in [BRACKETS] must be filled in by the owner before the site goes
 * live. `scripts/check-env.ts` refuses a production build while any bracket
 * placeholder remains in this file or under src/content.
 */

const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const site = {
  name: "Ei Conversion",
  wordmark: "Ei",
  legalName: "[LEGAL ENTITY NAME]",
  tagline: "[TAGLINE: one sentence, e.g. Marketing that fits your trade]",
  domain: "ei-conversion.com",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : productionUrl
        ? `https://${productionUrl}`
        : "http://localhost:3000"),
  ownerFirstName: "[OWNER FIRST NAME]",
  /** Sending address (Phase 2, after Resend domain verification). */
  fromEmail: "hello@ei-conversion.com",
  /** Shown publicly and used by the Phase 1 mailto link. */
  contactEmail: "[OWNER EXISTING EMAIL]",
  /** CAN-SPAM footer on list mail; also Organization JSON-LD. */
  mailingAddress: "[MAILING ADDRESS]",
  serviceArea: "[SERVICE AREA, e.g. Greater Tampa Bay]",
  city: "[CITY, STATE]",
  /** IANA timezone used for "today" in the daily quiz. [CONFIRM OWNER TIMEZONE] */
  timezone: "America/New_York",
} as const;

export type Site = typeof site;
