import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const media = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

const nextConfig: NextConfig = {
  images: {
    // Poster host is added only when the media base URL exists, so early
    // builds do not throw on new URL(undefined).
    remotePatterns: media ? [{ protocol: "https", hostname: new URL(media).hostname }] : [],
  },
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
};

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });

export default withBundleAnalyzer(nextConfig);
