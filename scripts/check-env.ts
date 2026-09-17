/**
 * Runs in `prebuild`. Two jobs:
 *
 *  1. Required env vars for the current APP_PHASE.
 *  2. Refuse to build the LIVE site while [BRACKET] placeholders remain, so
 *     ei-conversion.com can never show literal brackets or send mail from
 *     "[OWNER FIRST NAME]".
 *
 * "Live" means a production deployment that serves the real domain. A
 * production deployment still on its *.vercel.app URL is a review build, so
 * placeholders only warn there: the owner has to be able to look at the site
 * before writing the copy that fills them in.
 */
import { site } from "../src/config/site";
import { findPlaceholders } from "./placeholders";

/** Vercel hands unset variables through as "", which `??` does not catch. */
function env(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

const problems: string[] = [];
const warnings: string[] = [];

const rawPhase = env("APP_PHASE") ?? "1";
const rawPublicPhase = env("NEXT_PUBLIC_APP_PHASE") ?? "1";
const phase = Number(rawPhase);
const publicPhase = Number(rawPublicPhase);

if (![1, 2, 3].includes(phase)) problems.push(`APP_PHASE must be 1, 2, or 3 (got "${rawPhase}")`);
if (phase !== publicPhase) {
  problems.push(`APP_PHASE (${rawPhase}) and NEXT_PUBLIC_APP_PHASE (${rawPublicPhase}) must match`);
}

const isProduction = process.env.VERCEL_ENV === "production";
// VERCEL_PROJECT_PRODUCTION_URL is the project's production domain: the custom
// domain once one is attached, the *.vercel.app URL before that.
const productionHost = env("NEXT_PUBLIC_SITE_URL") ?? env("VERCEL_PROJECT_PRODUCTION_URL") ?? "";
const isLive = isProduction && productionHost.includes(site.domain);

const required: string[] = [];
if (isLive) required.push("NEXT_PUBLIC_SITE_URL");
if (phase >= 2) required.push("DATABASE_URL", "RESEND_API_KEY", "RESEND_SEGMENT_ID", "OWNER_EMAIL", "IP_HASH_SALT");
if (phase >= 3) required.push("ADMIN_PASSWORD", "ADMIN_SESSION_SECRET", "CRON_SECRET");

for (const name of required) {
  if (!env(name)) problems.push(`Missing required env var for phase ${phase}: ${name}`);
}
if (isProduction && !isLive && !env("NEXT_PUBLIC_SITE_URL")) {
  warnings.push(
    `NEXT_PUBLIC_SITE_URL is unset; canonical URLs will use ${productionHost || "the deployment URL"}. Set it when ${site.domain} is connected.`,
  );
}
if (phase >= 3 && !env("RESEND_WEBHOOK_SECRET")) {
  warnings.push("RESEND_WEBHOOK_SECRET is unset; /api/webhooks/resend will return 503 until it is.");
}

for (const name of ["NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_MEDIA_BASE_URL"]) {
  const value = env(name);
  if (!value) continue;
  try {
    new URL(value);
  } catch {
    problems.push(`${name} is not a valid URL: ${value}`);
  }
}

const placeholders = findPlaceholders(["src/config", "src/content"]);
if (placeholders.length) {
  const message = `${placeholders.length} bracket placeholder(s) remain:\n  ${placeholders.join("\n  ")}`;
  if (isLive) problems.push(message);
  else warnings.push(`${message}\n  Fill these in before connecting ${site.domain}. This build is allowed to ship them.`);
}

for (const warning of warnings) console.warn(`[check-env] warning: ${warning}`);
if (problems.length) {
  for (const problem of problems) console.error(`[check-env] error: ${problem}`);
  process.exit(1);
}
console.log(
  `[check-env] ok (phase ${phase}${isLive ? `, live on ${site.domain}` : isProduction ? ", production review build" : ""})`,
);
