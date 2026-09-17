import { describe, expect, it } from "vitest";
import { site } from "@/config/site";
import { SERVICE_SLUGS } from "@/content/types";
import { niches, nicheList, NICHE_SLUGS, nichesForService, joinNames } from "@/content/niches";
import { services, serviceList } from "@/content/services";
import { home } from "@/content/home";
import { contact } from "@/content/contact";
import { videos } from "@/content/videos";
import { privacy } from "@/content/privacy";

/** Collect every string in a nested object, with a path for error messages. */
function strings(value: unknown, path = "root", out: { path: string; text: string }[] = []) {
  if (typeof value === "string") out.push({ path, text: value });
  else if (Array.isArray(value)) value.forEach((v, i) => strings(v, `${path}[${i}]`, out));
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) strings(v, `${path}.${k}`, out);
  }
  return out;
}

const ALL_CONTENT = {
  site,
  niches,
  services,
  home,
  contact,
  videos,
  privacy,
};

/**
 * Claims that must never appear in content: percentages, multipliers, counts
 * of clients or leads, testimonials, guarantees, and results language. The
 * site earns trust by teaching, not by numbers it cannot show.
 */
const CLAIMS = [
  /\d+(\.\d+)?\s?%/,
  /\b\d+x\b/i,
  /\b\d+ (clients|customers|leads|calls|jobs)\b/i,
  /\b(testimonial|case stud|our clients|trusted by|guarantee|ROI|we (got|generated|increased|doubled)|results? for)\b/i,
];

const BRACKET = /\[[A-Z][^\]]*\]/;

describe("niche registry", () => {
  it("every niche key equals its slug", () => {
    for (const [key, n] of Object.entries(niches)) expect(n.slug).toBe(key);
  });

  it("every niche has four fits, ranks 1 to 4, one per service", () => {
    for (const n of nicheList) {
      expect(n.fits).toHaveLength(4);
      const ranks = n.fits.map((f) => f.rank).sort();
      expect(ranks).toEqual([1, 2, 3, 4]);
      const svc = new Set(n.fits.map((f) => f.service));
      expect(svc.size).toBe(4);
      for (const slug of SERVICE_SLUGS) expect(svc.has(slug)).toBe(true);
    }
  });

  it("every niche has non-empty plural, teaser, headline, intro, buyer context, starting mix, and seo", () => {
    for (const n of nicheList) {
      expect(n.plural.trim().length).toBeGreaterThan(0);
      expect(n.teaser.trim().length).toBeGreaterThan(0);
      expect(n.headline.trim().length).toBeGreaterThan(0);
      expect(n.intro.trim().length).toBeGreaterThan(0);
      expect(n.buyerContext.length).toBeGreaterThan(0);
      expect(n.startingMix.steps.length).toBeGreaterThan(0);
      expect(n.startingMix.rationale.trim().length).toBeGreaterThan(0);
      expect(n.seo.title.trim().length).toBeGreaterThan(0);
      expect(n.seo.description.trim().length).toBeGreaterThan(0);
      for (const f of n.fits) {
        expect(f.summary.trim().length).toBeGreaterThan(0);
        expect(f.pros.length).toBeGreaterThan(0);
        expect(f.cons.length).toBeGreaterThan(0);
      }
    }
  });

  it("nichesForService derives from fit levels", () => {
    for (const slug of SERVICE_SLUGS) {
      for (const n of nichesForService(slug)) {
        const fit = n.fits.find((f) => f.service === slug)!;
        expect(["strong", "good"]).toContain(fit.fit);
      }
    }
  });

  it("joinNames formats one, two, and three names", () => {
    expect(joinNames(nicheList.slice(0, 1))).toBe(nicheList[0].plural);
    expect(joinNames(nicheList.slice(0, 2))).toBe(`${nicheList[0].plural} and ${nicheList[1].plural}`);
    expect(joinNames(nicheList)).toBe("roofers, med spas, and plumbers");
    expect(joinNames(nicheList, { capitalized: true })).toBe("Roofers, Med Spas and Plumbers");
  });

  it("NICHE_SLUGS matches the registry", () => {
    expect([...NICHE_SLUGS].sort()).toEqual(Object.keys(niches).sort());
  });
});

describe("services", () => {
  it("covers every service slug exactly once", () => {
    expect(serviceList.map((s) => s.slug)).toEqual([...SERVICE_SLUGS]);
    for (const s of serviceList) expect(services[s.slug]).toBe(s);
  });

  it("every service has the required non-empty fields", () => {
    for (const s of serviceList) {
      expect(s.pricingLine.trim().length).toBeGreaterThan(0);
      expect(s.deepDive.teaser.trim().length).toBeGreaterThan(0);
      expect(s.deepDive.chapters.length).toBeGreaterThan(0);
      expect(s.deepDive.mistakes.length).toBeGreaterThan(0);
      expect(s.included.length).toBeGreaterThan(0);
      expect(s.goodFit.length).toBeGreaterThan(0);
      expect(s.notFit.length).toBeGreaterThan(0);
      expect(s.process.length).toBeGreaterThan(0);
    }
  });

  it("the two ads services carry a non-empty honest line", () => {
    for (const slug of ["meta-ads", "google-ads"] as const) {
      expect(services[slug].honestLine?.trim().length ?? 0).toBeGreaterThan(0);
    }
  });

  it("every video slot exists for every service and the home", () => {
    expect(videos.home).toBeDefined();
    for (const slug of SERVICE_SLUGS) {
      expect(videos[`services.${slug}.short`]).toBeDefined();
      expect(videos[`learn.${slug}`]).toBeDefined();
    }
  });
});

describe("content honesty", () => {
  it("contains no fabricated claims (percentages, multipliers, counts, testimonials, guarantees)", () => {
    const offenders: string[] = [];
    for (const { path, text } of strings(ALL_CONTENT)) {
      for (const re of CLAIMS) {
        if (re.test(text)) offenders.push(`${path}: "${text}" matches ${re}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("contains no bracket placeholders when CONTENT_STRICT=1", () => {
    if (process.env.CONTENT_STRICT !== "1") return;
    const offenders = strings(ALL_CONTENT)
      .filter(({ text }) => BRACKET.test(text))
      .map(({ path, text }) => `${path}: ${text}`);
    expect(offenders).toEqual([]);
  });
});
