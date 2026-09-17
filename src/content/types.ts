export const SERVICE_SLUGS = ["website", "meta-ads", "local-seo", "google-ads"] as const;
export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

export type Fit = "strong" | "good" | "situational" | "later";

export interface ServiceFit {
  service: ServiceSlug;
  rank: 1 | 2 | 3 | 4;
  fit: Fit;
  /** Short qualifier shown next to the fit label, e.g. "prerequisite". */
  fitNote?: string;
  summary: string;
  pros: string[];
  cons: string[];
}

export interface StartingMix {
  title: string;
  steps: string[];
  rationale: string;
}

export interface Niche {
  /** Must equal the key in niches/index.ts (content.test.ts checks). */
  slug: string;
  /** "Roofing" */
  name: string;
  /** "roofers", used by joinNames() on Home. */
  plural: string;
  /** One line for the niche picker. */
  teaser: string;
  headline: string;
  intro: string;
  buyerContext: string[];
  /** Exactly four, one per service. */
  fits: ServiceFit[];
  startingMix: StartingMix;
  seo: { title: string; description: string };
}

export interface DeepDive {
  teaser: string;
  chapters: { label: string; at?: string }[];
  mistakes: string[];
}

export interface Service {
  slug: ServiceSlug;
  name: string;
  oneLiner: string;
  /** H1 sub: a statement of the work, never a result claim. */
  promise: string;
  bestFor: string;
  included: string[];
  /**
   * Required (non-empty) for meta-ads and google-ads; states the test-budget
   * method, never inexperience. content.test.ts enforces presence.
   */
  honestLine?: string;
  goodFit: string[];
  notFit: string[];
  process: string[];
  /** Rendered under "How we work"; required non-empty. */
  pricingLine: string;
  deepDive: DeepDive;
  seo: { title: string; description: string };
}

export interface HomeContent {
  eyebrow: string;
  h1: string;
  /** May contain the token {niches}, replaced by joinNames(nicheList). */
  sub: string;
  vslHeading: string;
  vslBullets: [string, string, string];
  plainDealing: { heading: string; bullets: string[] };
}

export interface ContactContent {
  replyWindow: string;
  whatHappensNext: [string, string, string];
}

export type VideoSlotKey = "home" | `services.${ServiceSlug}.short` | `learn.${ServiceSlug}`;

export interface VideoSlot {
  /** Object key in the media bucket, e.g. video/home.mp4 */
  key: string;
  /** Poster object key, e.g. video/home.jpg */
  poster: string;
  title: string;
  durationSeconds?: number;
  /** Flip to true once the file and poster are uploaded. */
  ready: boolean;
}
