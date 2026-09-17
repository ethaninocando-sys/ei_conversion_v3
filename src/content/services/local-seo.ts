import type { Service } from "@/content/types";

export const localSeo: Service = {
  slug: "local-seo",
  name: "Local SEO",
  oneLiner: "Show up where local customers actually look.",
  promise:
    "Get your Google Business Profile and site showing up where local customers actually look.",
  bestFor: "Businesses that serve a defined area and can wait for compounding results.",
  included: [
    "Google Business Profile audit and cleanup",
    "Categories, services, and photos set up properly",
    "Review process setup with request templates",
    "Citations and name-address-phone consistency",
    "Location and service pages on your site",
    "Monthly progress check",
  ],
  goodFit: [
    "You serve a defined area.",
    "You have reviews or can start asking for them.",
    "You can wait months for compounding results.",
  ],
  notFit: [
    "You need leads this week.",
    "Your audience is nationwide.",
    "You are unwilling to ask customers for reviews.",
  ],
  process: [
    "Audit of your profile, site, and listings.",
    "Cleanup and setup, usually in the first two weeks.",
    "A review routine you can actually keep.",
    "Monthly check on rankings, calls, and profile actions.",
  ],
  pricingLine: "[PRICING STANCE, e.g. flat monthly fee quoted after a call]",
  deepDive: {
    teaser: "[DEEP-DIVE TEASER, e.g. how the map pack picks businesses and what to expect month by month]",
    chapters: [
      { label: "How the map pack picks businesses" },
      { label: "The profile checklist" },
      { label: "Reviews as a system, without incentives" },
      { label: "Content that supports rankings" },
      { label: "What to expect month by month" },
    ],
    mistakes: [
      "Keyword-stuffed business name.",
      "Ignoring reviews, good and bad.",
      "Inconsistent address across listings.",
      "Wrong primary category.",
    ],
  },
  seo: {
    title: "Local SEO for Local Service Businesses",
    description:
      "Show up in the map pack where local customers actually look. What is included, who it fits, and who it does not.",
  },
};
