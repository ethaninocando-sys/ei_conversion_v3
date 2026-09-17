import type { Service, ServiceSlug } from "@/content/types";
import { SERVICE_SLUGS } from "@/content/types";
import { website } from "./website";
import { metaAds } from "./meta-ads";
import { localSeo } from "./local-seo";
import { googleAds } from "./google-ads";

export const services: Record<ServiceSlug, Service> = {
  website,
  "meta-ads": metaAds,
  "local-seo": localSeo,
  "google-ads": googleAds,
};

export const serviceList: Service[] = SERVICE_SLUGS.map((slug) => services[slug]);

export function isServiceSlug(value: string): value is ServiceSlug {
  return (SERVICE_SLUGS as readonly string[]).includes(value);
}
