import type { Service } from "@/content/types";

export const googleAds: Service = {
  slug: "google-ads",
  name: "Google Ads",
  oneLiner: "Search campaigns for the exact jobs you want.",
  promise:
    "Search campaigns that show up for the exact jobs you want, in the areas you serve, at the hours you can answer.",
  bestFor: "Businesses with high-intent searches and a phone that gets answered.",
  included: [
    "Keyword plan and negative keyword list",
    "Ad copy written for your services and area",
    "Call tracking and conversion setup before launch",
    "Landing page recommendations",
    "Budget pacing and ad scheduling",
    "Weekly optimization",
    "Monthly plain-language report",
  ],
  honestLine:
    "[HONEST LINE, e.g. Every new account starts on a small test budget. You see exactly what we see, every week, before anything scales.]",
  goodFit: [
    "People search for your service with clear intent.",
    "Your ticket size supports the cost of clicks.",
    "The phone gets answered during ad hours.",
  ],
  notFit: [
    "Very low ticket sizes.",
    "Nobody can answer calls during the day.",
    "There is no landing page to send clicks to.",
  ],
  process: [
    "A call about the jobs you want more of and the ones you do not.",
    "Keyword plan, negatives, and tracking setup.",
    "Launch on a controlled budget and schedule.",
    "Weekly optimization and a monthly report you can read in five minutes.",
  ],
  pricingLine: "[PRICING STANCE, e.g. flat monthly fee plus your ad spend, quoted after a call]",
  deepDive: {
    teaser: "[DEEP-DIVE TEASER, e.g. intent, negatives, and tracking that must exist before spending]",
    chapters: [
      { label: "Intent and match types" },
      { label: "Why negative keywords matter" },
      { label: "Call-only versus website ads" },
      { label: "Service-area settings" },
      { label: "Conversion tracking that must exist" },
      { label: "Budget math without promises" },
      { label: "The first ninety days" },
    ],
    mistakes: [
      "Broad match with no negatives.",
      "No conversion tracking.",
      "Sending clicks to the home page.",
    ],
  },
  seo: {
    title: "Google Ads for Local Service Businesses",
    description:
      "Search campaigns for the exact jobs you want, in the areas you serve. What is included, who it fits, and who it does not.",
  },
};
