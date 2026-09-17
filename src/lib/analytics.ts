/**
 * track(event, props) forwards to gtag / fbq when they exist. No-op otherwise.
 * Event names are ours; the Meta and GA4 mappings live here in one place.
 */

type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const META_STANDARD: Record<string, string> = {
  contact_submit: "Lead",
  subscribe: "CompleteRegistration",
};

const GA4_NAME: Record<string, string> = {
  contact_submit: "generate_lead",
  subscribe: "sign_up",
  video_play: "video_start",
  video_progress: "video_progress",
  cta_click: "select_content",
};

export function track(event: string, props: Props = {}): void {
  if (typeof window === "undefined") return;
  try {
    if (window.gtag) {
      window.gtag("event", GA4_NAME[event] ?? event, props);
    }
    if (window.fbq) {
      const standard = META_STANDARD[event];
      if (standard) window.fbq("track", standard, props);
      else window.fbq("trackCustom", event, props);
    }
  } catch {
    // analytics must never break the page
  }
}
