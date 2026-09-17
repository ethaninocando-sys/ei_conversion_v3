import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { nicheList } from "@/content/niches";
import { serviceList } from "@/content/services";

/**
 * Listed: /, /guide, /guide/[niche], /services, /services/[service], /contact, /privacy.
 * Excluded on purpose: /learn/*, /thank-you, /quiz/*, /unsubscribe, /admin/*.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, site.url).toString();
  return [
    { url: url("/"), changeFrequency: "monthly", priority: 1 },
    { url: url("/guide"), changeFrequency: "monthly", priority: 0.9 },
    ...nicheList.map((n) => ({ url: url(`/guide/${n.slug}`), changeFrequency: "monthly" as const, priority: 0.9 })),
    { url: url("/services"), changeFrequency: "monthly", priority: 0.8 },
    ...serviceList.map((s) => ({ url: url(`/services/${s.slug}`), changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: url("/contact"), changeFrequency: "yearly", priority: 0.7 },
    { url: url("/privacy"), changeFrequency: "yearly", priority: 0.2 },
  ];
}
