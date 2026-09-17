import type { MetadataRoute } from "next";
import { site } from "@/config/site";

/** The only robots source. There is no public/robots.txt. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }],
    sitemap: new URL("/sitemap.xml", site.url).toString(),
  };
}
