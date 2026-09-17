"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/**
 * Fires contact_submit exactly once, and only when the form actually posted:
 * the form stores a marker in sessionStorage, this reads and removes it.
 * Opening /thank-you directly sends no fake Lead to Meta.
 */
export function ContactConversion() {
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("ei_contact");
      if (!raw) return;
      sessionStorage.removeItem("ei_contact");
      const data = JSON.parse(raw) as { service?: string; niche?: string };
      track("contact_submit", { service: data.service, niche: data.niche });
    } catch {
      // nothing to fire
    }
  }, []);
  return null;
}
