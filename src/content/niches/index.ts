import type { Niche, ServiceSlug } from "@/content/types";
import { roofing } from "./roofing";
import { medSpa } from "./med-spa";
import { plumbing } from "./plumbing";

/**
 * The single niche registry. Adding a niche = one new file plus one import
 * line and one key here. Everything else (picker, sitemap, static params,
 * Home copy, footer, contact industry select) reads this record.
 */
export const niches = {
  roofing,
  "med-spa": medSpa,
  plumbing,
} as const satisfies Record<string, Niche>;

export type NicheSlug = keyof typeof niches;

export const NICHE_SLUGS = Object.keys(niches) as [NicheSlug, ...NicheSlug[]];

/** Contact form, zod, prefill: every niche plus "other". */
export const NICHE_FORM_VALUES = [...NICHE_SLUGS, "other"] as const;
export type NicheFormValue = (typeof NICHE_FORM_VALUES)[number];

export const nicheList: Niche[] = Object.values(niches);

export function isNicheSlug(value: string): value is NicheSlug {
  return (NICHE_SLUGS as readonly string[]).includes(value);
}

export function isNicheFormValue(value: string): value is NicheFormValue {
  return (NICHE_FORM_VALUES as readonly string[]).includes(value);
}

/** Niches where the service is ranked strong or good. Derived, never hand-maintained. */
export function nichesForService(slug: ServiceSlug): Niche[] {
  return nicheList.filter((n) => {
    const fit = n.fits.find((f) => f.service === slug);
    return fit !== undefined && (fit.fit === "strong" || fit.fit === "good");
  });
}

/** "roofers, med spas, and plumbers" (or "Roofers, Med Spas and Plumbers" capitalized, for titles). */
export function joinNames(list: Niche[], opts?: { capitalized?: boolean }): string {
  const names = list.map((n) =>
    opts?.capitalized
      ? n.plural.replace(/\b\w/g, (c) => c.toUpperCase())
      : n.plural,
  );
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  const last = names[names.length - 1];
  const head = names.slice(0, -1).join(", ");
  return opts?.capitalized ? `${head} and ${last}` : `${head}, and ${last}`;
}
