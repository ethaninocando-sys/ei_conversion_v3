/**
 * Runs in `prebuild`. Two jobs:
 *  1. Required env vars by APP_PHASE (production only for the site URL).
 *  2. On production builds, refuse while any [BRACKET] placeholder remains in
 *     src/config or src/content, so a live site never shows literal brackets.
 * Preview and local builds only warn, so development with placeholders proceeds.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const phase = Number(process.env.APP_PHASE ?? "1");
const publicPhase = Number(process.env.NEXT_PUBLIC_APP_PHASE ?? "1");
const isProduction = process.env.VERCEL_ENV === "production";

const problems: string[] = [];
const warnings: string[] = [];

if (![1, 2, 3].includes(phase)) problems.push(`APP_PHASE must be 1, 2, or 3 (got "${process.env.APP_PHASE}")`);
if (phase !== publicPhase) problems.push(`APP_PHASE (${phase}) and NEXT_PUBLIC_APP_PHASE (${publicPhase}) must match`);

const required: string[] = [];
if (isProduction) required.push("NEXT_PUBLIC_SITE_URL");
if (phase >= 2) required.push("DATABASE_URL", "RESEND_API_KEY", "RESEND_SEGMENT_ID", "OWNER_EMAIL", "IP_HASH_SALT");
if (phase >= 3) required.push("ADMIN_PASSWORD", "ADMIN_SESSION_SECRET", "CRON_SECRET");

for (const name of required) {
  if (!process.env[name]) problems.push(`Missing required env var for phase ${phase}: ${name}`);
}
if (phase >= 3 && !process.env.RESEND_WEBHOOK_SECRET) {
  warnings.push("RESEND_WEBHOOK_SECRET is unset; /api/webhooks/resend will return 503 until it is.");
}

const media = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
if (media) {
  try {
    new URL(media);
  } catch {
    problems.push(`NEXT_PUBLIC_MEDIA_BASE_URL is not a valid URL: ${media}`);
  }
}

// Bracket placeholder scan.
const BRACKET = /\[[A-Z][^\]]*\]/;
function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|json)$/.test(entry)) out.push(p);
  }
  return out;
}
const placeholderHits: string[] = [];
for (const dir of ["src/config", "src/content"]) {
  for (const file of walk(dir)) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      if (BRACKET.test(line)) placeholderHits.push(`${file}:${i + 1}`);
    });
  }
}
if (placeholderHits.length) {
  const msg = `${placeholderHits.length} bracket placeholder(s) remain:\n  ${placeholderHits.join("\n  ")}`;
  if (isProduction) problems.push(msg);
  else warnings.push(msg);
}

for (const w of warnings) console.warn(`[check-env] warning: ${w}`);
if (problems.length) {
  for (const p of problems) console.error(`[check-env] error: ${p}`);
  process.exit(1);
}
console.log(`[check-env] ok (phase ${phase}${isProduction ? ", production" : ""})`);
