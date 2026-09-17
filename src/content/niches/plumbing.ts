import type { Niche } from "@/content/types";

export const plumbing: Niche = {
  slug: "plumbing",
  name: "Plumbing",
  plural: "plumbers",
  teaser: "Urgent and local. The map pack decides.",
  headline: "Marketing for plumbers: be the one they call when the water is on the floor",
  intro:
    "Most plumbing demand is urgent. The customer wants a plumber who can come today and looks trustworthy in ten seconds. Everything below is about being findable and credible at that moment.",
  buyerContext: [
    "Emergency jobs are decided in minutes: search, map pack, reviews, call.",
    "Non-emergency work (water heaters, remodels, repiping) is a slower, comparison-based sale.",
    "Phone calls matter more than forms. Answering the phone is part of marketing.",
    "Reviews and response time beat design polish.",
    "Service area and hours need to be obvious everywhere.",
  ],
  fits: [
    {
      service: "local-seo",
      rank: 1,
      fit: "strong",
      summary:
        "'Plumber near me' is decided in the map pack. Being in the top spots with good reviews is the best position in this trade.",
      pros: [
        "Matches urgent, location-based search exactly.",
        "No cost per call once established.",
        "Reviews compound.",
        "Works around the clock.",
      ],
      cons: [
        "Takes months and steady effort.",
        "Competitive in metros.",
        "You cannot force which neighborhoods you show in.",
        "Depends on a review habit your techs have to follow.",
      ],
    },
    {
      service: "google-ads",
      rank: 2,
      fit: "strong",
      summary:
        "Emergency search is the moment of need. Paid search with call-only ads puts your number in front of that moment while SEO catches up.",
      pros: [
        "Immediate calls.",
        "Can run only during hours you can actually dispatch.",
        "Call tracking shows exactly which terms produce jobs.",
        "Good for water heater and drain-specific campaigns too.",
      ],
      cons: [
        "Clicks are expensive for emergency terms.",
        "Wasted spend if nobody answers the phone.",
        "Needs negative keywords and tight service-area settings.",
        "Lead quality drops if the ad promises something you cannot deliver, like same-day service.",
      ],
    },
    {
      service: "website",
      rank: 3,
      fit: "good",
      fitNote: "prerequisite",
      summary:
        "Mobile-first, fast, tap-to-call, service area, hours, license. That is the whole brief.",
      pros: [
        "A fast page with a phone number front and center converts emergency traffic.",
        "Service pages support SEO for specific jobs.",
        "Shows licensing and insurance clearly.",
      ],
      cons: [
        "No demand on its own.",
        "A beautiful site is not the goal. A fast and clear one is.",
        "Ranked third because many plumbers can get by with a modest site as long as it loads quickly and the phone number works.",
      ],
    },
    {
      service: "meta-ads",
      rank: 4,
      fit: "later",
      summary:
        "Nobody scrolls Facebook looking for an emergency plumber. Meta works only for planned work and staying top of mind.",
      pros: [
        "Fine for water heater replacement offers, maintenance plans, or remodel work.",
        "Cheap local reach.",
        "Retargeting of site visitors.",
      ],
      cons: [
        "Poor match for urgent demand.",
        "Leads are slower and colder.",
        "Needs ongoing creative.",
        "Measurement is harder than search.",
      ],
    },
  ],
  startingMix: {
    title: "A plumber's first ninety days",
    steps: [
      "Google Business Profile: correct categories, service area, hours, photos, and a review request after every job.",
      "Website check: mobile speed, tap-to-call, service pages for your most common jobs.",
      "Google Ads search with call-only ads for emergency terms, scheduled to the hours you can dispatch, with call tracking.",
      "Revisit Meta later for planned work like water heaters or maintenance plans.",
    ],
    rationale:
      "Plumbing demand is urgent and local, so the map pack and search ads do the heavy lifting. Meta is a later add for the slower, planned jobs.",
  },
  seo: {
    title: "Marketing for Plumbers: Local SEO, Google Ads, Websites and Meta Ads Ranked",
    description:
      "Which marketing fits a plumbing company? All four services ranked for urgent, local demand, with pros, cons, and a first ninety days.",
  },
};
