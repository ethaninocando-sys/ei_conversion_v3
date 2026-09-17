import type { Service } from "@/content/types";

export const website: Service = {
  slug: "website",
  name: "Website",
  oneLiner: "A fast, clear site built to turn visits into calls.",
  promise: "A fast, clear site built to turn visits into calls, not to win design awards.",
  bestFor: "Businesses whose current site is slow, dated, or hard to update.",
  included: [
    "Mobile-first build with a speed budget",
    "Service pages and service-area pages",
    "Tap-to-call and short forms that get answered",
    "On-page SEO basics: titles, headings, structured data",
    "Analytics and call-tracking hooks ready for ads",
    "[REVISIONS POLICY, e.g. two rounds of revisions before launch]",
    "Launch checklist and thirty days of fixes after go-live",
  ],
  goodFit: [
    "Your site is slow, dated, or hard to update.",
    "You are running ads to a page that does not convert.",
    "You have no service pages, just a home page and a phone number.",
  ],
  notFit: [
    "You already have a fast site that converts.",
    "You want a large e-commerce store or a customer portal.",
  ],
  process: [
    "A short call about your services, area, and what a good lead looks like.",
    "Page plan and copy outline for your review.",
    "Build, with a preview link you can open on your phone.",
    "Launch, tracking check, and thirty days of fixes.",
  ],
  pricingLine: "[PRICING STANCE, e.g. flat project fee quoted after a call]",
  deepDive: {
    teaser: "[DEEP-DIVE TEASER, e.g. page structure, speed, and the call path]",
    chapters: [
      { label: "What a local service site must do" },
      { label: "Page structure that matches how people search" },
      { label: "Speed: why it matters and what we measure" },
      { label: "The call and form path" },
      { label: "Proof without fake reviews" },
      { label: "Measuring it" },
    ],
    mistakes: [
      "Stock photos everywhere.",
      "No phone number above the fold.",
      "No service area on the page.",
      "No tracking, so ads can never be judged.",
    ],
  },
  seo: {
    title: "Website Design for Local Service Businesses",
    description:
      "A fast, clear website built to turn visits into calls. What is included, who it fits, and who it does not.",
  },
};
