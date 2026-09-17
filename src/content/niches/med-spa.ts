import type { Niche } from "@/content/types";

export const medSpa: Niche = {
  slug: "med-spa",
  name: "Med spa",
  plural: "med spas",
  teaser: "Visual, elective, repeatable. Discovery beats search.",
  headline: "Marketing for med spas: booked chairs, repeat clients, no gimmicks",
  intro:
    "A med spa sells elective, visual, repeatable treatments. Clients come back every few months, so the value of one new client is much higher than the first appointment. That changes which channels pay off.",
  buyerContext: [
    "Treatments are chosen, not forced. People browse, compare, and are influenced by what they see.",
    "A first-time client often becomes a recurring one, so a modest acquisition cost is fine.",
    "Trust and safety matter: credentials, cleanliness, and real (consented) photos do the persuading.",
    "Advertising platforms restrict some health, body-image, and before-and-after claims. Compliance is part of the plan, not an afterthought.",
    "Online booking with a visible menu and prices lowers the barrier.",
  ],
  fits: [
    {
      service: "meta-ads",
      rank: 1,
      fit: "strong",
      summary:
        "Med spa services are visual and demographic-targetable, which is exactly what Instagram and Facebook are good at.",
      pros: [
        "Reach the right age, location, and interests without waiting for a search.",
        "Video and photo creative from the clinic performs.",
        "Intro offers and seasonal packages are easy to promote.",
        "Retargeting brings back browsers who did not book.",
      ],
      cons: [
        "Platform policies limit before-and-after imagery and certain claims, so ads get rejected until you learn the rules.",
        "Needs a steady flow of fresh creative.",
        "Leads must be followed up fast, ideally with online booking.",
        "Takes a few weeks of testing to settle.",
      ],
    },
    {
      service: "local-seo",
      rank: 2,
      fit: "good",
      summary:
        "People search '[treatment] near me' and pick from the map. Reviews and photos on your profile matter more here than in most industries.",
      pros: [
        "High-intent traffic at no cost per click.",
        "Reviews build the trust an elective purchase needs.",
        "Treatment-specific pages can rank on their own.",
        "Long-lived once established.",
      ],
      cons: [
        "Slow to build.",
        "Med spa search is competitive in cities.",
        "Needs consistent review generation and photo updates.",
        "Medical-adjacent content is held to a higher quality bar by search engines.",
      ],
    },
    {
      service: "website",
      rank: 3,
      fit: "good",
      summary:
        "Your site has to do three jobs: show credibility, list the menu with prices or ranges, and book the appointment.",
      pros: [
        "Online booking removes phone tag.",
        "Treatment pages support both SEO and ads.",
        "A clean design signals a safe, professional clinic.",
      ],
      cons: [
        "Does not generate demand on its own.",
        "If you already have booking software and a decent site, a redesign is not the first priority.",
        "Photo and consent management is real work.",
      ],
    },
    {
      service: "google-ads",
      rank: 4,
      fit: "situational",
      summary:
        "Search intent is high, but clicks for popular treatments are expensive and the ad rules for health services are stricter.",
      pros: [
        "Catches people ready to book a specific treatment.",
        "Strong for high-value treatments where one booking justifies the click cost.",
        "Precise geographic control.",
      ],
      cons: [
        "Costly in competitive metros.",
        "Some treatment categories face certification or policy restrictions.",
        "Needs treatment-specific landing pages to convert.",
        "Easy to overspend on broad terms.",
      ],
    },
  ],
  startingMix: {
    title: "Where a med spa should start",
    steps: [
      "Make sure the website has online booking, a clear treatment menu, credentials, and consented photos.",
      "Set up the Google Business Profile properly and start a review routine after every visit.",
      "Launch a Meta campaign with one intro offer and two or three creatives, sending traffic to the booking page.",
      "Once Meta is stable, test Google Ads on your two highest-value treatments.",
    ],
    rationale:
      "Meta fits the visual, discovery-driven way people find treatments and is cheaper to test than search. Local SEO runs in the background. Google Ads is added for specific high-value treatments once landing pages exist.",
  },
  seo: {
    title: "Marketing for Med Spas: Meta Ads, Local SEO, Websites and Google Ads Ranked",
    description:
      "Which marketing fits a med spa? All four services ranked with honest pros and cons, including ad policy realities, plus a starting mix.",
  },
};
