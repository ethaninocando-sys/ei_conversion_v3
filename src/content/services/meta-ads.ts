import type { Service } from "@/content/types";

export const metaAds: Service = {
  slug: "meta-ads",
  name: "Meta Ads",
  oneLiner: "Facebook and Instagram campaigns built around one clear offer.",
  promise:
    "Facebook and Instagram campaigns built around one clear offer, tested carefully, and reported plainly.",
  bestFor: "Visual or offer-driven businesses that want to reach people before they search.",
  included: [
    "Ad account and Pixel setup",
    "Audience and geography plan",
    "Two to three creatives per test",
    "Lead form or landing page",
    "Policy compliance review before launch",
    "Weekly review of what is running",
    "Monthly plain-language report",
  ],
  honestLine:
    "[HONEST LINE, e.g. Every new account starts on a small test budget. You see exactly what we see, every week, before anything scales.]",
  goodFit: [
    "Your service is visual or offer-driven.",
    "You want to reach people before they search.",
    "You have someone who can follow up leads within minutes.",
  ],
  notFit: [
    "Your demand is purely emergency-driven.",
    "There is no budget for a test period.",
    "Nobody is available to follow up leads quickly.",
  ],
  process: [
    "A call about your offer, your area, and how leads get handled.",
    "Account, Pixel, and audience setup.",
    "Launch a small test with two or three creatives.",
    "Weekly review, then scale what works and cut what does not.",
  ],
  pricingLine: "[PRICING STANCE, e.g. flat monthly fee plus your ad spend, quoted after a call]",
  deepDive: {
    teaser: "[DEEP-DIVE TEASER, e.g. how the auction works and which offers make sense locally]",
    chapters: [
      { label: "How the auction decides who sees your ads" },
      { label: "Offers that make sense for a local business" },
      { label: "Creative basics that do not need a studio" },
      { label: "Policy traps: health, before-and-after, and claims" },
      { label: "Retargeting the people who almost called" },
      { label: "Reading the numbers without fooling yourself" },
      { label: "A realistic first sixty days" },
    ],
    mistakes: [
      "Boosting posts instead of running campaigns.",
      "No Pixel, so nothing can be measured.",
      "Giving up after one week.",
      "Running ads with no offer.",
    ],
  },
  seo: {
    title: "Meta Ads for Local Service Businesses",
    description:
      "Facebook and Instagram campaigns built around one clear offer. What is included, who it fits, and who it does not.",
  },
};
