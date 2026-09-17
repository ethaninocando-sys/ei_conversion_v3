import type { Niche } from "@/content/types";

export const roofing: Niche = {
  slug: "roofing",
  name: "Roofing",
  plural: "roofers",
  teaser: "High-ticket, seasonal, storm-driven. Search wins.",
  headline: "Marketing for roofers: where the good jobs actually come from",
  intro:
    "Roofing is high-ticket, seasonal, and often storm-driven. The homeowner usually does not know a roofer before they need one. That shapes everything below.",
  buyerContext: [
    "Most residential jobs start with a search after a leak, a storm, or an inspection report.",
    "Ticket size is large, so a single job can pay for a month of advertising. That makes paid search viable even at expensive clicks.",
    "Homeowners get several quotes. Reviews, photos of real jobs, and a fast callback decide who wins.",
    "Insurance work and retail work are different sales; your marketing should say which one you want.",
    "Demand spikes after weather events, so whatever you run has to turn up and down quickly.",
  ],
  fits: [
    {
      service: "google-ads",
      rank: 1,
      fit: "strong",
      summary:
        "Someone searching 'roof repair near me' after a storm is as close to a ready buyer as marketing gets.",
      pros: [
        "Catches people at the moment of need.",
        "You control the service area and the hours you take calls.",
        "Can be paused between storms and turned up after.",
        "Call-only and call-extension formats fit a phone-driven trade.",
      ],
      cons: [
        "Roofing clicks are among the more expensive in local services, so mistakes cost real money.",
        "A weak landing page or slow callback wastes the spend.",
        "Needs conversion tracking set up before the first dollar is spent.",
        "Lead quality varies. Expect price shoppers mixed in.",
      ],
    },
    {
      service: "local-seo",
      rank: 2,
      fit: "good",
      summary:
        "The map pack is where homeowners compare a few roofers at once. Being there is free traffic, but it takes months to earn.",
      pros: [
        "No cost per click once you rank.",
        "Reviews and job photos compound over time.",
        "Supports every other channel, because people check your Google profile after seeing an ad.",
        "Works for both storm and retail demand.",
      ],
      cons: [
        "Slow. Usually months before it moves.",
        "Competitive in most metros.",
        "Depends on a steady review process you have to actually run.",
        "Limited control over which neighborhoods you show up in.",
      ],
    },
    {
      service: "website",
      rank: 3,
      fit: "good",
      fitNote: "prerequisite",
      summary:
        "Your website is where the ad click and the map click both land. If it is slow or vague, the other channels leak.",
      pros: [
        "One-time fix that lifts every other channel.",
        "Shows real job photos, service area, licensing, and financing clearly.",
        "A fast mobile site with a tap-to-call button matches how homeowners contact roofers.",
      ],
      cons: [
        "A website alone does not create demand.",
        "Ranked third because if your current site is already fast, clear, and mobile-friendly you may not need a new one.",
        "Rebuilding can distract from getting leads flowing.",
      ],
    },
    {
      service: "meta-ads",
      rank: 4,
      fit: "situational",
      summary:
        "Facebook and Instagram can work for free inspections and storm campaigns, but the leads are colder than search.",
      pros: [
        "Cheap reach in a specific zip code after a storm.",
        "Good for retargeting people who visited the site but did not call.",
        "Before-and-after photos and short videos perform well.",
        "Useful for financing or seasonal offers.",
      ],
      cons: [
        "People are not looking for a roofer while scrolling, so more of the leads are tire-kickers.",
        "Lead forms need fast follow-up or they go cold.",
        "Takes creative testing and budget to find what works.",
        "Harder to measure than search.",
      ],
    },
  ],
  startingMix: {
    title: "A sensible first ninety days for a roofer",
    steps: [
      "Fix the landing experience first: fast mobile page, real photos, license number, tap-to-call, a form that gets answered within minutes.",
      "Launch Google Ads search for repair and replacement terms in your service area with call tracking on.",
      "Start Local SEO the same week: clean up the Google Business Profile, set up a review request habit after every job, post job photos.",
      "Add Meta retargeting once the site gets steady traffic, then test a storm or inspection campaign.",
    ],
    rationale:
      "Search captures demand that already exists. Local SEO is slow, so it should start early and run in the background. Meta is added last because it needs the site and follow-up process to be working first.",
  },
  seo: {
    title: "Marketing for Roofers: Google Ads, Local SEO, Websites and Meta Ads Ranked",
    description:
      "Which marketing fits a roofing company? All four services ranked with honest pros and cons, and a sensible first ninety days.",
  },
};
