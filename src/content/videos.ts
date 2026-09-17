import type { VideoSlot, VideoSlotKey } from "@/content/types";

/**
 * Slot registry. Object keys live in the media bucket (Cloudflare R2).
 * Flip `ready` to true once the MP4 and poster are uploaded and
 * NEXT_PUBLIC_MEDIA_BASE_URL is set. Until then the page renders a
 * "coming soon" card and ships regardless.
 */
export const videos: Record<VideoSlotKey, VideoSlot> = {
  home: {
    key: "video/home.mp4",
    poster: "video/home.jpg",
    title: "How we think about your first campaign",
    ready: false,
  },
  "services.website.short": {
    key: "video/services/website-short.mp4",
    poster: "video/services/website-short.jpg",
    title: "Website: the short version",
    ready: false,
  },
  "services.meta-ads.short": {
    key: "video/services/meta-ads-short.mp4",
    poster: "video/services/meta-ads-short.jpg",
    title: "Meta Ads: the short version",
    ready: false,
  },
  "services.local-seo.short": {
    key: "video/services/local-seo-short.mp4",
    poster: "video/services/local-seo-short.jpg",
    title: "Local SEO: the short version",
    ready: false,
  },
  "services.google-ads.short": {
    key: "video/services/google-ads-short.mp4",
    poster: "video/services/google-ads-short.jpg",
    title: "Google Ads: the short version",
    ready: false,
  },
  "learn.website": {
    key: "video/learn/website-deep.mp4",
    poster: "video/learn/website-deep.jpg",
    title: "Website: the full walkthrough",
    ready: false,
  },
  "learn.meta-ads": {
    key: "video/learn/meta-ads-deep.mp4",
    poster: "video/learn/meta-ads-deep.jpg",
    title: "Meta Ads: the full walkthrough",
    ready: false,
  },
  "learn.local-seo": {
    key: "video/learn/local-seo-deep.mp4",
    poster: "video/learn/local-seo-deep.jpg",
    title: "Local SEO: the full walkthrough",
    ready: false,
  },
  "learn.google-ads": {
    key: "video/learn/google-ads-deep.mp4",
    poster: "video/learn/google-ads-deep.jpg",
    title: "Google Ads: the full walkthrough",
    ready: false,
  },
};

export function mediaUrl(slot: VideoSlotKey): { src: string; poster: string } | null {
  const base = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  const v = videos[slot];
  if (!base || !v.ready) return null;
  const trimmed = base.replace(/\/+$/, "");
  return { src: `${trimmed}/${v.key}`, poster: `${trimmed}/${v.poster}` };
}
