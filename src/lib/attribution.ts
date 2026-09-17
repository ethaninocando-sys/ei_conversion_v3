/**
 * First-touch attribution stored in a first-party cookie `ei_attr` (JSON,
 * 30 days). Written once by AttributionCapture, read by AttributionFields
 * into hidden form inputs, validated server-side in Phase 2.
 */

export const ATTRIBUTION_COOKIE = "ei_attr";
export const ATTRIBUTION_MAX_AGE_DAYS = 30;

export const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "referrer",
  "landing_path",
  "first_seen_at",
] as const;

export type AttributionKey = (typeof ATTRIBUTION_KEYS)[number];
export type Attribution = Partial<Record<AttributionKey, string>>;

const MAX_LEN = 200;

function clip(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const v = value.trim().slice(0, MAX_LEN);
  return v.length ? v : undefined;
}

/** Build an attribution object from the current page (client only). */
export function attributionFromLocation(loc: Location, referrer: string, now: Date): Attribution {
  const params = new URLSearchParams(loc.search);
  const src = params.get("src");
  const attr: Attribution = {
    utm_source: clip(params.get("utm_source") ?? src),
    utm_medium: clip(params.get("utm_medium")),
    utm_campaign: clip(params.get("utm_campaign")),
    utm_content: clip(params.get("utm_content")),
    utm_term: clip(params.get("utm_term")),
    referrer: clip(referrer),
    landing_path: clip(loc.pathname),
    first_seen_at: now.toISOString(),
  };
  return Object.fromEntries(Object.entries(attr).filter(([, v]) => v !== undefined)) as Attribution;
}

export function readAttributionCookie(cookieString: string): Attribution | null {
  const part = cookieString
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${ATTRIBUTION_COOKIE}=`));
  if (!part) return null;
  try {
    const raw = decodeURIComponent(part.slice(ATTRIBUTION_COOKIE.length + 1));
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const out: Attribution = {};
    for (const key of ATTRIBUTION_KEYS) {
      const v = (parsed as Record<string, unknown>)[key];
      if (typeof v === "string") out[key] = clip(v);
    }
    return out;
  } catch {
    return null;
  }
}

export function serializeAttributionCookie(attr: Attribution): string {
  const value = encodeURIComponent(JSON.stringify(attr));
  const maxAge = ATTRIBUTION_MAX_AGE_DAYS * 24 * 60 * 60;
  return `${ATTRIBUTION_COOKIE}=${value}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}
