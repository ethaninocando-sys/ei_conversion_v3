"use client";

import { useEffect, useRef } from "react";

/**
 * Two anti-bot fields: a visually hidden text input bots tend to fill, and
 * a started_at timestamp written on mount (never at render, which would be
 * build time on static pages). The server rejects filled honeypots and
 * sub-second submissions silently.
 */
export function Honeypot() {
  const startedAt = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (startedAt.current) startedAt.current.value = String(Date.now());
  }, []);
  return (
    <>
      <div className="sr-only-field" aria-hidden="true">
        <label htmlFor="company_website">Company website</label>
        <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <input ref={startedAt} type="hidden" name="started_at" defaultValue="" />
    </>
  );
}
