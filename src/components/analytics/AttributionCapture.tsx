"use client";

import { useEffect } from "react";
import { attributionFromLocation, readAttributionCookie, serializeAttributionCookie } from "@/lib/attribution";

/** Writes the first-touch ei_attr cookie once. Never overwrites an existing cookie. */
export function AttributionCapture() {
  useEffect(() => {
    try {
      if (readAttributionCookie(document.cookie)) return;
      const attr = attributionFromLocation(window.location, document.referrer, new Date());
      document.cookie = serializeAttributionCookie(attr);
    } catch {
      // cookies disabled; nothing to do
    }
  }, []);
  return null;
}
