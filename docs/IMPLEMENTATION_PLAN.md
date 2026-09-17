# Ei Conversion: Implementation Plan (final)

Repo: `/home/user/ei_conversion_v3` (empty, greenfield). Date: 2026-09-17. The stack, funnel, and phases in the spec are fixed. This document turns them into a build order a developer can start today and an owner can follow along with. Anything in [BRACKETS] is content the owner supplies before the site goes live. Versions and vendor limits were checked by web search on 2026-09-17; URLs are cited inline. Where a claim could not be verified it is marked "verify at install".

How to read this: sections 1, 2, 16, 17, and 19 are for the owner. Everything else is for the developer, though the owner is welcome to read along.

## 1. Overview

**Goal.** A fast, credible marketing site for a solo operator selling four services (Website, Meta Ads, Local SEO, Google Ads) to local service businesses. It must read like an established firm without inventing proof. Credibility comes from an honest educational Guide, not from a track record the owner does not have yet. No fabricated testimonials, logos, case studies, or numbers anywhere, including inside copy frameworks.

**Audience.** Owners and office managers of roofing companies, med spas, and plumbing companies (more niches later). They are busy, on a phone between jobs, skeptical of "guru" marketing, and want a straight answer to "what should I actually do first?"

**The funnel.**

```
Home (/) -> Guide (/guide -> /guide/[niche]) -> Services (/services -> /services/[service]) -> Contact (/contact) -> /thank-you
                                                       |
                                                       +-> email capture -> instant redirect + welcome email -> /learn/[service] -> /contact
                                                                          -> daily quiz email -> /quiz/[slug] -> /contact
```

Two paths, one destination. The fast path is Guide -> Services -> Contact. The slow path is the email list: a visitor gives an email to watch a deep-dive video, then receives a short daily marketing puzzle that keeps the owner top of mind until they are ready to talk. Home links only to the Guide, on purpose: the Guide is the credibility play, so every visitor is sent through it.

**Success criteria (measurable, no vanity).**

| Criterion | Target |
|---|---|
| Lighthouse mobile (Performance, Accessibility, Best Practices, SEO) | 90+ on `/`, `/guide/roofing`, `/services/website`, `/contact` |
| Contact form end to end | Lead row in `leads`, owner email in inbox within 60 seconds, auto-reply to sender |
| Subscribe end to end | Row in `subscribers` tagged with the service, Resend contact, exactly one unlock email per service per opt-in |
| Daily quiz | One email per active subscriber per day, never the same quiz twice to the same person, answers recorded per subscriber |
| Content honesty | Zero testimonials, logos, case studies, or unverifiable numbers, enforced by the regex checks in `test/content.test.ts` (section 16) |
| Change cost | Adding a niche is one new content file plus one import line; renaming the brand is a one-file change |

## 2. Stack and vendors

Pin exact versions at install and record them in `package.json`.

| Vendor / package | Purpose | Version (verified 2026-09-17) | Free tier | Paid plan needed when |
|---|---|---|---|---|
| Next.js (App Router, TypeScript) | Framework, routing, server actions, route handlers, `next/font` | 16.3.5, current stable major; 16.4 is on canary (https://www.npmjs.com/package/next, https://github.com/vercel/next.js/releases). Requires Node >= 20.9 | n/a | never |
| React | UI | the version `create-next-app` installs (React 19.x) | n/a | never |
| Tailwind CSS | Styling, design tokens via `@theme` | 4.3.3 (https://github.com/tailwindlabs/tailwindcss/releases/tag/v4.3.3) | n/a | never |
| Node.js | Runtime | 24.x, Vercel's default for new projects; Node 20 is disabled in Vercel project settings on 2026-10-01 (https://vercel.com/changelog/node-js-24-lts-is-now-generally-available-for-builds-and-functions, https://vercel.com/docs/functions/runtimes/node-js/node-js-versions) | n/a | never |
| Vercel | Hosting, preview deploys, Cron, env vars, Marketplace for Neon | n/a | Hobby: 100 GB bandwidth/mo. One cron job is needed; every plan allows at least that (Vercel says 100 per project on every plan since January 2026, https://vercel.com/changelog/cron-jobs-now-support-100-per-project-on-every-plan; verify the current per-plan limit at https://vercel.com/docs/cron-jobs/usage-and-pricing). Hobby crons run once per day, in UTC, fired anywhere within the scheduled hour. Functions: 300 s max duration on Hobby under Fluid compute, 800 s on Pro (https://vercel.com/changelog/higher-defaults-and-limits-for-vercel-functions-running-fluid-compute) | Hobby is for non-commercial use (https://vercel.com/docs/limits/fair-use-guidelines). Build and preview on Hobby; upgrade to Pro (about $20/mo, verify at signup) before pointing `ei-conversion.com` at the project (Phase 1 step 11). Pro also gives minute-precise cron. |
| Neon Postgres (via Vercel Marketplace) | Database | Postgres 18 (Neon default since June 2026; pick 17 only if a dependency needs it; https://neon.com/docs/postgresql/postgres-version-policy) | 0.5 GB storage, 100 compute-hours/mo, scale to zero (https://neon.com/docs/introduction/plans) | Not expected for years at this data volume |
| Drizzle ORM + drizzle-kit | Typed schema, queries, migrations | drizzle-orm 0.45.2 (latest); 1.0 is at release candidate, do not use (https://registry.npmjs.org/-/package/drizzle-orm/dist-tags). Pin drizzle-kit to the version its docs pair with 0.45.x, verify at install (https://orm.drizzle.team/docs/latest-releases) | n/a | never |
| `@neondatabase/serverless` | HTTP Postgres driver (`drizzle-orm/neon-http`) | latest stable, verify at install | n/a | never |
| Resend + `resend` SDK | All email | SDK 6.28.1 (https://www.npmjs.com/package/resend) | 3,000 emails/mo, 100 transactional/day resetting at midnight UTC, up to 3 verified domains (https://resend.com/changelog/three-domains-on-the-free-tier), 1,000 marketing contacts, 30-day logs on all plans since March 2026 (https://resend.com/docs/knowledge-base/account-quotas-and-limits) | See "When Resend paid becomes necessary" below |
| Cloudflare R2 | MP4 and poster hosting, zero egress | n/a | 10 GB storage, 1M Class A ops, 10M Class B ops/mo (https://developers.cloudflare.com/r2/pricing/) | Nine videos at 720p (about 1.5 GB total) fit easily; paid only past 10 GB |
| zod | Validation of every form and API body | 4.6.5 (https://www.npmjs.com/package/zod); Zod 4 API (`z.email()`, `z.uuid()`, https://zod.dev/v4/changelog) | n/a | never |
| Vitest | Unit tests | latest stable, verify at install | n/a | never |
| `tsx` (dev) | Runs the TypeScript scripts in `scripts/` (prebuild check, seed, test email) | latest stable, verify at install | n/a | never |
| `@next/bundle-analyzer` (dev) | Bundle report behind `ANALYZE=true` | matches the Next major, verify at install | n/a | never |
| GitHub Actions | CI: lint, test, build on pull requests | n/a | free for private repos within the monthly minutes | never at this size |
| Cloudflare Turnstile (later) | Bot check | free | free | never |
| Meta Pixel, GA4 | Env-var slots only | n/a | free | never |

**When Resend paid becomes necessary.** Daily transactional sends = quiz emails (one per active subscriber) + unlock emails + 2 per contact submission. The 100/day cap binds first, and Resend's daily quota resets at midnight UTC. At roughly 80 active subscribers the daily quiz alone risks the cap, and anything over it fails for the rest of the UTC day. Rule: `/admin` shows a red banner when active subscribers exceed 70; upgrade to Resend Pro (about $20/mo, 50,000/mo, no daily cap) before the list passes 80. Note: Resend Broadcasts (marketing sends) are free to 1,000 contacts and do not consume the 100/day transactional quota; section 10 explains why per-recipient sends are still chosen and what that costs.

**Deliberately not used.** No Formspree, no CMS, no Redis or Upstash, no auth library, no `svix` package (the Resend SDK verifies webhooks itself), no email-template library (`@react-email/render` is not installed; templates are plain TypeScript), no `date-fns-tz`, no `@vercel/analytics`, no Playwright or Prettier in Phase 1 (Playwright is listed under Future work). Rate limiting and sessions are built on Postgres and Web Crypto. Database transactions (`db.transaction`) are forbidden in the codebase because the HTTP driver does not support them; multi-statement writes use `db.batch([...])` (section 8).

## 3. Repository structure

```
ei_conversion_v3/
  .env.example                      # every var from section 15, no values
  .gitignore
  .nvmrc                            # 24
  .github/workflows/ci.yml          # pull_request: Node 24, npm ci, npm run lint, npm test, npm run build (APP_PHASE=1)
  package.json                      # engines.node "24.x"; scripts listed below
  tsconfig.json                     # "paths": { "@/*": ["./src/*"] }
  eslint.config.mjs                 # written by create-next-app 16
  next.config.ts                    # remotePatterns for the media host (only when set); headers() for /admin noindex; bundle analyzer
  postcss.config.mjs                # @tailwindcss/postcss
  drizzle.config.ts                 # schema: src/db/schema.ts, out: drizzle/, url: DATABASE_URL_UNPOOLED ?? DATABASE_URL
  vercel.json                       # crons: [{ path: /api/cron/daily-quiz, schedule }]  (committed in the LAST Phase 3 step)
  vitest.config.mts                 # resolve.alias { "@": "/src" } (.mts so Vite loads it as ESM)
  .npmrc                            # legacy-peer-deps=true: npm 10.9 crashes resolving the peer set otherwise; npm ci verified
  README.md                         # dev quick start, ffmpeg commands, cron/DST note
  drizzle/                          # generated SQL migrations (committed)
  public/
  # (icon.svg and opengraph-image.tsx live in src/app/, see below)
  scripts/
    check-env.ts                    # prebuild: required vars by APP_PHASE; bracket-placeholder check on production builds
    seed-quizzes.ts                 # Phase 3: load content/quizzes.sample.json locally; refuses to run when VERCEL_ENV=production
    send-test-email.ts              # Phase 2: deliverability check (--to)
  src/
    proxy.ts                        # Next 16 name for middleware.ts (Node runtime); guards /admin/*
    config/
      site.ts                       # THE ONE FILE: brand name, wordmark, tagline, domain, addresses, timezone
    content/
      types.ts                      # ServiceSlug, Fit, ServiceFit, Niche, Service, HomeContent, ContactContent, VideoSlot types
      niches/index.ts               # niches record; NicheSlug and NICHE_SLUGS are DERIVED from it; nicheList; nichesForService()
      niches/roofing.ts, med-spa.ts, plumbing.ts
      services/index.ts             # services record, serviceList
      services/website.ts, meta-ads.ts, local-seo.ts, google-ads.ts
      home.ts                       # HomeContent
      contact.ts                    # ContactContent (whatHappensNext, replyWindow)
      videos.ts                     # VideoSlotKey registry -> R2 keys; mediaUrl()
      privacy.ts                    # rendered by /privacy
      quizzes.sample.json           # Phase 3 seed input (format in section 12)
    app/
      layout.tsx                    # fonts on <html>, skip link, Nav, Footer, Analytics, AttributionCapture
      globals.css                   # Tailwind @import + @theme tokens + heading classes
      icon.svg                      # "Ei" wordmark glyph, auto-detected favicon (NOT also in public/)
      opengraph-image.tsx           # 1200x630 wordmark on navy, generated at build with next/og; applies to every route
      page.tsx                      # /
      sitemap.ts
      robots.ts                     # the only robots source (NO public/robots.txt)
      not-found.tsx
      guide/page.tsx
      guide/[niche]/page.tsx        # dynamicParams = false
      services/page.tsx
      services/[service]/page.tsx   # dynamicParams = false
      learn/[service]/page.tsx      # dynamicParams = false
      contact/page.tsx
      thank-you/page.tsx
      privacy/page.tsx
      quiz/[slug]/page.tsx          # Phase 3
      unsubscribe/page.tsx          # Phase 2: ?t=<unsubscribe_token>, confirm button posts to the API
      admin/(auth)/layout.tsx       # Phase 3: bare layout, no shell, no requireAdmin()
      admin/(auth)/login/page.tsx
      admin/(protected)/layout.tsx  # requireAdmin() + admin shell + logout; export const maxDuration = 300
      admin/(protected)/page.tsx    # dashboard: counts, quota banner, unfinished-send banner
      admin/(protected)/quizzes/page.tsx
      admin/(protected)/quizzes/new/page.tsx
      admin/(protected)/quizzes/[id]/page.tsx
      admin/(protected)/leads/page.tsx
      admin/(protected)/subscribers/page.tsx
      admin/(protected)/subscribers/export/route.ts   # GET CSV, requireAdmin(), under /admin so proxy.ts covers it
      api/contact/route.ts          # POST (Phase 2)
      api/subscribe/route.ts        # POST (Phase 2)
      api/unsubscribe/route.ts      # GET redirects to page; POST performs it (Phase 2)
      api/quiz/answer/route.ts      # POST (Phase 3)
      api/cron/daily-quiz/route.ts  # GET, CRON_SECRET (Phase 3)
      api/webhooks/resend/route.ts  # POST, bounce/complaint (Phase 3); 503 while RESEND_WEBHOOK_SECRET is unset
    components/
      ui/Button.tsx, Section.tsx, Card.tsx, Wordmark.tsx, ProsCons.tsx, Field.tsx, Eyebrow.tsx
      layout/Nav.tsx, Footer.tsx, MobileMenu.tsx
      media/VideoPlayer.tsx         # client component
      forms/ContactForm.tsx         # client component; mailto fallback when NEXT_PUBLIC_APP_PHASE < 2
      forms/EmailCapture.tsx        # client component; rendered only when NEXT_PUBLIC_APP_PHASE >= 2
      forms/Honeypot.tsx            # company_website + started_at (written to the input in useEffect)
      # (no AttributionFields component: forms read the ei_attr cookie at submit time via lib/attribution.ts)
      guide/NichePicker.tsx, ServiceFitCard.tsx, StartingMix.tsx
      quiz/Quiz.tsx                 # client component
      analytics/Analytics.tsx       # Pixel + GA4 loaders, env gated, SPA page views
      analytics/AttributionCapture.tsx # writes first-touch ei_attr cookie
      admin/QuizForm.tsx, LeadsTable.tsx, SubscribersTable.tsx, SendNowButton.tsx
    lib/
      env.ts                        # typed, phase-aware env access (zod)
      phase.ts                      # appPhase() server, publicPhase() client
      validation.ts                 # zod schemas shared by client and server
      attribution.ts                # cookie read/parse helpers
      analytics.ts                  # track(event, props) -> fbq/gtag if present
      rate-limit.ts                 # DB-backed fixed window (single upsert)
      tokens.ts                     # random tokens (Web Crypto)
      dates.ts                      # todayInTimezone() via Intl.DateTimeFormat
      seo.ts                        # metadata builders, JSON-LD helpers
      admin/auth.ts                 # login, session cookie sign/verify, requireAdmin
      admin/actions.ts              # "use server" admin actions
      email/resend.ts               # singleton client
      email/send.ts                 # sendEmail() wrapper with email_log claim/reclaim
      email/contacts.ts             # Resend contact sync (Segments)
      email/templates/layout.ts     # shared 600px table HTML shell
      email/templates/contact-owner.ts, contact-autoreply.ts, unlock.ts, daily-quiz.ts, no-quiz-alert.ts, quota-warning.ts
      quiz/slug.ts                  # quizSlug(question, date)
      quiz/select.ts                # pickTodaysQuiz()
      quiz/send.ts                  # sendDailyQuiz() shared by cron and admin; resumeSend(); runSendLoop()
      leads.ts                      # createLead(), addLeadToList()
      subscribers.ts                # upsertSubscriber(), unsubscribeByToken()
    db/
      index.ts                      # drizzle(neon(DATABASE_URL)) via drizzle-orm/neon-http; exports db and db.batch
      schema.ts
    test/
      content.test.ts, validation.test.ts, dates.test.ts, rate-limit.test.ts,
      auth.test.ts, quiz-select.test.ts, quiz-send.test.ts, subscribers.test.ts
```

`package.json` scripts:

```json
{
  "engines": { "node": "24.x" },
  "scripts": {
    "dev": "next dev",
    "prebuild": "tsx scripts/check-env.ts",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "test": "vitest run",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "email:test": "tsx --env-file=.env.local scripts/send-test-email.ts --to",
    "quiz:seed": "tsx --env-file=.env.local scripts/seed-quizzes.ts"
  }
}
```

`next build` in Next 16 no longer runs ESLint and `next lint` is gone, so `lint` is a separate script and a separate CI step (https://nextjs.org/docs/app/guides/upgrading/version-16). `tsx --env-file` loads `.env.local` for the two local scripts; verify the flag at install and fall back to `node --env-file=.env.local --import tsx ...` if needed. `prebuild` needs no env file because Vercel injects variables.

All imports use the `@/` alias (`@/lib/...`, `@/content/...`, `@/components/...`).

`src/config/site.ts`:

```ts
const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const site = {
  name: "Ei Conversion",
  wordmark: "Ei",
  legalName: "[LEGAL ENTITY NAME]",
  tagline: "[TAGLINE: one sentence, e.g. Marketing that fits your trade]",
  domain: "ei-conversion.com",
  url: process.env.NEXT_PUBLIC_SITE_URL
    ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : productionUrl ? `https://${productionUrl}` : "http://localhost:3000"),
  ownerFirstName: "[OWNER FIRST NAME]",
  fromEmail: "hello@ei-conversion.com",       // sending address (Phase 2, after Resend verification)
  contactEmail: "[OWNER EXISTING EMAIL]",     // shown publicly and used by the Phase 1 mailto; switch to hello@ once it has an inbox
  mailingAddress: "[MAILING ADDRESS]",        // CAN-SPAM footer on list mail; also Organization JSON-LD
  serviceArea: "[SERVICE AREA, e.g. Greater Tampa Bay]",
  city: "[CITY, STATE]",
  timezone: "America/New_York",               // [CONFIRM OWNER TIMEZONE]
} as const;
```

`NEXT_PUBLIC_SITE_URL` is set only in the Vercel Production environment; previews fall back to `VERCEL_URL`, so canonical URLs and email links on a preview point at that preview. Rename to E2 Results = edit this file, swap `src/app/icon.svg` and `src/app/opengraph-image.tsx`, verify the new domain in Resend.

## 4. Design system

**Feel.** Quiet, confident, editorial. White space, one accent color used only for the primary action on a screen. No gradients, no black-and-gold, no countdown timers, no red urgency.

**Tokens** (`src/app/globals.css`, Tailwind 4 CSS-first config, no `tailwind.config.ts`). Colors, radii, and the text scale live in plain `@theme`; the two font tokens reference other variables and therefore must be in `@theme inline`, otherwise Tailwind resolves `var(--font-manrope)` at `:root` where it is not defined and headings silently fall back to the browser font (https://tailwindcss.com/docs/theme, "Referencing other variables"; https://github.com/tailwindlabs/tailwindcss/discussions/15923).

```css
@import "tailwindcss";
@theme {
  --color-navy: #0B1F3A;        /* nav, footer, hero and CTA bands, headings on light */
  --color-navy-700: #14305A;    /* hover on navy */
  --color-offwhite: #F8FAFC;    /* page background */
  --color-amber: #F59E0B;       /* primary CTA fill only */
  --color-amber-dark: #B45309;  /* CTA hover; amber-as-text on light backgrounds (AA) */
  --color-slate: #1E293B;       /* body text */
  --color-muted: #64748B;       /* captions, eyebrows */
  --color-line: #E2E8F0;        /* borders */
  --color-white: #FFFFFF;       /* cards */
  --color-success: #15803D;     /* form success only */
  --color-error: #B91C1C;       /* form error text only, never marketing */
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px;
  --text-base: 1.0625rem;       /* 17px body on mobile */
  --text-base--line-height: 1.6;
}
@theme inline {
  --font-heading: var(--font-manrope);
  --font-body: var(--font-inter);
}
html { color-scheme: light; }
@media (min-width: 768px) { html { font-size: 18px; } }   /* body 18px on desktop; rem scale follows */
body { background: var(--color-offwhite); color: var(--color-slate); font-family: var(--font-body); }
.h1 { font-family: var(--font-heading); font-weight: 800; font-size: 2.25rem; line-height: 1.1; letter-spacing: -0.02em; }
.h2 { font-family: var(--font-heading); font-weight: 700; font-size: 1.75rem; line-height: 1.2; }
.h3 { font-family: var(--font-heading); font-weight: 700; font-size: 1.25rem; line-height: 1.3; }
@media (min-width: 768px) { .h1 { font-size: 3.5rem; } .h2 { font-size: 2.5rem; } .h3 { font-size: 1.5rem; } }
[data-tone="navy"] .btn-secondary { border-color: var(--color-offwhite); color: var(--color-offwhite); }
[data-tone="navy"] .btn-ghost { color: var(--color-offwhite); }
```

Button labels are navy on amber (not white on amber), which passes AA at 16px bold and above.

**Typography** (`layout.tsx`, `next/font/google`, `display: "swap"`, `subsets: ["latin"]`): Manrope weights 600, 700, 800 with `variable: "--font-manrope"`; Inter 400, 500, 600 with `variable: "--font-inter"`. Both `.variable` class names go on `<html>`, not `<body>`: `<html lang="en" className={`${manrope.variable} ${inter.variable}`}>`. Phase 1 acceptance checks that the computed `font-family` of an `h1` in DevTools is Manrope.

| Role | Font | Size mobile / desktop | Weight, notes |
|---|---|---|---|
| H1 (`.h1`) | Manrope | 36px / 56px | 800, line-height 1.1, tracking -0.02em |
| H2 (`.h2`) | Manrope | 28px / 40px | 700 |
| H3 (`.h3`) | Manrope | 20px / 24px | 700 |
| Body (`text-base`) | Inter | 17px / 18px | 400, line-height 1.6, max width 65ch |
| Small (`text-sm`) | Inter | 14px | 400 |
| Eyebrow | Inter | 13px uppercase | 600, tracking 0.08em, muted |

**Spacing and radius.** Tailwind default 4px scale. Sections `py-16 md:py-28`. Container `max-w-6xl mx-auto px-4 md:px-8` (16px gutters on mobile, no horizontal scroll). Cards: `rounded-lg`, 1px `line` border, white fill, no shadow. Buttons: `rounded-md`, minimum height 48px for touch. Video: `rounded-lg overflow-hidden`.

**Core components.**

| Component | Props | Notes |
|---|---|---|
| `Wordmark` | `size`, `tone: light/dark` | `site.wordmark` ("Ei") in Manrope 800 inside a 40px navy rounded square, followed by `site.name`. Swapping to a logo later means editing this one file. |
| `Button` | `variant: primary/secondary/ghost`, `href?`, `trackEvent?` | Primary = amber fill, navy text. Secondary = navy outline. Ghost = navy text, no border. Inside a `Section tone="navy"` the secondary and ghost variants switch to off-white via the `[data-tone="navy"]` CSS above, so no per-button prop is needed. Renders `<a>` when `href` given. Fires `track("cta_click", {label, href})`. |
| `Section` | `tone: offwhite/white/navy`, `id`, `eyebrow?`, `heading?` | Emits `data-tone` on its root. Navy tone uses off-white text; used for hero, plain-dealing, and CTA bands only. |
| `Card` | `title`, `eyebrow?`, `href?` | Bordered white card. |
| `ProsCons` | `pros: string[]`, `cons: string[]` | Two columns on desktop, stacked on mobile. Plain check and dash markers, no red X icons. |
| `ServiceFitCard` | `fit: ServiceFit` | Rank badge, service name, fit label, summary, `ProsCons`, link to `/services/[service]`. |
| `VideoPlayer` | `slot: VideoSlotKey` | See section 14. |
| `EmailCapture` | `service: ServiceSlug`, `headline`, `buttonLabel` | Email field, honeypot, attribution fields, the fixed one-line disclosure, `<noscript>` line. Inline success state. Rendered only when `publicPhase() >= 2`. |
| `ContactForm` | `defaultService?`, `defaultNiche?` | See section 5. Phase 1 mailto fallback. |
| `Honeypot` | none | Visually hidden `company_website` input (`tabIndex=-1`, `autoComplete="off"`, `aria-hidden`) plus hidden `started_at`, set in a `useEffect` on mount (never at render, which would be build time on static pages). |
| `Quiz` | `quiz`, `token?` | Radio options in a fieldset, "Check answer" reveals, posts answer if token. Strips `?t=` from the URL on mount. |
| `Nav` | none | Sticky, off-white, 1px bottom line. Wordmark, Guide, Services, Contact (primary button). Active link gets a 2px amber underline (`aria-current="page"`). Below `md` (768px) the links collapse into `MobileMenu`, a client component with focus trap and Esc to close, no library. |
| `Footer` | none | Navy. Column 1: Wordmark + tagline + `site.city`. Column 2 "Pages": Home, Guide, Services, Contact, Privacy. Column 3 "Services": the four. Column 4 "Industries": every niche in `nicheList`. Bottom line: `site.contactEmail`, copyright from `site.legalName`. |

**Skip link.** "Skip to content" is the first child of `<body>` in `layout.tsx`, visually hidden until focused, targeting `<main id="main">`.

**Dark mode.** Not supported. `color-scheme: light` is set explicitly so system dark mode does not invert form controls. One brand palette, less QA; navy bands already give contrast.

## 5. Page-by-page specification

Global rules:
- One H1 per page; every CTA is a `Button`.
- Every page sets `metadata` through `lib/seo.ts`: title is written WITHOUT the brand and `seo.ts` appends `| ${site.name}`; a description; canonical URL from `site.url`; the default social image comes from `src/app/opengraph-image.tsx`. `layout.tsx` sets `metadataBase: new URL(site.url)`, `openGraph` defaults (site name, locale, default image), and `twitter: { card: "summary_large_image" }`.
- The root layout emits `Organization` JSON-LD from `site.ts`: `name`, `url`, `email: site.contactEmail`, `address` from `site.mailingAddress` (as `PostalAddress` text). No `sameAs` until social profiles exist, no `aggregateRating` ever.
- The three dynamic public routes (`/guide/[niche]`, `/services/[service]`, `/learn/[service]`) export `generateStaticParams` AND `export const dynamicParams = false;` so an unknown slug returns the 404 page instead of rendering at request time.
- Next 16: `params` and `searchParams` are Promises. Every page and `generateMetadata` does `const { niche } = await params;` / `const { service, niche } = await searchParams;`.
- `sitemap.ts` lists `/`, `/guide`, `/guide/[niche]` for each niche, `/services`, `/services/[service]` for each service, `/contact`, `/privacy`. Excluded: `/learn/*`, `/thank-you`, `/quiz/*`, `/unsubscribe`, `/admin/*`. `robots.ts` disallows `/admin` and `/api`.
- Voice is "you" and "we", never a made-up number.

**Nav** (every public page): Wordmark -> `/`; Guide -> `/guide`; Services -> `/services`; Contact (primary) -> `/contact`.

**Footer** (every public page): as in section 4.

### / (Home)

Exactly four sections, matching the spec: hero, sub-hero, VSL, closing band. Every button on Home points to `/guide`. Home never links directly to `/contact`; the Guide is the next step for everyone.

| Section | Purpose and copy structure | CTA |
|---|---|---|
| Hero (navy) | Eyebrow `home.eyebrow` ("Marketing for local service businesses"). H1 framework: `[Outcome the owner wants] + [without the thing they hate]`; draft "Get more of the right calls. Skip the marketing guesswork." Sub `home.sub`: "We help {joinNames(nicheList)} pick the one or two channels that actually fit, then build them properly. Start with the free guide." `joinNames` renders "roofers, med spas, and plumbers" from each niche's `plural`, so a new niche needs no copy edit here. | Primary "Read the free guide" -> `/guide`; Ghost "Pick your industry" -> `/guide#niches` |
| Sub-hero (white) | H2 "Four services. You probably need one or two." Four `Card`s (no links) with each service's `oneLiner` and `bestFor` line from content. Muted line: "The guide tells you which ones fit your trade, and which to skip." | Secondary "Find your industry in the guide" -> `/guide` |
| VSL (offwhite) | H2 `home.vslHeading` ("[OWNER FIRST NAME] explains how we think about your first campaign"). `VideoPlayer slot="home"` (2 to 3 min). Three bullets summarizing the video: `home.vslBullets`. | Primary "Find your industry in the guide" -> `/guide` |
| Plain-dealing (navy) | H2 `home.plainDealing.heading` ("What you will not get from us"). Bullets: no long contracts, no inflated promises, no results we cannot show you, no jargon. [OWNER: edit to what you can stand behind.] This band is the credibility substitute for testimonials. | Secondary "Start with the guide" -> `/guide` |

"How it works" lives on `/contact` as "What happens next", not on Home.

SEO: title `"Marketing for " + joinNames(nicheList, { capitalized: true })` ("Marketing for Roofers, Med Spas and Plumbers"; `seo.ts` appends the brand); description "Straight advice on websites, Meta ads, local SEO and Google ads for local service businesses. Read the free guide first." JSON-LD: `WebSite` (plus layout `Organization`).

### /guide
Hero (white): eyebrow "The guide"; H1 "Which marketing actually fits your industry?"; sub "Pick your business type. We rank all four services for it, with the downsides included." `NichePicker` (`id="niches"`): one `Card` per niche in `nicheList` showing `niche.name` and `niche.teaser`; fires `track("niche_select")`. Muted line: "Not listed? Tell us your industry and we will still give you a straight answer" -> `/contact?niche=other`. SEO: title "Marketing Guide by Industry"; description "Pick roofing, med spa, or plumbing and get all four marketing services ranked for it, pros and cons included." JSON-LD: `ItemList` of niche pages.

### /guide/[niche]

| Section | Content |
|---|---|
| Hero (navy) | Eyebrow "Guide: [Niche name]"; H1 `niche.headline`; sub `niche.intro`. |
| Buyer context (white) | H2 "How [niche] customers actually buy"; bullets from `buyerContext`. |
| Ranked services (offwhite) | H2 "All four services, ranked for [niche]"; four `ServiceFitCard`s by `rank`. |
| Starting mix (white) | H2 `startingMix.title`; ordered steps; rationale paragraph. |
| CTA band (navy) | H2 "Want us to look at your specific situation?"; Primary "See if we're a fit" -> `/contact?niche=[slug]`; Ghost "Compare the services" -> `/services`. |

SEO from `niche.seo`. JSON-LD: `Article` with `about` = niche name, plus `BreadcrumbList`.

### /services
Hero (white): H1 "Four services, explained plainly"; sub "Each page says who it is for, who it is not for, and what is included. Watch the short video first." Four `Card`s with `oneLiner`, `bestFor`, and "Best for" niche chips from `nichesForService(slug)` (niches where the service is ranked `strong` or `good`; derived from niche content, never hand-maintained). Band: "Not sure which one? Start with the guide" -> `/guide`. SEO: title "Website, Meta Ads, Local SEO and Google Ads Services"; description "What each service includes, who it fits, and who it does not. Plain language, no hype."

### /services/[service]

| Section | Content |
|---|---|
| Hero (navy) | Eyebrow "Service"; H1 `service.name`; sub `service.promise` (a statement of the work, never a result claim). |
| Short VSL (white) | `VideoPlayer slot="services.[slug].short"` (2 to 4 min). |
| What is included (offwhite) | Checklist from `service.included`. Meta Ads and Google Ads pages render `service.honestLine` here (mandatory, see section 7). |
| Fit (white) | Two columns "A good fit if" / "Not a fit if" from `goodFit` and `notFit`. |
| How we work (offwhite) | Steps from `service.process`. Pricing line `service.pricingLine`. |
| Which trades it fits (white) | Links to `/guide/[niche]` for each niche in `nichesForService(slug)`. |
| Deep-dive band (navy) | Phase 2+: H2 "Watch the full [service] walkthrough"; sub "The in-depth video covers {service.deepDive.teaser}. Enter your email and we will send the link." `EmailCapture service=[slug]` button "Send me the video". Small text, verbatim: "You'll get the full video plus a short daily marketing puzzle. Unsubscribe anytime." On success: inline "Sending you there now" and immediate redirect to `redirectTo` from the API. Phase 1 (`publicPhase() < 2`): same H2 and teaser, no email field; Secondary button "Watch the full walkthrough" -> `/learn/[slug]`. The gate is soft either way. |
| CTA (white) | Primary "See if we're a fit" -> `/contact?service=[slug]`. |

SEO from `service.seo`. JSON-LD: `Service` with `provider` Organization and `areaServed: site.serviceArea`. No `AggregateRating`.

### /learn/[service]
Public, not in nav or sitemap, `robots: noindex, follow` (the email is the gate to the link, not a login). Hero (white): eyebrow "Deep dive"; H1 "[Service]: the full walkthrough". `VideoPlayer slot="learn.[slug]"` (10 to 20 min). "Chapters" list from `deepDive.chapters` with timestamps [OWNER SUPPLIES], "Common mistakes" bullets from `deepDive.mistakes`, CTA band Primary "See if we're a fit" -> `/contact?service=[slug]`. Footer line shown ONLY when `?src=unlock` is present (the first visit right after subscribing): when `publicPhase() >= 3` "Your first daily puzzle arrives within a day."; otherwise "You'll also get our short daily marketing puzzle when it launches." SEO: title "[Service] walkthrough"; description "The full [service] walkthrough for local service businesses."

### /contact
Hero (white): H1 "See if there's a good fit"; sub "Tell us a little about the business. We reply within {contact.replyWindow} with an honest read on whether we can help."

`ContactForm`: Name (required), Email (required), Phone (optional, `tel`), "What's going on with your marketing right now?" textarea (required, 20 to 2000 chars), Service select (optional: four services + "Not sure", which submits `""`), Industry select (optional: every niche in `nicheList` + "Other", which submits `"other"`), `Honeypot`, attribution from the `ei_attr` cookie at submit, `<noscript>` line "Enable JavaScript to send this form, or email {site.contactEmail}." Prefill from `await searchParams` `?service=` and `?niche=`, validated against `SERVICE_SLUGS` and `NICHE_FORM_VALUES`; unknown values are ignored. Submit "Send it over".

Error copy: 400 shows the field errors inline; 429 "Too many attempts. Try again later or email us at {site.contactEmail}."; 500 or network "Something went wrong. Email us at {site.contactEmail}."

Phase 1 (`publicPhase() < 2`): the same fields render, but the submit button is replaced by a Primary `<a href="mailto:{site.contactEmail}?subject=Fit check">` labeled "Email us", plus a visible line "Or write to {site.contactEmail}". No `<form>` element is submitted, so nothing 404s.

Success (Phase 2+): `sessionStorage.setItem("ei_contact", JSON.stringify({ service, niche, leadId }))` then `router.push("/thank-you")`. Lead data never goes in the URL.

Side column "What happens next": the three bullets from `contact.whatHappensNext`. SEO: title "Contact"; description "Tell us about your business and get an honest answer on whether we are a fit." JSON-LD `ContactPage`.

### /thank-you
Contact conversion page only (subscribe success is inline in `EmailCapture`, so there is no `?type=subscribe` variant and no double counting). H1 "Got it. We'll be in touch." Body: "{site.ownerFirstName} reads every message personally. Expect a reply within {contact.replyWindow}. In the meantime, the guide is the best use of ten minutes." Button "Back to the guide" -> `/guide`. On mount a small client component reads `sessionStorage.ei_contact`; if present it fires `track("contact_submit", { service, niche })` and removes the key (the removal is the once-guard); if absent it fires nothing, so opening `/thank-you` directly sends no fake Lead to Meta. `noindex`. SEO: title "Thanks"; description "Message received."

### /quiz/[slug] (Phase 3)
Server component loads the quiz by slug (status `ready` or `sent`, else 404). Eyebrow "Daily marketing puzzle"; H1 = question. `Quiz` with radio options; "Check answer" reveals the correct option and `explanation`. CTA band "Want this applied to your business?" Primary -> `/contact?src=quiz`. `Quiz.tsx` reads `?t=` on mount into component state, then calls `history.replaceState(null, "", location.pathname)` so the token never reaches analytics or the browser history; it posts the token with the answer to `/api/quiz/answer`. The page works without a token. `noindex`. SEO: title "Daily puzzle: [first 50 chars]"; description "One marketing question, one minute."

### /privacy
Rendered from `content/privacy.ts`: what is collected (form fields, email, salted IP hash for spam control, UTM cookie, analytics identifiers only when Pixel/GA4 are enabled), why, retention, unsubscribe and deletion requests to `site.contactEmail`, vendors (Vercel, Neon, Resend, Cloudflare, Meta and Google when enabled), `site.legalName` and `site.mailingAddress`, effective date. [OWNER: have a lawyer review before enabling the Pixel.] SEO: title "Privacy"; description "How this site handles your information."

### /unsubscribe (Phase 2)
Reads `?t=` on mount into state and strips it from the URL with `history.replaceState` (same as the quiz page), shows the masked email and a button "Unsubscribe" that POSTs to `/api/unsubscribe`. Page load never changes state (mail scanners prefetch links). Invalid token shows a neutral message with `site.contactEmail`. `noindex`.

## 6. Guide content

**Model** (`src/content/types.ts`):

```ts
export const SERVICE_SLUGS = ["website", "meta-ads", "local-seo", "google-ads"] as const;
export type ServiceSlug = (typeof SERVICE_SLUGS)[number];
export type Fit = "strong" | "good" | "situational" | "later";
export interface ServiceFit { service: ServiceSlug; rank: 1 | 2 | 3 | 4; fit: Fit; fitNote?: string; summary: string; pros: string[]; cons: string[]; }
export interface StartingMix { title: string; steps: string[]; rationale: string; }
export interface Niche {
  slug: string;                 // must equal the key in niches/index.ts (content.test.ts checks)
  name: string;                 // "Roofing"
  plural: string;               // "roofers", used by joinNames() on Home
  teaser: string;               // one line for the niche picker
  headline: string; intro: string;
  buyerContext: string[]; fits: ServiceFit[];            // exactly four, one per service
  startingMix: StartingMix; seo: { title: string; description: string };
}
export interface HomeContent {
  eyebrow: string; h1: string; sub: string;              // sub may contain the token {niches}, replaced by joinNames(nicheList)
  vslHeading: string; vslBullets: [string, string, string];
  plainDealing: { heading: string; bullets: string[] };
}
export interface ContactContent { replyWindow: string; whatHappensNext: [string, string, string]; }
```

`src/content/niches/index.ts` is the single registry. The slug union is derived from it so that adding a niche never touches `types.ts`, `app/`, or `components/`:

```ts
import type { Niche } from "@/content/types";
import { roofing } from "./roofing"; import { medSpa } from "./med-spa"; import { plumbing } from "./plumbing";
export const niches = { roofing, "med-spa": medSpa, plumbing } as const satisfies Record<string, Niche>;
export type NicheSlug = keyof typeof niches;
export const NICHE_SLUGS = Object.keys(niches) as [NicheSlug, ...NicheSlug[]];
export const NICHE_FORM_VALUES = [...NICHE_SLUGS, "other"] as const;    // contact form, zod, prefill
export const nicheList: Niche[] = Object.values(niches);
export function nichesForService(slug: ServiceSlug): Niche[] {
  return nicheList.filter(n => ["strong", "good"].includes(n.fits.find(f => f.service === slug)!.fit));
}
export function joinNames(list: Niche[], opts?: { capitalized?: boolean }): string { /* "roofers, med spas, and plumbers" */ }
```

Adding HVAC = copy `plumbing.ts` to `hvac.ts`, edit it, add one import line and one key in `niches`. The picker, sitemap, static params, Home copy, footer, contact industry select, and `nichesForService` all read the registry. Hyphenated slugs are the single vocabulary everywhere: URLs, content, zod enums, Postgres enum labels, Resend tags. `test/content.test.ts` asserts each niche has four fits with ranks 1 to 4 and no duplicate service, that `slug` equals its key, and that `teaser` and `plural` are non-empty. All content below is general industry knowledge; no statistics.

### Roofing (`roofing.ts`)
- name "Roofing"; plural "roofers"; teaser "High-ticket, seasonal, storm-driven. Search wins."
- headline: "Marketing for roofers: where the good jobs actually come from"
- intro: "Roofing is high-ticket, seasonal, and often storm-driven. The homeowner usually does not know a roofer before they need one. That shapes everything below."
- buyerContext: "Most residential jobs start with a search after a leak, a storm, or an inspection report." / "Ticket size is large, so a single job can pay for a month of advertising. That makes paid search viable even at expensive clicks." / "Homeowners get several quotes. Reviews, photos of real jobs, and a fast callback decide who wins." / "Insurance work and retail work are different sales; your marketing should say which one you want." / "Demand spikes after weather events, so whatever you run has to turn up and down quickly."

1. **Google Ads, strong.** Summary: "Someone searching 'roof repair near me' after a storm is as close to a ready buyer as marketing gets." Pros: catches people at the moment of need; you control the service area and the hours you take calls; can be paused between storms and turned up after; call-only and call-extension formats fit a phone-driven trade. Cons: roofing clicks are among the more expensive in local services, so mistakes cost real money; a weak landing page or slow callback wastes the spend; needs conversion tracking set up before the first dollar is spent; lead quality varies, expect price shoppers mixed in.
2. **Local SEO, good.** Summary: "The map pack is where homeowners compare a few roofers at once. Being there is free traffic, but it takes months to earn." Pros: no cost per click once you rank; reviews and job photos compound over time; supports every other channel because people check your Google profile after seeing an ad; works for both storm and retail demand. Cons: slow, usually months before it moves; competitive in most metros; depends on a steady review process you have to actually run; limited control over which neighborhoods you show up in.
3. **Website, good (fitNote: prerequisite).** Summary: "Your website is where the ad click and the map click both land. If it is slow or vague, the other channels leak." Pros: one-time fix that lifts every other channel; shows real job photos, service area, licensing, and financing clearly; a fast mobile site with a tap-to-call button matches how homeowners contact roofers. Cons: a website alone does not create demand; ranked third because if your current site is already fast, clear, and mobile-friendly you may not need a new one; rebuilding can distract from getting leads flowing.
4. **Meta Ads, situational.** Summary: "Facebook and Instagram can work for free inspections and storm campaigns, but the leads are colder than search." Pros: cheap reach in a specific zip code after a storm; good for retargeting people who visited the site but did not call; before-and-after photos and short videos perform well; useful for financing or seasonal offers. Cons: people are not looking for a roofer while scrolling, so more of the leads are tire-kickers; lead forms need fast follow-up or they go cold; takes creative testing and budget to find what works; harder to measure than search.

startingMix: title "A sensible first ninety days for a roofer". Steps: "Fix the landing experience first: fast mobile page, real photos, license number, tap-to-call, a form that gets answered within minutes." / "Launch Google Ads search for repair and replacement terms in your service area with call tracking on." / "Start Local SEO the same week: clean up the Google Business Profile, set up a review request habit after every job, post job photos." / "Add Meta retargeting once the site gets steady traffic, then test a storm or inspection campaign." Rationale: "Search captures demand that already exists. Local SEO is slow, so it should start early and run in the background. Meta is added last because it needs the site and follow-up process to be working first."

seo: title "Marketing for Roofers: Google Ads, Local SEO, Websites and Meta Ads Ranked"; description "Which marketing fits a roofing company? All four services ranked with honest pros and cons, and a sensible first ninety days."

### Med spa (`med-spa.ts`)
- name "Med spa"; plural "med spas"; teaser "Visual, elective, repeatable. Discovery beats search."
- headline: "Marketing for med spas: booked chairs, repeat clients, no gimmicks"
- intro: "A med spa sells elective, visual, repeatable treatments. Clients come back every few months, so the value of one new client is much higher than the first appointment. That changes which channels pay off."
- buyerContext: "Treatments are chosen, not forced. People browse, compare, and are influenced by what they see." / "A first-time client often becomes a recurring one, so a modest acquisition cost is fine." / "Trust and safety matter: credentials, cleanliness, and real (consented) results photos do the persuading." / "Advertising platforms restrict some health, body-image, and before-and-after claims. Compliance is part of the plan, not an afterthought." / "Online booking with a visible menu and prices lowers the barrier."

1. **Meta Ads, strong.** Summary: "Med spa services are visual and demographic-targetable, which is exactly what Instagram and Facebook are good at." Pros: reach the right age, location, and interests without waiting for a search; video and photo creative from the clinic performs; intro offers and seasonal packages are easy to promote; retargeting brings back browsers who did not book. Cons: platform policies limit before-and-after imagery and certain claims, so ads get rejected until you learn the rules; needs a steady flow of fresh creative; leads must be followed up fast, ideally with online booking; results take a few weeks of testing.
2. **Local SEO, good.** Summary: "People search '[treatment] near me' and pick from the map. Reviews and photos on your profile matter more here than in most industries." Pros: high-intent traffic at no cost per click; reviews build the trust an elective purchase needs; treatment-specific pages can rank on their own; long-lived. Cons: slow to build; med spa search is competitive in cities; needs consistent review generation and photo updates; medical-adjacent content is held to a higher quality bar by search engines.
3. **Website, good.** Summary: "Your site has to do three jobs: show credibility, list the menu with prices or ranges, and book the appointment." Pros: online booking removes phone tag; treatment pages support both SEO and ads; a clean design signals a safe, professional clinic. Cons: does not generate demand on its own; if you already have booking software and a decent site, a redesign is not the first priority; photo and consent management is real work.
4. **Google Ads, situational.** Summary: "Search intent is high, but clicks for popular treatments are expensive and the ad rules for health services are stricter." Pros: catches people ready to book a specific treatment; strong for high-value treatments where one booking justifies the click cost; precise geographic control. Cons: costly in competitive metros; some treatment categories face certification or policy restrictions; needs treatment-specific landing pages to convert; easy to overspend on broad terms.

startingMix: title "Where a med spa should start". Steps: "Make sure the website has online booking, a clear treatment menu, credentials, and consented photos." / "Set up the Google Business Profile properly and start a review routine after every visit." / "Launch a Meta campaign with one intro offer and two or three creatives, sending traffic to the booking page." / "Once Meta is stable, test Google Ads on your two highest-value treatments." Rationale: "Meta fits the visual, discovery-driven way people find treatments and is cheaper to test than search. Local SEO runs in the background. Google Ads is added for specific high-value treatments once landing pages exist."

seo: title "Marketing for Med Spas: Meta Ads, Local SEO, Websites and Google Ads Ranked"; description "Which marketing fits a med spa? All four services ranked with honest pros and cons, including ad policy realities, plus a starting mix."

### Plumbing (`plumbing.ts`)
- name "Plumbing"; plural "plumbers"; teaser "Urgent and local. The map pack decides."
- headline: "Marketing for plumbers: be the one they call when the water is on the floor"
- intro: "Most plumbing demand is urgent. The customer wants a plumber who can come today and looks trustworthy in ten seconds. Everything below is about being findable and credible at that moment."
- buyerContext: "Emergency jobs are decided in minutes: search, map pack, reviews, call." / "Non-emergency work (water heaters, remodels, repiping) is a slower, comparison-based sale." / "Phone calls matter more than forms. Answering the phone is part of marketing." / "Reviews and response time beat design polish." / "Service area and hours need to be obvious everywhere."

1. **Local SEO, strong.** Summary: "'Plumber near me' is decided in the map pack. Being in the top spots with good reviews is the best position in this trade." Pros: matches urgent, location-based search exactly; no cost per call once established; reviews compound; works around the clock. Cons: takes months and steady effort; competitive in metros; you cannot force which neighborhoods you show in; depends on a review habit your techs have to follow.
2. **Google Ads, strong.** Summary: "Emergency search is the moment of need. Paid search with call-only ads puts your number in front of that moment while SEO catches up." Pros: immediate calls; can run only during hours you can actually dispatch; call tracking shows exactly which terms produce jobs; good for water heater and drain-specific campaigns too. Cons: clicks are expensive for emergency terms; wasted spend if nobody answers the phone; needs negative keywords and tight service-area settings; lead quality drops if the ad promises something you cannot deliver, like same-day service.
3. **Website, good (fitNote: prerequisite).** Summary: "Mobile-first, fast, tap-to-call, service area, hours, license. That is the whole brief." Pros: a fast page with a phone number front and center converts emergency traffic; service pages support SEO for specific jobs; shows licensing and insurance clearly. Cons: no demand on its own; a beautiful site is not the goal, a fast and clear one is; ranked third because many plumbers can get by with a modest site as long as it loads quickly and the phone number works.
4. **Meta Ads, later.** Summary: "Nobody scrolls Facebook looking for an emergency plumber. Meta works only for planned work and staying top of mind." Pros: fine for water heater replacement offers, maintenance plans, or remodel work; cheap local reach; retargeting of site visitors. Cons: poor match for urgent demand; leads are slower and colder; needs ongoing creative; measurement is harder than search.

startingMix: title "A plumber's first ninety days". Steps: "Google Business Profile: correct categories, service area, hours, photos, and a review request after every job." / "Website check: mobile speed, tap-to-call, service pages for your most common jobs." / "Google Ads search with call-only ads for emergency terms, scheduled to the hours you can dispatch, with call tracking." / "Revisit Meta later for planned work like water heaters or maintenance plans." Rationale: "Plumbing demand is urgent and local, so the map pack and search ads do the heavy lifting. Meta is a later add for the slower, planned jobs."

seo: title "Marketing for Plumbers: Local SEO, Google Ads, Websites and Meta Ads Ranked"; description "Which marketing fits a plumbing company? All four services ranked for urgent, local demand, with pros, cons, and a first ninety days."

### Home and contact content (`home.ts`, `contact.ts`)

`home.ts`: eyebrow "Marketing for local service businesses"; h1 "Get more of the right calls. Skip the marketing guesswork."; sub "We help {niches} pick the one or two channels that actually fit, then build them properly. Start with the free guide."; vslHeading "[OWNER FIRST NAME] explains how we think about your first campaign"; vslBullets ["[BULLET 1]", "[BULLET 2]", "[BULLET 3]"]; plainDealing { heading "What you will not get from us", bullets ["No long contracts", "No inflated promises", "No results we cannot show you", "No jargon"] } [OWNER: edit to what you can stand behind].

`contact.ts`: replyWindow "[REPLY WINDOW, e.g. one business day]"; whatHappensNext ["We read it the same day.", "You get a reply within [REPLY WINDOW] with an honest read.", "If we're not a fit, we say so and point you somewhere useful."].

## 7. Services content

Model (`src/content/types.ts`):

```ts
export interface Service {
  slug: ServiceSlug; name: string; oneLiner: string; promise: string; bestFor: string;
  included: string[]; honestLine?: string;          // REQUIRED (non-empty) for meta-ads and google-ads; states the test-budget method, never inexperience; content.test.ts enforces presence
  goodFit: string[]; notFit: string[]; process: string[];
  pricingLine: string;                              // rendered under "How we work"; required non-empty
  deepDive: { teaser: string; chapters: { label: string; at?: string }[]; mistakes: string[] };   // teaser required non-empty
  seo: { title: string; description: string };
}
```

There is no `fitsNiches` field. Which niches a service fits is derived from the niche content by `nichesForService(slug)` (section 6), so the `/services` chips and the "Which trades it fits" section can never drift from the Guide.

**Value-proposition structure (every service page):** what it is in one sentence -> what is included -> who it is for -> who it is not for -> how we work -> watch the long version. Copy says what the owner does, never what results were achieved. The Meta Ads and Google Ads pages carry a mandatory `honestLine` that describes the working method rather than a track record, for example: "[HONEST LINE: e.g. Every new account starts on a small test budget. You see exactly what we see, every week, before anything scales.]" The line must never claim past results. It also does not need to announce that the service is new: process framing is honest and reads as discipline, not inexperience.

| Service | promise (H1 sub) | included | goodFit / notFit | deep-dive teaser, chapters, common mistakes |
|---|---|---|---|---|
| Website | "A fast, clear site built to turn visits into calls, not to win design awards." | Mobile-first build; service and area pages; tap-to-call and short forms; speed budget; on-page SEO basics; analytics and call-tracking hooks; [REVISIONS POLICY]; launch checklist and thirty-day fixes. | For: site is slow, dated, or hard to update; running ads to a page that does not convert; no service pages. Not for: you already have a fast site that converts; you want a large e-commerce or portal build. | Teaser "[DEEP-DIVE TEASER: e.g. page structure, speed, and the call path]". Chapters: what a local service site must do; page structure; speed; the call and form path; proof without fake reviews; measuring it. Mistakes: stock photos everywhere, no phone number above the fold, no service area, no tracking. |
| Meta Ads | "Facebook and Instagram campaigns built around one clear offer, tested carefully, and reported honestly." | Account and Pixel setup; audience and geography plan; two to three creatives per test; lead form or landing page; policy compliance review; weekly review; monthly plain-language report. `honestLine`. | For: visual or offer-driven business; wants to reach people before they search; has a follow-up process. Not for: purely emergency demand; no budget for a test period; no one to follow up leads within minutes. | Teaser "[DEEP-DIVE TEASER]". Chapters: how the auction decides who sees ads; offers that make sense locally; creative basics; policy traps (health, before-and-after); retargeting; reading results; a realistic first sixty days. Mistakes: boosting posts, no Pixel, giving up after one week, no offer. |
| Local SEO | "Get your Google Business Profile and site showing up where local customers actually look." | Profile audit and cleanup; categories, services, photos; review process setup and templates; citations and NAP consistency; location and service pages; monthly progress check. | For: serves a defined area; has or can get reviews; can wait months for compounding results. Not for: needs leads this week; nationwide audience; unwilling to ask for reviews. | Teaser "[DEEP-DIVE TEASER]". Chapters: how the map pack picks businesses; the profile checklist; reviews as a system (no incentives); content that supports rankings; what to expect month by month. Mistakes: keyword-stuffed business name, ignoring reviews, inconsistent address, wrong category. |
| Google Ads | "Search campaigns that show up for the exact jobs you want, in the areas you serve, at the hours you can answer." | Keyword and negative list; ad copy; call tracking and conversion setup; landing page recommendations; budget pacing and scheduling; weekly optimization; monthly report. `honestLine`. | For: high-intent searches exist for your service; ticket size supports click costs; the phone gets answered. Not for: very low ticket; cannot answer calls; no landing page. | Teaser "[DEEP-DIVE TEASER]". Chapters: intent and match types; why negatives matter; call-only versus website ads; service-area settings; conversion tracking that must exist; budget math without promises; first ninety days. Mistakes: broad match with no negatives, no conversion tracking, sending clicks to the home page. |

Every service file ships `pricingLine: "[PRICING STANCE, e.g. flat monthly fee quoted after a call]"`. `content.test.ts` requires `pricingLine`, `deepDive.teaser`, and (for the two ads services) `honestLine` to be non-empty, and the bracket check in section 16 requires them to be filled before a production build.

Each `/learn/[service]` page: H1, deep-dive `VideoPlayer`, chapters list, "Common mistakes", CTA to `/contact?service=[slug]`.

## 8. Data model

`src/db/index.ts` uses the HTTP driver: `import { neon } from "@neondatabase/serverless"; import { drizzle } from "drizzle-orm/neon-http"; export const db = drizzle(neon(env.DATABASE_URL));`. The neon-http driver throws `No transactions support in neon-http driver` on `db.transaction()` (https://orm.drizzle.team/docs/connect-neon, https://github.com/drizzle-team/drizzle-orm/issues/2200). Rule for the whole codebase: `db.transaction` is forbidden; multi-statement writes use `db.batch([...])`, which Neon executes in one HTTP round trip as a single transaction. Where a later statement depends on a value returned by an earlier one, use a CTE in one `sql` statement or accept the ordering described in section 12.

`src/db/schema.ts` (Drizzle, Postgres). All tables use `uuid` primary keys (`defaultRandom()`) unless noted; `created_at` defaults to `now()`; every `updated_at` column uses `.defaultNow().$onUpdate(() => new Date())` so no call site has to remember it. Enum labels use the hyphenated slugs (hyphens are legal in Postgres enum labels).

```ts
import { pgTable, pgEnum, uuid, text, timestamp, integer, boolean, jsonb, date, index, uniqueIndex, primaryKey } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const serviceEnum = pgEnum("service", ["website","meta-ads","local-seo","google-ads"]);
export const leadStatusEnum = pgEnum("lead_status", ["new","replied","won","lost","spam"]);
export const subscriberStatusEnum = pgEnum("subscriber_status", ["active","unsubscribed","bounced","complained"]);
export const subscriberSourceEnum = pgEnum("subscriber_source", ["deep_dive","lead_added","import"]);
export const quizStatusEnum = pgEnum("quiz_status", ["draft","ready","sent","archived"]);
export const sendStatusEnum = pgEnum("send_status", ["in_progress","completed","failed"]);
export const recipientStatusEnum = pgEnum("recipient_status", ["pending","sent","failed","skipped"]);
export const sendTriggerEnum = pgEnum("send_trigger", ["cron","admin"]);
export const emailKindEnum = pgEnum("email_kind", ["contact_owner","contact_autoreply","unlock","daily_quiz","no_quiz_alert","quota_warning"]);
export const emailStatusEnum = pgEnum("email_status", ["pending","sent","failed"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
};

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  summary: text("summary").notNull(),
  service: serviceEnum("service"),
  niche: text("niche"),                          // validated by zod against NICHE_FORM_VALUES; new niches need no migration
  status: leadStatusEnum("status").notNull().default("new"),
  attribution: jsonb("attribution").$type<Attribution>(),
  ipHash: text("ip_hash"),
  userAgent: text("user_agent"),
  subscriberId: uuid("subscriber_id").references(() => subscribers.id, { onDelete: "set null" }),
  ownerNotifiedAt: timestamp("owner_notified_at", { withTimezone: true }),
  autoReplyAt: timestamp("auto_reply_at", { withTimezone: true }),
  notes: text("notes"),
  ...timestamps,
}, (t) => [index("leads_created_idx").on(t.createdAt), index("leads_email_idx").on(t.email)]);

export const subscribers = pgTable("subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),               // stored lowercased + trimmed
  service: serviceEnum("service"),               // primary tag = first service requested; null for lead_added without a service
  interests: serviceEnum("interests").array().notNull().default(sql`'{}'::service[]`),  // eyeball the generated SQL before the first migrate
  status: subscriberStatusEnum("status").notNull().default("active"),
  source: subscriberSourceEnum("source").notNull(),
  optInCount: integer("opt_in_count").notNull().default(1),   // +1 on every reactivation; part of the unlock idempotency key
  quizToken: text("quiz_token").notNull(),       // 32 random bytes, base64url
  unsubscribeToken: text("unsubscribe_token").notNull(),  // separate token: a forwarded quiz link cannot unsubscribe the recipient
  resendContactId: text("resend_contact_id"),
  attribution: jsonb("attribution").$type<Attribution>(),
  ipHash: text("ip_hash"),
  unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
  lastEmailedAt: timestamp("last_emailed_at", { withTimezone: true }),
  ...timestamps,
}, (t) => [
  uniqueIndex("subscribers_email_uq").on(t.email),
  uniqueIndex("subscribers_quiz_token_uq").on(t.quizToken),
  uniqueIndex("subscribers_unsub_token_uq").on(t.unsubscribeToken),
  index("subscribers_status_idx").on(t.status),
]);

export const quizzes = pgTable("quizzes", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull(),                  // e.g. 2026-10-01-negative-keywords-cost-you (lib/quiz/slug.ts)
  question: text("question").notNull(),
  explanation: text("explanation").notNull(),
  topic: serviceEnum("topic"),                   // optional, display only
  status: quizStatusEnum("status").notNull().default("draft"),
  scheduledFor: date("scheduled_for"),           // owner-local calendar date, nullable = queue
  ...timestamps,
}, (t) => [
  uniqueIndex("quizzes_slug_uq").on(t.slug),
  uniqueIndex("quizzes_scheduled_for_uq").on(t.scheduledFor), // at most one quiz per date; NULLs allowed
  index("quizzes_status_idx").on(t.status),
]);

export const quizOptions = pgTable("quiz_options", {
  id: uuid("id").primaryKey().defaultRandom(),
  quizId: uuid("quiz_id").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  position: integer("position").notNull(),       // 0..4
  isCorrect: boolean("is_correct").notNull().default(false),
}, (t) => [uniqueIndex("quiz_options_quiz_pos_uq").on(t.quizId, t.position)]);
// App rule: 2 to 5 options, exactly one isCorrect; validated in zod before write.

export const quizSends = pgTable("quiz_sends", {
  id: uuid("id").primaryKey().defaultRandom(),
  quizId: uuid("quiz_id").notNull().references(() => quizzes.id, { onDelete: "restrict" }),
  sendDate: date("send_date").notNull(),         // owner-local date
  trigger: sendTriggerEnum("trigger").notNull(),
  status: sendStatusEnum("status").notNull().default("in_progress"),
  recipientCount: integer("recipient_count").notNull().default(0),
  sentCount: integer("sent_count").notNull().default(0),
  failedCount: integer("failed_count").notNull().default(0),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  error: text("error"),
}, (t) => [
  uniqueIndex("quiz_sends_quiz_date_uq").on(t.quizId, t.sendDate),   // same quiz never twice on a day
  uniqueIndex("quiz_sends_cron_date_uq").on(t.sendDate).where(sql`${t.trigger} = 'cron'`), // cron never sends twice on a day
  index("quiz_sends_date_idx").on(t.sendDate),
  index("quiz_sends_status_idx").on(t.status),
]);

export const quizSendRecipients = pgTable("quiz_send_recipients", {
  sendId: uuid("send_id").notNull().references(() => quizSends.id, { onDelete: "cascade" }),
  subscriberId: uuid("subscriber_id").notNull().references(() => subscribers.id, { onDelete: "cascade" }),
  status: recipientStatusEnum("status").notNull().default("pending"),
  resendEmailId: text("resend_email_id"),
  error: text("error"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
}, (t) => [primaryKey({ columns: [t.sendId, t.subscriberId] }), index("qsr_status_idx").on(t.sendId, t.status)]);

export const quizAnswers = pgTable("quiz_answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  quizId: uuid("quiz_id").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
  subscriberId: uuid("subscriber_id").notNull().references(() => subscribers.id, { onDelete: "cascade" }),
  optionId: uuid("option_id").notNull().references(() => quizOptions.id, { onDelete: "cascade" }),
  isCorrect: boolean("is_correct").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("quiz_answers_quiz_sub_uq").on(t.quizId, t.subscriberId)]); // first answer wins

export const emailLog = pgTable("email_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  kind: emailKindEnum("kind").notNull(),
  toEmail: text("to_email").notNull(),
  idempotencyKey: text("idempotency_key").notNull(),
  resendEmailId: text("resend_email_id"),
  status: emailStatusEnum("status").notNull().default("pending"),
  error: text("error"),
  ...timestamps,
}, (t) => [uniqueIndex("email_log_idem_uq").on(t.idempotencyKey), index("email_log_to_idx").on(t.toEmail), index("email_log_created_idx").on(t.createdAt), index("email_log_status_idx").on(t.status)]);

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),                 // "contact:ip:<sha256>", "subscribe:email:<sha256>", "login:ip:<sha256>"
  count: integer("count").notNull().default(0),
  resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
});
```

`email_log.status` lifecycle: `pending` (claimed, send in flight) -> `sent` or `failed`. A `pending` row older than 10 minutes is treated as abandoned (function crash or timeout) and may be reclaimed; a `failed` row may always be reclaimed. Only `sent` is final. Section 10 gives the one SQL statement that implements this.

`Attribution` type (`lib/attribution.ts`): `{ utm_source?, utm_medium?, utm_campaign?, utm_content?, utm_term?, referrer?, landing_path?, first_seen_at? }`, each string max 200.

**Migrations.** All tables above, including the quiz tables, are created in the first Phase 2 migration so Phase 3 has no migration surprises. `drizzle-kit generate` writes SQL into `drizzle/` (committed); eyeball the `interests` default (`'{}'::service[]`) in the generated file. `drizzle.config.ts` reads `DATABASE_URL_UNPOOLED ?? DATABASE_URL` because Neon recommends the direct connection for DDL (https://neon.com/docs/guides/vercel-managed-integration). `npm run db:migrate` is run manually by the developer against the Neon `dev` branch first, then production, before the matching deploy. It is never part of the Vercel build command, so preview builds cannot alter the production schema.

## 9. API routes and server actions

Shared: `lib/validation.ts` zod schemas; every route returns JSON `{ ok: true, ... }` or `{ ok: false, error: { code, message, fields? } }` with proper status (400 validation, 429 rate limited, 500 server, 503 not configured). All routes `export const runtime = "nodejs"`. IPs come from the first `x-forwarded-for` value and are stored only as `sha256(ip + IP_HASH_SALT)`.

Routes beyond the spec's list, and why each exists: `/api/unsubscribe` (required for one-click unsubscribe headers), `/api/quiz/answer` (answer recording; a route rather than a server action keeps the quiz page cacheable), `/api/webhooks/resend` (bounce and complaint protection for a daily sender), and `admin/(protected)/subscribers/export/route.ts` (CSV download). Nothing else.

**Honeypot and timing gate.** Field `company_website` (rendered by `Honeypot.tsx`, hidden as in section 4) is declared `z.string().max(200).optional()` so a filled value still parses. `started_at` is `z.coerce.number().optional()`, a millisecond timestamp set client-side in a `useEffect` on mount. After parsing: if `company_website` is non-empty, or `started_at` is missing, or `Date.now() - started_at` is below the gate (3000 ms for contact, 1500 ms for subscribe, the lower value because autofill on a short one-field form is fast), respond with the SAME body and status as a real success (see each route), store nothing, send nothing, `console.warn` a JSON line with `{ route, outcome: "honeypot" | "too_fast" }`. Never tell bots they were caught. Both forms render a `<noscript>` line: "Enable JavaScript to send this form, or email {site.contactEmail}."

**Rate limiting** (`lib/rate-limit.ts`): fixed window on the `rate_limits` table, one statement:

```sql
INSERT INTO rate_limits (key, count, reset_at) VALUES ($1, 1, now() + $2::interval)
ON CONFLICT (key) DO UPDATE SET
  count = CASE WHEN rate_limits.reset_at < now() THEN 1 ELSE rate_limits.count + 1 END,
  reset_at = CASE WHEN rate_limits.reset_at < now() THEN now() + $2::interval ELSE rate_limits.reset_at END
RETURNING count;
```

`hit(key, limit, windowSeconds)` returns 429 when `count > limit`. Buckets: contact 5/hour per IP hash and 3/hour per email hash; subscribe 10/hour per IP hash and 6/day per email hash (four services plus retries); quiz answer 60/hour per IP; admin login 10 per 15 minutes per IP. Rows past `reset_at` by a day are deleted opportunistically by the cron route. Correct across serverless instances with zero new vendors; not a bot wall (Turnstile is the planned upgrade). `rate-limit.test.ts` tests the window math against a mocked query; no database in CI.

**Logging rule.** `console.info`/`console.error` JSON lines with `{ scope, route, outcome, id }`. Emails appear only masked (`a***@domain`); form bodies, names, and summaries are never logged. Every Resend failure logs the Resend error name and the row id. On preview deploys (`VERCEL_ENV === "preview"`) `sendEmail()` rewrites every `to` to `delivered@resend.dev` so previews never mail real people; Resend's `bounced@resend.dev` and `complained@resend.dev` (with `+label` support) are used to exercise the Phase 3 webhook (https://resend.com/docs/knowledge-base/what-email-addresses-to-use-for-testing).

**Zod 4 idioms** (https://zod.dev/v4/changelog): `z.email()` and `z.uuid()` at the top level, not `z.string().email()`. Shared pieces:

```ts
const emailField = z.string().trim().toLowerCase().pipe(z.email()).pipe(z.string().max(254));   // or z.email().trim().toLowerCase() if the installed version allows the chain; verify at install
const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.enum(values).or(z.literal("")).optional().transform(v => (v ? v : undefined));
```

### POST /api/contact (Phase 2)
```ts
contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: emailField,
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  summary: z.string().trim().min(20).max(2000),
  service: optionalEnum(SERVICE_SLUGS),             // client sends "" for "Not sure"
  niche: optionalEnum(NICHE_FORM_VALUES),           // client sends "other" for "Other", "" when untouched
  company_website: z.string().max(200).optional(),  // honeypot, checked after parse
  started_at: z.coerce.number().optional(),         // missing = too_fast
  attribution: attributionSchema.optional(),
});
```
Flow: parse (400 with `fields` on failure) -> honeypot and timing gate (respond `200 { ok: true, leadId: randomUUID() }`, indistinguishable from success) -> rate limit -> insert `leads` -> `Promise.allSettled` of owner email and auto-reply via `sendEmail()` (section 10) -> update `ownerNotifiedAt` / `autoReplyAt` -> `200 { ok: true, leadId }`. If email sending fails the lead is still saved; respond 200 and log the error with `leadId` so the owner finds it in `/admin/leads`. Duplicate submissions are allowed. Resend errors are never exposed to the client. `validation.test.ts` covers `service: ""` and `niche: ""` parsing to `undefined`, and a missing `started_at`.

### POST /api/subscribe (Phase 2)
```ts
subscribeSchema = z.object({ email: emailField, service: z.enum(SERVICE_SLUGS), company_website, started_at, attribution });
```
Flow: parse -> honeypot and timing gate (respond `200 { ok: true, redirectTo }` with the same `/learn` URL as a real success; the page is public anyway) -> rate limit -> `upsertSubscriber({ email, service, source: "deep_dive", attribution, ipHash })`, which is ONE statement so two simultaneous first-time submits cannot race the unique index:

```sql
INSERT INTO subscribers (email, service, interests, status, source, quiz_token, unsubscribe_token, attribution, ip_hash)
VALUES ($email, $service, ARRAY[$service]::service[], 'active', $source, $quizToken, $unsubToken, $attr, $ipHash)
ON CONFLICT (email) DO UPDATE SET
  interests = CASE WHEN $service::service = ANY(subscribers.interests) THEN subscribers.interests ELSE array_append(subscribers.interests, $service::service) END,
  service = COALESCE(subscribers.service, $service::service),
  opt_in_count = CASE WHEN subscribers.status = 'unsubscribed' THEN subscribers.opt_in_count + 1 ELSE subscribers.opt_in_count END,
  status = 'active', unsubscribed_at = NULL, updated_at = now()
  WHERE subscribers.status IN ('active', 'unsubscribed')
RETURNING *, (xmax = 0) AS inserted;
```

Outcomes: `inserted = true` means a new row (the freshly generated tokens were used); `inserted = false` means an existing `active` row (interests appended, nothing else changes) or an `unsubscribed` row that was reactivated (`opt_in_count` incremented, typing an email into the field is an explicit new opt-in); no row returned means the address is `bounced` or `complained`, which is NOT reactivated: store nothing, do not sync Resend, log `outcome: "suppressed"`, and still return the normal `200 { ok: true, redirectTo }` (instant access to `/learn` still works). Re-mailing a complained address is the fastest way to lose a new domain's reputation, and a bounced one only burns quota; the owner can reactivate from `/admin/subscribers` if the person asks.

Then `syncResendContact(subscriber)` (best effort, logged) and `sendUnlockEmail(subscriber, service)` with idempotency key `unlock:{subscriberId}:{service}:{optInCount}`, so the same person never gets the same service's email twice within one opt-in, a second service does send, and a reactivated subscriber gets a fresh email. Response `200 { ok: true, redirectTo: "/learn/[service]?src=unlock" }`; the client fires `track("subscribe")` and navigates immediately (instant access) while the email provides the durable link. The response never reveals whether the email already existed. `subscribers.test.ts` covers the four outcomes with a mocked query.

### GET and POST /api/unsubscribe (Phase 2)
`z.object({ t: z.string().min(20).max(120) })`, read from the query on GET and from the form body or query on POST. GET only redirects to `/unsubscribe?t=` (mail clients and security scanners prefetch GETs, so GET never changes state). POST looks up `unsubscribeToken`, sets `status=unsubscribed`, `unsubscribedAt=now()`, updates the Resend contact `unsubscribed:true`, and accepts the RFC 8058 one-click body (`List-Unsubscribe=One-Click`, form-encoded). Unknown token -> 200 with a generic message.

### POST /api/quiz/answer (Phase 3)
`z.object({ quizId: z.uuid(), optionId: z.uuid(), t: z.string().optional() })`. No token or unknown token -> `200 { ok: true, recorded: false }`. Valid `quizToken` -> insert `quiz_answers` `ON CONFLICT DO NOTHING`; `200 { ok: true, recorded: boolean, alreadyAnswered?: true, isCorrect }`. Correctness is computed server-side; the page already revealed the answer, so this is a record, not a gate.

### GET /api/cron/daily-quiz (Phase 3)
Auth: `Authorization: Bearer ${CRON_SECRET}` (Vercel adds it for cron calls); mismatch -> 401. If `CRON_ENABLED !== "true"` -> `200 { ok: true, result: "skipped", reason: "cron_disabled" }`. Otherwise calls `sendDailyQuiz({ trigger: "cron" })` and returns `{ ok: true, result }` where result is `skipped | resumed | completed | in_progress` with counts and reason. `export const maxDuration = 300` (valid on Hobby and Pro under Fluid compute) and `dynamic = "force-dynamic"`. Also runs `deleteExpiredRateLimits()`.

### POST /api/webhooks/resend (Phase 3)
Returns 503 while `RESEND_WEBHOOK_SECRET` is unset. Reads the raw body with `await request.text()` and verifies it with the SDK, no extra package: `resend.webhooks.verify({ payload: raw, headers: { id: h.get("svix-id"), timestamp: h.get("svix-timestamp"), signature: h.get("svix-signature") }, webhookSecret: env.RESEND_WEBHOOK_SECRET })` (https://github.com/resend/resend-node/blob/main/src/webhooks/webhooks.ts; verify the exact signature at install). Invalid -> 400. Handles `email.bounced` -> `subscribers.status = bounced` and `email.complained` -> `complained`, matched by `data.to[0]` lowercased against `subscribers.email`; a bounce for an address that is not a subscriber (a contact auto-reply) only logs a warning. Ignores other events; returns 200.

### Admin server actions (`lib/admin/actions.ts`; every action except `login()` begins with `await requireAdmin()`)

| Action | Input (zod) | Effect |
|---|---|---|
| `login(formData)` / `logout()` | password / none | section 11 |
| `createQuiz(input)` / `updateQuiz(id, input)` | slug?, question, explanation, topic?, scheduledFor?, status, options[2..5] with exactly one `isCorrect` | `db.batch([insert/update quiz, delete old options, insert options])`; slug from `quizSlug()` when omitted |
| `archiveQuiz(id)` | uuid | `status = archived` (this is "Remove" for sent quizzes) |
| `deleteQuiz(id)` | uuid | hard delete only when no `quiz_sends` row exists (FK restrict); otherwise the UI offers Remove (archive) |
| `sendQuizNow(quizId?)` | uuid? | `sendDailyQuiz({ trigger: "admin", quizId })`; without `quizId` it refuses when any send exists for today (section 12) |
| `resumeSend(sendId)` | uuid | re-runs the recipient loop for `pending` and `failed` rows only |
| `updateLeadStatus(id, status)` | enum | update |
| `addLeadToList(leadId)` | uuid | `upsertSubscriber` with `source: "lead_added"`, links `leads.subscriberId`, sends the list-welcome variant of `unlock.ts` (section 11) |
| `setSubscriberStatus(id, status)` | enum | update + Resend contact sync; this is how the owner reactivates a bounced or complained address on request |

Every action returns `{ ok, error? }` and calls `revalidatePath` for its page.

## 10. Email

**Domain setup.** Resend dashboard -> Domains -> Add `ei-conversion.com`, region US. **Copy every host name and value from the Resend Domains screen verbatim**; the region string and the DKIM host come from Resend and differ between accounts (one secondary source places the DKIM host on the sending subdomain; verify against the dashboard). Only the DMARC record is typed by hand. The table is for understanding, not for typing:

| Type | Name (verify against the dashboard) | Value | Purpose |
|---|---|---|---|
| TXT | `resend._domainkey.ei-conversion.com` | `p=...` (from Resend) | DKIM signing |
| MX | `send.ei-conversion.com` | `feedback-smtp.<region>.amazonses.com` priority 10 (from Resend) | Return-path bounces |
| TXT | `send.ei-conversion.com` | `v=spf1 include:amazonses.com ~all` (from Resend) | SPF for the return-path subdomain; does not conflict with a mailbox provider's SPF on the root |
| TXT | `_dmarc.ei-conversion.com` | `v=DMARC1; p=none; rua=mailto:[OWNER_EMAIL]; pct=100` | DMARC reporting; move to `p=quarantine` after two clean weeks of reports |

**From / reply-to.** Everything: `From: "{site.ownerFirstName} at {site.name}" <{site.fromEmail}>`. Auto-reply, unlock, and quiz mail set `Reply-To: OWNER_EMAIL`. The owner notification sets `reply_to` to the lead's email so the owner replies directly. Never send from `noreply@`; replies to the daily quiz are a good thing. Section 17 gives `hello@` a real forwarding inbox. `scripts/check-env.ts` refuses a production build while `site.ownerFirstName` or `site.mailingAddress` is still a bracket placeholder (section 15), so no real email ever goes out with "[OWNER FIRST NAME]" in the From header.

**Templates.** Plain TypeScript functions in `lib/email/templates/*` returning `{ subject, html, text }`. No React rendering, no `@react-email/render`. `layout.ts` is a 600px single-column table layout (Outlook desktop safe): navy header with the text wordmark, off-white body, system font stack, amber "bulletproof" table-cell button with navy text, footer with `site.mailingAddress` (CAN-SPAM for list mail) and an unsubscribe line for list mail. Every send includes the text part. Templates: `contact-owner`, `contact-autoreply`, `unlock` (takes `service: ServiceSlug | "guide"`), `daily-quiz`, `no-quiz-alert`, `quota-warning`.

**`sendEmail()` wrapper** (`lib/email/send.ts`):

```ts
sendEmail({ kind, to, subject, html, text, replyTo, headers, idempotencyKey })
// 1. Claim or reclaim the key (one statement):
//    INSERT INTO email_log (kind, to_email, idempotency_key, status) VALUES (..., 'pending')
//    ON CONFLICT (idempotency_key) DO UPDATE SET status = 'pending', error = NULL, updated_at = now()
//      WHERE email_log.status = 'failed' OR (email_log.status = 'pending' AND email_log.created_at < now() - interval '10 minutes')
//    RETURNING id;
//    No row returned -> the key is already 'sent' or in flight -> return { skipped: true }.
// 2. to = VERCEL_ENV === "preview" ? "delivered@resend.dev" : to
//    resend.emails.send({ from, to, subject, html, text, replyTo, headers }, { idempotencyKey })
// 3. UPDATE email_log SET resend_email_id, status = 'sent' (or status = 'failed', error)
```

A row returned from step 1 means "you own this send": a `failed` row is retried and an abandoned `pending` row (crash between steps 1 and 3) is retaken after 10 minutes, so no key is blocked forever. Resend's `idempotencyKey` option (the `Idempotency-Key` header) is the guard for the in-flight window: if step 2 actually succeeded but the response was lost, the retry returns the original result instead of sending twice. Resend remembers idempotency keys for 24 hours only and caps them at 256 characters (https://resend.com/docs/dashboard/emails/idempotency-keys). Daily allowance for the quota banner and warnings = `100 - count(email_log where status in ('sent','failed') and created_at >= today's UTC midnight)`; counting failed attempts too is the pessimistic assumption (Resend documents quota against accepted sends, so this can only over-count), because Resend's quota resets at midnight UTC.

**Flow 1: contact.** Owner: subject `New contact: {name} ({service ?? "no service"}, {niche ?? "no industry"})`; body table of every field, attribution, timestamp, link to `/admin/leads`; `reply_to` = lead email; key `contact_owner:{leadId}`. Auto-reply: subject `Got your message`; body "Thanks, {name}. {ownerFirstName} reads every message and will reply within {contact.replyWindow} with an honest read on whether we are a fit. If we're not, I'll say so and point you somewhere useful."; link to the Guide; signed by the owner; key `contact_autoreply:{leadId}`. Transactional, no unsubscribe footer.

**Flow 2: unlock/welcome.** Subject `Your {Service} walkthrough`. Body: one line of thanks, button "Watch the full video" -> `{site.url}/learn/{service}?src=email`, one paragraph about the puzzle whose wording is chosen by `appPhase()`: below 3, "You'll also get our short daily marketing puzzle when it launches. One question, one minute."; at 3, "Starting tomorrow you'll also get a short daily marketing puzzle. One question, one minute." Then the unsubscribe line `/unsubscribe?t={unsubscribeToken}` and the postal line. Headers: `List-Unsubscribe: <{site.url}/api/unsubscribe?t={unsubscribeToken}>`, `List-Unsubscribe-Post: List-Unsubscribe=One-Click`. Key `unlock:{subscriberId}:{service}:{optInCount}`. The `"guide"` variant (used by `addLeadToList`): subject `Your guide to marketing for local service businesses`, button "Read the guide" -> `{site.url}/guide?src=email`, a sentence saying the owner added them to the puzzle list after their message and how to stop it, key `unlock:{subscriberId}:guide:{optInCount}`.

**Flow 3: daily quiz.** Subject `Puzzle: {first 60 chars of question}`. Body: question text, options as plain text (no answer), button "See the answer" -> `{site.url}/quiz/{slug}?t={quizToken}`, unsubscribe footer and headers as above. Sent per recipient with `resend.batch.send(items, { idempotencyKey, batchValidation: "permissive" })` in chunks of up to 100. Batch idempotency keys are supported (https://resend.com/changelog/batch-idempotency-keys). Permissive validation means valid addresses are sent and the response carries `errors[]` with the 0-based `index` and `message` of each rejected item, so one bad address no longer fails the other 99 (https://resend.com/changelog/batch-validation-modes; the SDK sets the `x-batch-validation` header, https://github.com/resend/resend-node/blob/main/src/batch/batch.ts). Verify at install that `data[]` in permissive mode omits the failed entries, so email ids are mapped to recipients by walking positions and skipping error indexes. Each recipient has an `email_log` row with key `quiz:{sendId}:{subscriberId}`, claimed with the same reclaim statement as `sendEmail()` before the batch call. Verify at install that `batch.send` accepts per-item `headers` and `replyTo`; if it does not, the loop falls back to `resend.emails.send` per recipient with idempotency key `quiz:{sendId}:{subscriberId}`, a 550 ms delay between calls to respect Resend's 2 requests/second limit (about 55 s per 100 recipients, inside the 240 s budget), and the same `email_log` keys.

**Broadcasts versus per-recipient sends.** Decision: per-recipient `batch.send`. Each link must carry the subscriber's `quizToken`, each recipient needs a resume-safe DB row, and idempotency must rest on our own unique indexes rather than Resend state. The honest cost: per-recipient sends consume the 100/day transactional quota, which forces Resend Pro at roughly 70 to 80 active subscribers. A Broadcast to a Segment with a `quiz_token` contact property would be free to 1,000 contacts but gives up per-recipient send records and resume. If the list grows large and the owner wants to avoid Pro, that switch is documented in Future work.

**Segments and Contacts.** Resend renamed Audiences to Segments and contacts are now global. In SDK 6.28.1 `CreateContactOptions` takes `segments?: { id: string }[]` and `audienceId` survives only in a deprecated legacy type (https://github.com/resend/resend-node/blob/main/src/contacts/interfaces/create-contact-options.interface.ts, https://resend.com/docs/dashboard/segments/migrating-from-audiences-to-segments). `lib/email/contacts.ts`: `syncResendContact(sub)` calls `resend.contacts.create({ email, unsubscribed: status !== "active", segments: [{ id: env.RESEND_SEGMENT_ID }] })` on first sync (storing `resendContactId`), `resend.contacts.update({ email, unsubscribed })` afterwards, and `resend.contacts.segments.add(...)` when a contact that already exists globally must be attached to the segment (verify the exact method name at install, https://github.com/resend/resend-node/blob/main/src/contacts/contacts.ts). The env var is `RESEND_SEGMENT_ID`. The Segment exists so the owner can send an ad-hoc Broadcast from the dashboard; the app never sends through it.

**Unsubscribe handling.** Section 9: GET redirects to a confirm page, POST (form button or one-click) performs it and syncs Resend. The daily send selects only `status='active'`. Bounces and complaints arrive through the Phase 3 webhook; until then the owner can set status on `/admin/subscribers`. If a dashboard Broadcast is ever sent, its `{{{RESEND_UNSUBSCRIBE_URL}}}` updates Resend only; the `contact.updated` webhook event can reconcile it later (Future work).

**Idempotency of the daily send.** Three layers: unique `(quiz_id, send_date)` plus the partial unique `(send_date) WHERE trigger='cron'` on `quiz_sends` (insert-first locks), per-recipient rows with status (resume-safe), and `email_log` claim/reclaim plus Resend idempotency keys (retry-safe). Detailed in section 12.

## 11. Admin

**Auth.** One shared password in `ADMIN_PASSWORD`; session secret in `ADMIN_SESSION_SECRET` (32+ random bytes). No auth library.

- `/admin/login` (`app/admin/(auth)/login/page.tsx`, bare layout, no shell): password field -> `login(formData)` server action, rate limited 10 per 15 minutes per IP hash through the `rate_limits` table (`login()` is the one action that does not call `requireAdmin()`). Compare `timingSafeEqual(sha256(input), sha256(ADMIN_PASSWORD))`; hashing first makes the lengths equal so `timingSafeEqual` cannot throw or leak length. On success set cookie `ei_admin` = `${expiresAtUnix}.${base64url(HMAC-SHA256(ADMIN_SESSION_SECRET, "admin:" + expiresAtUnix))}`, `httpOnly`, `secure` (except localhost), `sameSite: "lax"`, `path: "/"`, `maxAge` 7 days. Redirect to `?next=` if it starts with `/admin`, else `/admin`.
- `src/proxy.ts` (Next 16's name for middleware, https://nextjs.org/docs/messages/middleware-to-proxy; it runs on the Node.js runtime only, so Web Crypto and `node:crypto` are both available) with `matcher: ["/admin/:path*"]`: allow `/admin/login`; otherwise parse the cookie, check expiry, recompute the HMAC, constant-time compare; failure -> redirect `/admin/login?next=`. Because the CSV export lives at `/admin/subscribers/export` it is covered by the same matcher.
- `app/admin/(protected)/layout.tsx` calls `requireAdmin()` and renders the shell (nav: Dashboard, Quizzes, Leads, Subscribers, Logout) and `export const maxDuration = 300` so server actions bound to these pages (including `sendQuizNow`) get the same duration as the cron route. Layouts do not re-run on client navigation, so every protected page and every server action calls `requireAdmin()` itself; the proxy is a convenience layer, not the only gate.
- `logout()` clears the cookie. Rotating `ADMIN_SESSION_SECRET` logs everyone out.
- All admin pages: `robots: noindex`; `X-Robots-Tag: noindex` header for `/admin/:path*` in `next.config.ts`; `robots.ts` disallows `/admin` and `/api`.

**Pages.**
- `/admin`: counts (new leads, active subscribers, ready quizzes, last send date and status), today's remaining Resend allowance (section 10), a red banner when active subscribers exceed 70 ("Approaching the Resend free-tier daily cap (100/day). Upgrade to Resend Pro before 80 subscribers."), and an amber banner whenever the latest `quiz_sends` row is not `completed` ("Yesterday's/today's send did not finish: N pending, M failed") with a Resume button, so the owner acts the same day.
- `/admin/quizzes`: table (slug, question, status, scheduledFor with an "overdue" badge when `scheduled_for < today` and status is `ready`, last sent, answers count and percent correct). Default filter hides `archived`; "Show archived" toggle. Buttons: New, Edit, Delete (only for quizzes with no `quiz_sends` row), Remove (archive) for sent quizzes, and `SendNowButton` in the header. Per row: "Send this one now".
- `/admin/quizzes/new` and `/admin/quizzes/[id]`: `QuizForm` with question, explanation, 2 to 5 options with a radio for the correct one, slug (auto from `quizSlug(question, scheduledFor ?? today)`, editable), topic, scheduledFor, status, plus a preview panel that renders the daily-quiz template.
- `/admin/leads`: newest first: date, name, email, phone, service, niche, summary (expandable), status select, attribution popover, "Add to newsletter list" (disabled with label "On list" when `subscriberId` is set).
- `/admin/subscribers`: email, service, interests, status, source, created, last emailed, answers count; status select; filter by status and service; "Export CSV" -> `GET /admin/subscribers/export` (calls `requireAdmin()`, returns `text/csv`, `Content-Disposition: attachment; filename=subscribers-YYYY-MM-DD.csv`, columns email, service, interests, status, source, created_at, last_emailed_at).

**"Send today's quiz now."** `SendNowButton` (header) shows, before sending, which quiz `pickTodaysQuiz()` would choose and how many active recipients there are against today's remaining allowance, then a confirmation dialog. If any `quiz_sends` row already exists for today it is disabled and shows "Today's quiz already went out at HH:MM" (or "did not finish" with Resume). Result shown inline: `completed: 42 sent, 0 failed`, `skipped: already_sent_today`, or the error. The per-row "Send this one now" is the deliberate path for a second, different quiz on the same day: it calls `sendQuizNow(quizId)` and, when a send already exists today, the confirmation says so explicitly ("A quiz already went out today. Send this one as well?"). Both paths use the same code as cron.

**"Add lead to list."** `addLeadToList(leadId)`: upsert subscriber from the lead email (`source: "lead_added"`, `service: lead.service`, interests accordingly, copy `attribution`), set `leads.subscriberId`, sync the Resend contact, and send the `"guide"` welcome variant, never a service walkthrough. Reason: the lead did not opt in themselves, so the first email must say what they will receive and how to stop it; a video they never asked for would read as an odd broadcast mid-conversation. Idempotent: a second click finds the existing subscriber and the existing `email_log` key, so nothing re-sends. Bounced or complained addresses are not reactivated by this action either; the owner uses `setSubscriberStatus` deliberately if the person asks.

## 12. Daily quiz system

**Cron config** (`vercel.json`, committed as the LAST step of Phase 3, after the owner has loaded at least 14 ready quizzes; Vercel crons cannot be toggled, they are live in every production deploy that contains the file; `CRON_ENABLED` is the software switch on top of that):
```json
{ "crons": [{ "path": "/api/cron/daily-quiz", "schedule": "0 13 * * *" }] }
```
Vercel cron runs in UTC only, Hobby fires once per day within the scheduled hour, and Vercel calls the path with GET and `Authorization: Bearer <CRON_SECRET>` (https://vercel.com/docs/cron-jobs/manage-cron-jobs). `0 13 * * *` is 9:00 Eastern in summer and 8:00 in winter; `[OWNER PICKS SEND HOUR]` and accepts the one-hour DST drift (documented in the README). Weekday-only is a one-line change with no code: `0 13 * * 1-5`. Minute precision needs Vercel Pro; the code does not change. On Hobby the same-day cron never runs twice, so anything unfinished waits for tomorrow's invocation or the owner's Resume click.

**"Today."** `lib/dates.ts` `todayInTimezone(site.timezone)` returns `YYYY-MM-DD` with `new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now)`. No dependency. All `send_date` and `scheduled_for` values are owner-local calendar dates, so a 13:00 UTC cron and an admin "send now" at 23:30 local agree on the date. `test/dates.test.ts` covers 23:30 and 00:30 across a DST boundary.

**Slugs** (`lib/quiz/slug.ts`): `quizSlug(question, date)` = `${date}-${slugify(question).split("-").slice(0, 5).join("-")}`, lowercase ASCII, max 80 characters; on collision append `-2`, `-3`. Used by `QuizForm` and the seed script alike.

**Seed input** (`content/quizzes.sample.json`): an array of `{ slug?, question, explanation, topic?, scheduledFor?, options: [{ label, isCorrect }] }`. `scripts/seed-quizzes.ts` validates each entry with the same zod schema as `createQuiz`, upserts by slug with status `ready`, and refuses to run when `VERCEL_ENV === "production"`. Production quizzes are entered through `/admin/quizzes/new`.

**Selection** (`lib/quiz/select.ts`, `pickTodaysQuiz(today)`), always restricted to `status = 'ready'` quizzes that have NO `quiz_sends` row with status `in_progress` or `completed`:
1. The quiz with `scheduled_for = today`.
2. Else the oldest `ready` quiz with `scheduled_for < today OR scheduled_for IS NULL`, ordered by `scheduled_for NULLS LAST, created_at`. A quiz scheduled for a day that was missed (cron failure, quota, owner scheduled in the past) is therefore sent on the next run instead of sitting forever; `/admin/quizzes` shows it with an "overdue" badge.
3. Else `null`: no `quiz_sends` row is written (so the admin can still send later that day); the cron emails the owner "No quiz queued" via `sendEmail` with key `no_quiz_alert:{today}` and returns `skipped: no_quiz_ready`. The queue never runs dry silently.

`quiz-select.test.ts` covers: scheduled-today beats the queue; overdue scheduled quiz is picked before the queue; sent and archived quizzes excluded; a quiz with an `in_progress` send excluded; empty queue.

**Send algorithm** (`lib/quiz/send.ts`, `sendDailyQuiz({ trigger, quizId? })`):

```
today = todayInTimezone(site.timezone)

# 1. Finish unfinished work first (cron only; admin sees a Resume button instead)
if trigger == cron:
  for each quiz_sends row WHERE status = 'in_progress' AND started_at < now() - interval '10 minutes':
    resumeSend(row.id)                       # any date; e.g. yesterday's timed-out send
  # 'failed' sends (nothing delivered) are NOT auto-resumed daily; the owner resumes or archives them

# 2. One-per-day guard
todays = SELECT * FROM quiz_sends WHERE send_date = today ORDER BY started_at
if !quizId:
  if todays.length > 0:
    return { result: "skipped", reason: todays.some(completed) ? "already_sent_today" : "needs_resume", sendId }
  quiz = pickTodaysQuiz(today)
  if !quiz: (cron) sendEmail no-quiz-alert key no_quiz_alert:{today}; return skipped:no_quiz_ready
else:
  quiz = load(quizId); if quiz.status != 'ready' -> return skipped:quiz_not_ready
  # the admin UI has already shown the "a quiz already went out today" confirmation for this path

# 3. Create the send row (this is the lock)
send = INSERT quiz_sends (quiz_id, send_date = today, trigger) ON CONFLICT DO NOTHING RETURNING *
if !send -> return skipped:already_sent          # lost the race to a concurrent cron/admin call

# 4. Mark the quiz and enrol recipients atomically (one db.batch, no transaction API)
db.batch([
  UPDATE quizzes SET status = 'sent' WHERE id = quiz.id AND status = 'ready',
  INSERT INTO quiz_send_recipients (send_id, subscriber_id, status) SELECT send.id, id, 'pending' FROM subscribers WHERE status = 'active',
  UPDATE quiz_sends SET recipient_count = (SELECT count(*) FROM quiz_send_recipients WHERE send_id = send.id) WHERE id = send.id,
])
if recipient_count > remaining daily allowance -> sendEmail quota-warning (key quota_warning:{send.id}) and continue

# 5. Loop (shared with resumeSend as runSendLoop(send))
return runSendLoop(send)
```

The quiz is marked `sent` before any email leaves, and `pickTodaysQuiz` also excludes quizzes with an `in_progress` or `completed` send, so a timed-out send can never cause tomorrow's cron to pick the same quiz and mail the whole list again. If step 3 succeeds and the function dies before step 4 completes, the row has `recipient_count = 0` and `status = in_progress`; `resumeSend` detects that and re-runs step 4 before the loop.

```
runSendLoop(send):
  started = now()
  loop:
    chunk = SELECT r.*, s.email, s.quiz_token, s.unsubscribe_token
            FROM quiz_send_recipients r JOIN subscribers s ON s.id = r.subscriber_id
            WHERE r.send_id = send.id AND r.status IN ('pending','failed') AND s.status = 'active' LIMIT 100
    if chunk empty -> break
    for each recipient: claim email_log key quiz:{send.id}:{subscriber_id} with the reclaim statement from section 10
      no row returned  -> this recipient's email is already 'sent' -> UPDATE recipient status = 'skipped'
      row returned     -> keep in `claimed`
    if claimed empty -> continue
    try:
      res = resend.batch.send(claimed.map(toEmail), { idempotencyKey: `quiz_send:${send.id}:${sha256(sorted claimed ids)}`, batchValidation: "permissive" })
      failedIdx = set of res.errors[].index
      for i, recipient in claimed:
        if i in failedIdx -> recipient 'failed' + email_log 'failed' with the message
        else             -> recipient 'sent' + email_log 'sent' with the mapped resend id; subscribers.last_emailed_at = now()
    catch (network/thrown):
      every recipient in claimed -> 'failed'; their email_log rows -> 'failed' with the error   (never deleted, never 'skipped')
    UPDATE quiz_sends sent_count, failed_count
    if now() - started > 240 s -> break                 # leave the rest 'pending'; cron step 1 or Resume continues
  remaining = count(recipients WHERE status = 'pending')
  UPDATE quiz_sends SET
    status = remaining > 0 ? 'in_progress' : (sent_count = 0 AND recipient_count > 0 ? 'failed' : 'completed'),
    completed_at = remaining > 0 ? NULL : now()
  return { result: remaining > 0 ? "in_progress" : "completed", sentCount, failedCount, skippedCount }
```

Because a failed chunk sets its `email_log` rows to `failed` (not deleted, not left `pending`) and the reclaim statement returns a row for `failed` or stale `pending` keys, `resumeSend` retries exactly the recipients that never received the email and marks `skipped` only those whose key is already `sent`. `resumeSend(sendId)` = load the send, run step 4 if `recipient_count = 0`, then `runSendLoop`. A recipient marked `sent` is never re-sent, and a send with any sent recipients can never be deleted. `quiz-send.test.ts` (mocked db and Resend) covers: conflict on the send row; a chunk that throws marks every claimed recipient and their log rows `failed`; resume then sends only pending and failed recipients and skips sent ones; permissive errors mark only the indexed recipients failed; the 240 s budget leaves `in_progress`; counts.

**Subscriber token in the link.** `/quiz/{slug}?t={quizToken}`. The page does not require it; `Quiz.tsx` reads it on mount, strips it from the URL with `history.replaceState`, and includes it in `/api/quiz/answer`. Tokens are random per subscriber (stored, unique), so the same token works for every day's link; because it is separate from `unsubscribeToken`, a forwarded quiz link cannot unsubscribe the original recipient. (A stateless HMAC token was considered and rejected: it needs another secret and offers nothing the two stored columns do not.)

**Answer recording.** `quiz_answers` unique on `(quiz_id, subscriber_id)`: first answer counts; later attempts return `recorded: false, alreadyAnswered: true` and the UI still reveals the answer. Admin sees per-quiz totals and percent correct. No leaderboard.

## 13. Analytics and tracking

- `components/analytics/Analytics.tsx` (in `layout.tsx`) renders the Meta Pixel base script only if `NEXT_PUBLIC_META_PIXEL_ID` is non-empty and the GA4 `gtag.js` loader only if `NEXT_PUBLIC_GA4_MEASUREMENT_ID` is non-empty, via `next/script` `strategy="afterInteractive"`. Empty env = zero third-party bytes shipped. No `@vercel/analytics` and no other analytics SDK.
- App Router navigations are client-side, so the base scripts' one PageView would miss Guide -> niche -> Services. `Analytics.tsx` configures gtag with `send_page_view: false` and has a `usePathname()` + `useSearchParams()` effect that fires `fbq("track", "PageView")` and `gtag("event", "page_view", { page_location })` on every pathname change including the first. `page_location` is built from the current URL with the `t` query parameter removed, so quiz and unsubscribe tokens never reach Google or Meta even if they are still in the URL when the effect runs.
- `lib/analytics.ts` `track(event, props)` calls `window.gtag("event", ...)` and `window.fbq("track" | "trackCustom", ...)` when defined; no-op otherwise.

| Event | Where | Params | Meta | GA4 |
|---|---|---|---|---|
| `contact_submit` | `/thank-you` mount, only when `sessionStorage.ei_contact` is present (then removed) | `service`, `niche` | `Lead` | `generate_lead` |
| `subscribe` | `EmailCapture` success (the only place) | `service` | `CompleteRegistration` | `sign_up` |
| `video_play` | `VideoPlayer` first play | `slot` | custom | `video_start` |
| `video_progress` | 25/50/75/100 percent | `slot`, `pct` | custom | `video_progress` |
| `cta_click` | `Button` with `trackEvent` | `label`, `href` | custom | `select_content` |
| `quiz_answer` | `Quiz` reveal | `slug`, `correct` | custom | custom |
| `niche_select` | `NichePicker` | `niche` | custom | custom |

- UTM and source: `AttributionCapture` (tiny client component in the layout) reads `utm_*`, `document.referrer`, `location.pathname`, and `?src=` (used as `utm_source` fallback for `email`, `quiz`, `unlock`) on first page view and writes a first-party cookie `ei_attr` (JSON, 30 days, `sameSite=lax`, not httpOnly). First touch only: it never overwrites an existing cookie. both forms read it at submit time (`readAttributionCookie`) and send it in the JSON body; the server validates with `attributionSchema` and stores it in `leads.attribution` / `subscribers.attribution`. Email links carry `?src=email` or `?src=quiz` so email-driven leads are attributable.
- Consent stance: audience is US local businesses. No cookie banner at launch; nothing loads until an id is set, and `/privacy` discloses Pixel and GA4 once enabled. If the owner ever targets visitors in jurisdictions requiring consent, add a lightweight banner gating the two scripts behind a `localStorage` flag; `Analytics.tsx` reserves a single `consentGranted` boolean for it. No analytics on `/admin`.

## 14. Video

**R2 setup.** Bucket `ei-conversion-media` (region auto). Public URL comes from `NEXT_PUBLIC_MEDIA_BASE_URL`, which is optional in every phase until the first slot is `ready: true`. Two options:
- Recommended before real traffic: custom domain `media.ei-conversion.com` attached under R2 -> Settings -> Custom Domains. This requires the domain's DNS zone to be on Cloudflare (free plan), see section 17.
- Fallback while DNS stays at the registrar: the `https://pub-xxxx.r2.dev` subdomain. Cloudflare rate-limits r2.dev and documents it as not intended for production (https://developers.cloudflare.com/r2/buckets/public-buckets/). Acceptable for early placeholders and low traffic; the migration trigger is the first paid campaign or any playback stalls. Switching is one env var change.

**Slot registry** (`content/videos.ts`):

```ts
export type VideoSlotKey = "home" | `services.${ServiceSlug}.short` | `learn.${ServiceSlug}`;
export interface VideoSlot { key: string; poster: string; title: string; durationSeconds?: number; ready: boolean; }
export const videos: Record<VideoSlotKey, VideoSlot> = { home: { key: "video/home.mp4", poster: "video/home.jpg", title: "...", ready: false }, /* ... */ };
export function mediaUrl(slot: VideoSlotKey): { src: string; poster: string } | null {
  const base = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  const v = videos[slot];
  return base && v.ready ? { src: `${base}/${v.key}`, poster: `${base}/${v.poster}` } : null;
}
```

Object keys:
```
video/home.mp4                     video/home.jpg
video/services/website-short.mp4   video/services/website-short.jpg   (short VSLs, 2 to 4 min)
video/learn/website-deep.mp4       video/learn/website-deep.jpg       (deep dives, 10 to 20 min)
```
Set `Cache-Control: public, max-age=31536000, immutable` on upload and version file names when replacing (`home-v2.mp4`). CORS is not needed for a native `<video>` src. Upload via the dashboard or `wrangler r2 object put`.

`next.config.ts` adds the poster host only when the variable exists, so early builds do not throw on `new URL(undefined)`:

```ts
const media = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
images: { remotePatterns: media ? [{ protocol: "https", hostname: new URL(media).hostname }] : [] }
```

**Encoding** (commands in the README). 720p H.264 is the default for talking-head content; 1080p (`-maxrate 5000k`) only for screen recordings with small text. A 15-minute deep dive lands near 250 MB at 720p; nine videos are about 1.5 GB total.
```
ffmpeg -i in.mov -vf "scale=1280:720" -c:v libx264 -profile:v high -preset slow -crf 23 -maxrate 2500k -bufsize 5000k -pix_fmt yuv420p -r 30 -c:a aac -b:a 128k -movflags +faststart out.mp4
ffmpeg -ss 00:00:03 -i out.mp4 -frames:v 1 -q:v 3 poster.jpg
```
Poster: 1280x720 JPEG under 120 KB from a frame where the speaker looks at the camera; served through `next/image` with the `remotePatterns` entry above.

**`VideoPlayer` behavior.** Client component. When `mediaUrl(slot)` is `null` (env var missing or `ready: false`) it renders a neutral 16:9 card with the title and "Video coming soon", no play button; the page ships regardless. Otherwise it renders the poster (`next/image`, `priority` only for the home hero), a real `<button>` "Play video: [title]", and a duration badge. No `<video>` element exists before intent. On click: mount `<video controls playsInline preload="none" poster src>`, call `video.play()`, hide the overlay, fire `track("video_play", {slot})` once, then `video_progress` at quartiles via `timeupdate`. Zero MP4 bytes, not even metadata, load before the click. No autoplay ever.

**Slots.** `home` on `/`; `services.[slug].short` on `/services/[slug]`; `learn.[slug]` on `/learn/[slug]`. Nine files at launch, all optional until the owner records them.

## 15. Environment variables

| Variable | Purpose | Public? | First phase | Required? |
|---|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin `https://ei-conversion.com`; set ONLY in the Vercel Production environment (previews fall back to `VERCEL_URL`) | yes | 1 | production builds |
| `APP_PHASE` | `1`, `2`, or `3`; tells `scripts/check-env.ts` which variables are required and gates server copy (unlock template); default `1` when unset | no | 1 | optional (default 1) |
| `NEXT_PUBLIC_APP_PHASE` | Public mirror of `APP_PHASE` for client components (`ContactForm` mailto fallback, `EmailCapture` visibility, `/learn` footer line); check-env fails if the two differ | yes | 1 | optional (default 1) |
| `NEXT_PUBLIC_MEDIA_BASE_URL` | R2 public base URL (custom domain or r2.dev) | yes | 1 | optional until the first `ready: true` slot |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Pixel; empty = not loaded | yes | 1 (slot), value later | optional |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | GA4 `G-XXXX`; empty = not loaded | yes | 1 (slot), value later | optional |
| `DATABASE_URL` | Neon pooled connection string (set by the Marketplace integration; Preview deployments get their own Neon branch value automatically) | no | 2 | phase >= 2 |
| `DATABASE_URL_UNPOOLED` | Neon direct connection (also set by the integration); used only by `drizzle.config.ts` for `npm run db:migrate` | no | 2 | optional (falls back to `DATABASE_URL`) |
| `RESEND_API_KEY` | Resend API key, Full access (sending + contacts) | no | 2 | phase >= 2 |
| `RESEND_SEGMENT_ID` | Segment (formerly Audience) id for contact sync | no | 2 | phase >= 2 |
| `OWNER_EMAIL` | Owner notification target, Reply-To, DMARC reports | no | 2 | phase >= 2 |
| `IP_HASH_SALT` | Random 32 bytes for `sha256(ip + salt)` | no | 2 | phase >= 2 |
| `ADMIN_PASSWORD` | Admin login password (20+ chars) | no | 3 | phase >= 3 |
| `ADMIN_SESSION_SECRET` | HMAC key for the admin cookie (32+ random bytes) | no | 3 | phase >= 3 |
| `CRON_SECRET` | Vercel Cron bearer token | no | 3 | phase >= 3 |
| `CRON_ENABLED` | `"true"` lets the cron route send; anything else returns `skipped: cron_disabled` | no | 3 | optional |
| `RESEND_WEBHOOK_SECRET` | Signing secret for `/api/webhooks/resend`; route returns 503 while unset | no | 3 | optional (check-env warns) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile widget (later); empty = not rendered | yes | future | optional |
| `TURNSTILE_SECRET_KEY` | Turnstile server verification (later) | no | future | optional |

The Neon integration also injects legacy `POSTGRES_URL` / `PG*` variables; the app ignores them.

`lib/env.ts` reads these lazily with zod and throws a clear error naming the missing variable. `scripts/check-env.ts` runs in `prebuild` (via `tsx`) with exactly these rules:
- Required: phase 1 -> `NEXT_PUBLIC_SITE_URL` when `VERCEL_ENV === "production"`; phase 2 -> plus `DATABASE_URL`, `RESEND_API_KEY`, `RESEND_SEGMENT_ID`, `OWNER_EMAIL`, `IP_HASH_SALT`; phase 3 -> plus `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `CRON_SECRET`. Everything else is optional; `RESEND_WEBHOOK_SECRET` missing at phase 3 is a warning.
- `APP_PHASE` and `NEXT_PUBLIC_APP_PHASE` must be equal (both default to `1`).
- When `VERCEL_ENV === "production"` (any phase): fail if any string in `src/config/site.ts` or under `src/content/` still matches the bracket-placeholder regex `/\[[A-Z][^\]]*\]/`. Preview and local builds only warn, so Phase 1 development with placeholders proceeds while a live site can never show literal brackets or send mail from "[OWNER FIRST NAME]".

`.env.example` lists all with comments. Local dev uses `.env.local` (git-ignored), pulled with `vercel env pull .env.local` after `vercel link`.

## 16. Phase plan

### Phase 1: static site (no database; target 1 to 2 weeks)
1. `npx create-next-app@latest` with TypeScript, Tailwind, App Router, `src/`, ESLint. Pin Next 16.3.x and Tailwind 4.3.x. Add `zod`, Vitest, `tsx`, `@next/bundle-analyzer` (dev), `.nvmrc` = `24`, `engines.node`, `tsconfig` paths alias, `vitest.config.ts` alias, `.env.example`, `README.md`, `.github/workflows/ci.yml`, and the `package.json` scripts from section 3. No Prettier, no Playwright.
2. `config/site.ts`; `globals.css` tokens (`@theme` plus `@theme inline` for fonts, text scale, heading classes); `layout.tsx` with both font `.variable` classes on `<html>`, `color-scheme: light`, skip link, `metadataBase`, OG and Twitter defaults.
3. UI components: Wordmark, Button (with `data-tone` styling), Section, Card, Eyebrow, ProsCons, Field, Nav (active underline), MobileMenu, Footer.
4. Content: `types.ts`, `niches/index.ts` registry with derived slugs and `nichesForService`/`joinNames`, three niche files (with `plural`, `teaser`), four service files (with `pricingLine`, `deepDive.teaser`), `home.ts`, `contact.ts`, `videos.ts` (all `ready: false`, `mediaUrl`), `privacy.ts`.
5. Owner supplies every bracketed value in `site.ts`, `home.ts`, `contact.ts`, the four service files (honest lines, pricing lines, teasers, revisions policy), and `privacy.ts`; the developer replaces them. Videos may stay placeholders; text may not.
6. Pages: `/`, `/guide`, `/guide/[niche]`, `/services`, `/services/[service]`, `/learn/[service]` (all three dynamic routes with `dynamicParams = false` and awaited `params`), `/contact` (Phase 1 mailto fallback), `/thank-you`, `/privacy`, `not-found`, `sitemap.ts`, `robots.ts`, `favicon.ico` in `src/app/`.
7. `VideoPlayer` with the coming-soon card; `ContactForm` UI with the `publicPhase()` branch; `EmailCapture` built but hidden below phase 2 (the deep-dive band links to `/learn`); `Honeypot`, `lib/phase.ts`.
8. `Analytics.tsx` env-gated with SPA page views and token stripping; `lib/analytics.ts`; `AttributionCapture` cookie.
9. SEO metadata per page; JSON-LD helpers; `opengraph-image.tsx`; `scripts/check-env.ts` with the rules in section 15.
10. `test/content.test.ts` with: ranks 1 to 4 unique per niche; `slug` equals registry key; non-empty `plural`, `teaser`, service lists, `pricingLine`, `deepDive.teaser`; `honestLine` present on the two ads services; the claims regexes below against every string under `src/content` and `src/config`; the bracket regex when `CONTENT_STRICT=1` (CI sets it on `main`).
11. Deploy to Vercel on Hobby and share the `*.vercel.app` URL with the owner for review. Before pointing `ei-conversion.com` at the project, upgrade the Vercel project to Pro (section 17 A). Then connect the domain and set the Phase 1 production env vars (`NEXT_PUBLIC_SITE_URL`, `APP_PHASE=1`, `NEXT_PUBLIC_APP_PHASE=1`).
12. Optional but recommended now: add the Resend DNS records (section 10, 17 D) so verification propagates while Phase 2 is built.

Claims regexes (fail the test on any match in content strings): `/\d+(\.\d+)?\s?%/`, `/\b\d+x\b/i`, `/\b\d+ (clients|customers|leads|calls|jobs)\b/i`, `/\b(testimonial|case stud|our clients|trusted by|guarantee|ROI|we (got|generated|increased|doubled)|results? for)\b/i`. Bracket regex: `/\[[A-Z][^\]]*\]/`. The bare word "clients" is allowed (the med-spa content legitimately uses it).

Acceptance: `npm run lint`, `npm test`, and `npm run build` all pass locally and in CI; every route renders with no console errors and `/guide/hvac` returns the 404 page; the computed font-family of an `h1` is Manrope in DevTools; Lighthouse mobile 90+ on all four categories for the four target pages; adding a fifth niche = one new content file plus one import line in `niches/index.ts`, with zero changes under `app/` or `components/`, and the new guide page, picker card, footer link, contact select option, and sitemap entry appear; changing `site.name` updates nav, footer, titles (including Home), and JSON-LD; with empty analytics vars no request to `facebook.net` or `googletagmanager.com` appears in the network log; if a test MP4 is available, no MP4 bytes load before the click (otherwise verify with a local file in `public/` and delete it before merge); `grep -rn '\[[A-Z]' src/content src/config` returns nothing and a `curl` of every public page contains no `[`-prefixed uppercase token; `/contact` in Phase 1 opens the mail client with `site.contactEmail`. Done = the site is live on `ei-conversion.com` on a Pro project, every CTA resolves, the contact page reaches the owner by email link, and the owner can share the URL.

### Phase 2: forms, database, email flows 1 and 2 (target 1 week of build plus the DNS wait)
1. `npm i -g vercel && vercel link`. Neon via the Vercel Marketplace (Postgres 18). Create a Neon branch `dev` in the Neon console; put its pooled URL in `.env.local` as `DATABASE_URL` and set the Vercel Preview environment `DATABASE_URL` to the `dev` branch so preview-deploy form tests never write production rows. `vercel env pull .env.local`. Install `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`, `resend`.
2. `db/index.ts` (neon-http, `db.batch`, no transactions), `db/schema.ts` with every table from section 8; `npm run db:generate`; check the `interests` default in the SQL; `npm run db:migrate` against `dev`, then `DATABASE_URL_UNPOOLED=<prod direct url> npm run db:migrate` for production.
3. `lib/rate-limit.ts`, `lib/tokens.ts`, `lib/validation.ts` (Zod 4 idioms, `optionalEnum`), `lib/attribution.ts` server side; generate `IP_HASH_SALT`.
4. Resend: add the domain and DNS records if not done in Phase 1 step 12, verify; create the "Newsletter" segment; set `RESEND_API_KEY` (Full access), `RESEND_SEGMENT_ID`, `OWNER_EMAIL`, `IP_HASH_SALT` in Vercel (Production and Preview) and `.env.local`. Owner supplies `mailingAddress` and `replyWindow` if not already filled. `lib/email/*` wrapper (claim/reclaim, preview rewrite), contacts (segments API), layout, and the contact-owner, contact-autoreply, and unlock templates (phase-aware puzzle sentence, `"guide"` variant).
5. `POST /api/contact`, `POST /api/subscribe` (single-statement upsert, suppression rule), `GET/POST /api/unsubscribe`, `/unsubscribe` page; wire `ContactForm` (client validation with the same zod schema, inline server errors, 429/500 copy, `sessionStorage.ei_contact`, redirect to `/thank-you`) and `EmailCapture` (inline success plus instant redirect to `redirectTo`).
6. `scripts/send-test-email.ts`; run the Phase 2 deliverability checklist (section 18) using the unlock and auto-reply templates. There is no recipient restriction: transactional mail at launch volume IS the warm-up. The two-week low-volume period applies to the daily quiz in Phase 3.
7. Vitest: validation (including `service: ""`, missing `started_at`), honeypot and timing gate, rate-limit window math (mocked query), tokens, `subscribers.test.ts` (four upsert outcomes, mocked). Manual: run `rate-limit` once against the Neon `dev` branch to confirm the SQL.
8. Set `APP_PHASE=2` and `NEXT_PUBLIC_APP_PHASE=2` in Vercel (Production and Preview) and redeploy. This is the last step so no deploy between steps 1 and 7 fails the prebuild check.

Acceptance: contact submit creates a lead row with attribution, the owner receives the email and can hit Reply to answer the lead, the sender receives the auto-reply, the browser lands on `/thank-you` and fires `contact_submit` once; leaving Service on "Not sure" and Industry untouched submits successfully; a honeypot-filled, missing-`started_at`, or sub-3-second submission returns the same 200 body and creates nothing; the sixth submission from one IP within an hour returns 429 and the form shows "Too many attempts. Try again later or email us at ..."; subscribing twice for the same service sends one email; subscribing for a second service sends that service's unlock email and appends `interests`; a fourth service on the same day still works (6/day bucket); an `unsubscribed` email that subscribes again is reactivated with `opt_in_count` incremented and receives a fresh unlock email; a `bounced` or `complained` email that subscribes gets the normal redirect but no row change, no Resend sync, and a `suppressed` log line; the unsubscribe link opens a confirm page whose URL no longer shows the token after load, and the button (and a one-click POST) flips the DB row and the Resend contact; SPF, DKIM, and DMARC pass in Gmail "Show original"; a preview deploy's unlock email goes to `delivered@resend.dev` and links to the preview URL; no form field value appears in Vercel logs. Done = the owner has received a real lead notification and a real welcome email on their phone from the production domain, and mail-tester scores 9 or better.

### Phase 3: admin, quizzes, daily send, cron (target 1 to 2 weeks)
1. Generate `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `CRON_SECRET`; add them to Vercel and `.env.local`. Do NOT change `APP_PHASE` yet.
2. `lib/admin/auth.ts`, `proxy.ts`, `app/admin/(auth)/login`, `app/admin/(protected)/layout.tsx` with `requireAdmin()` and `maxDuration`, `X-Robots-Tag` header.
3. `/admin` dashboard with quota and unfinished-send banners; `/admin/quizzes` CRUD (`db.batch` writes, archive-as-remove, overdue badge, show-archived filter) with `QuizForm`, `lib/quiz/slug.ts`, and email preview; `content/quizzes.sample.json` and `scripts/seed-quizzes.ts` (local and `dev` branch only).
4. `/quiz/[slug]`, `Quiz.tsx` (token stripping), `POST /api/quiz/answer`.
5. `lib/dates.ts`, `lib/quiz/select.ts`, `lib/quiz/send.ts` (`sendDailyQuiz`, `runSendLoop`, `resumeSend`, permissive batch, per-recipient fallback if batch rejects headers), daily-quiz, no-quiz-alert, and quota-warning templates, `GET /api/cron/daily-quiz` with the `CRON_ENABLED` switch. `vercel.json` is NOT committed yet.
6. `/admin/leads` with status and "Add to newsletter list" (guide welcome); `/admin/subscribers` with the CSV export route; `POST /api/webhooks/resend` deployed (returns 503 until the secret exists), then registered in the Resend dashboard for `email.bounced` and `email.complained`, then `RESEND_WEBHOOK_SECRET` set. Now set `APP_PHASE=3` and `NEXT_PUBLIC_APP_PHASE=3` (this flips the unlock email and `/learn` line to "starting tomorrow") and redeploy.
7. Vitest: `quiz-select`, `quiz-send` (mocked db and Resend: conflict path, resume path, thrown chunk, permissive errors, time budget, counts), `auth.test.ts` (sign, verify, expiry, tamper, and `requireAdmin()` throwing when `cookies()` is mocked empty or tampered), `dates.test.ts`. Manual cron trigger via `curl -H "Authorization: Bearer $CRON_SECRET" https://<preview or prod>/api/cron/daily-quiz` with `CRON_ENABLED` unset (expect `cron_disabled`) and set.
8. Owner loads at least 14 `ready` quizzes through `/admin/quizzes/new`. Warm-up: for the first 14 days of the daily quiz the list is the owner plus a few friendly addresses (or the owner sets everyone else to `unsubscribed` temporarily); review bounces and complaints before opening it up.
9. Final step: commit `vercel.json`, set `CRON_ENABLED=true`, deploy. If `vercel.json` ships earlier by mistake, the route returns `cron_disabled` and nothing is sent; with an empty queue and `CRON_ENABLED=true`, expect a daily no-quiz alert until the queue is filled.

Acceptance: `/admin` without a cookie redirects to login, and `/admin/subscribers/export` without a cookie redirects too; a tampered cookie is rejected; the eleventh failed login in 15 minutes is rate limited; `auth.test.ts` proves `requireAdmin()` throws without a valid cookie, and a private window confirms `/admin/quizzes` redirects; a quiz with two correct options is rejected; "Send today's quiz now" with three test subscribers creates one `quiz_sends` row and three recipient rows with Resend ids, sets the quiz to `sent`, and a second click reports `already_sent_today`; per-row "Send this one now" after that shows the second-send confirmation; the cron endpoint without the bearer returns 401, with it and `CRON_ENABLED` unset returns `cron_disabled`, and with it after an admin send the same day returns `already_sent_today`; a quiz scheduled for yesterday and never sent is picked today; killing the send mid-way (mocked Resend throws on chunk 2) then calling `resumeSend` sends only the remaining recipients and marks none of them `skipped`; the quiz link with a token records exactly one answer, refuses a second, and the token disappears from the address bar; "Add to list" creates the subscriber, sends the guide welcome, and is idempotent; a Resend test bounce (`bounced@resend.dev`) and complaint (`complained@resend.dev`) set the subscriber status and exclude them from the next send; the daily quiz renders in Gmail web, Gmail iOS, Apple Mail, Outlook desktop, and Outlook web; a production cron run appears in the Vercel logs within the scheduled hour and the owner's own subscription receives the email. Done = seven consecutive days of one quiz per day with no duplicate and no missed day (checked in `/admin`), the 14-day warm-up review shows no complaints, and the owner can create next week's quizzes without the developer.

## 17. Owner setup guide

Do these in order. Keep every key in a password manager; never paste keys into chat or email. After every environment variable change in Vercel, redeploy (Deployments -> Redeploy) for it to take effect. If any vendor asks for a card, adding it does not start charges while you stay inside the free tier.

**A. GitHub and Vercel (Phase 1).** Create a private GitHub repo and give the developer access. At vercel.com sign up with GitHub, import the repo, accept defaults; the project's Node.js setting should read 24.x. Settings -> Environment Variables: paste values as the developer names them, choosing Production and Preview as the developer says (`NEXT_PUBLIC_SITE_URL` is Production only). Build and review on Hobby using the `*.vercel.app` link. Before the developer connects `ei-conversion.com`, upgrade the project to Pro (about $20/month, cancellable), because Hobby is for non-commercial use. Then Project -> Settings -> Domains -> add `ei-conversion.com` and `www`; Vercel shows an A record and a CNAME to add at your DNS (step B).

**B. DNS (Phase 1, then Phase 2).** Default: keep DNS at your domain registrar and add the Vercel and Resend records there. Recommended before real traffic: move DNS to Cloudflare (free). At cloudflare.com, "Add a site", enter `ei-conversion.com`, pick Free, and change the nameservers at your registrar to the two Cloudflare gives you. This is required for the `media.ei-conversion.com` video domain and enables free Email Routing (step D), and it puts Vercel, Resend, and R2 records in one place. Set the Vercel records to "DNS only" (grey cloud). If you keep registrar DNS, videos use the `r2.dev` URL, which works but is rate limited.

**C. Neon database (Phase 2).** In the Vercel project: Storage -> Create Database -> Neon -> Free plan -> Postgres version 18 -> connect to the project. `DATABASE_URL` and `DATABASE_URL_UNPOOLED` are added automatically, and preview deployments get their own database branch. Whether a card is requested for the free plan: verify at signup. The developer creates the `dev` branch.

**D. Resend (end of Phase 1 or first day of Phase 2, so DNS can propagate).** Sign up at resend.com with your email. Domains -> Add Domain -> `ei-conversion.com`, region US. Copy each DNS record it shows exactly (at the registrar or Cloudflare), then click Verify (minutes to an hour). Add the DMARC record from section 10 yourself; Resend does not require it but inboxes do. API Keys -> Create -> "Full access" -> paste once into Vercel as `RESEND_API_KEY`. Segments (Resend's dashboard may still say Audiences in places) -> create "Newsletter" -> copy its id into `RESEND_SEGMENT_ID`. Put your real inbox in `OWNER_EMAIL`. Have the developer generate `IP_HASH_SALT` (`openssl rand -base64 32`) and add it now. Give the developer your mailing address and the reply window you promise. Give `hello@ei-conversion.com` a real inbox: with DNS on Cloudflare, Email Routing forwards it to your Gmail for free; otherwise use your registrar's email forwarding or a Google Workspace mailbox. Replies and DMARC reports need somewhere to land. When `/admin` shows the quota banner, go to Resend Billing and pick Pro.

**E. Cloudflare R2 (whenever the first video is ready; not needed for Phase 1 placeholders).** Cloudflare dashboard -> R2 -> Create bucket `ei-conversion-media`. R2 may ask for a card on file even at $0: verify at signup. Bucket -> Settings -> Public access: with DNS on Cloudflare, add the custom domain `media.ei-conversion.com`; otherwise enable the `r2.dev` subdomain for now. Give the developer the base URL for `NEXT_PUBLIC_MEDIA_BASE_URL`. Upload files by drag and drop using the exact keys in section 14; the developer flips the slot to `ready: true`.

**F. Admin secrets (Phase 3).** Generate `ADMIN_PASSWORD` (20+ characters, what you type to log in), `ADMIN_SESSION_SECRET`, and `CRON_SECRET` (32+ random characters, never typed anywhere) with your password manager and add them in Vercel. After the developer deploys the webhook route: in Resend -> Webhooks, add `https://ei-conversion.com/api/webhooks/resend` for `email.bounced` and `email.complained` and paste the signing secret as `RESEND_WEBHOOK_SECRET`. The developer sets `APP_PHASE` and `CRON_ENABLED` at the right steps; you do not need to touch them.

**G. Later.** Turnstile: Cloudflare dashboard -> Turnstile -> Add site -> `ei-conversion.com`, managed mode -> site key to `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, secret to `TURNSTILE_SECRET_KEY`. Meta Pixel: business.facebook.com -> Events Manager -> Connect data sources -> Web -> copy the Pixel ID into `NEXT_PUBLIC_META_PIXEL_ID`; update the privacy page first. GA4: analytics.google.com -> Admin -> Create property -> Web stream -> copy `G-XXXX` into `NEXT_PUBLIC_GA4_MEASUREMENT_ID`. Redeploy after each.

## 18. Testing and QA

**Unit (Vitest), run by `.github/workflows/ci.yml` on pull requests (`npm ci`, `npm run lint`, `npm test`, `npm run build` with `APP_PHASE=1`; no database secret in CI).** `content.test.ts` (structure rules, claims regexes, bracket regex under `CONTENT_STRICT=1`); `validation.test.ts` (schemas accept and reject, empty-string selects, honeypot value parses, missing and early `started_at`); `rate-limit.test.ts` (window reset math with a mocked query); `subscribers.test.ts` (upsert outcomes: inserted, appended, reactivated with `opt_in_count`, suppressed); `dates.test.ts` (`todayInTimezone` at 23:30 and 00:30 across DST); `auth.test.ts` (sign, verify, expiry, tamper, `requireAdmin()` with mocked `cookies()`); `quiz-select.test.ts` (scheduled beats queue; overdue picked; sent, archived, and in-progress excluded; empty queue); `quiz-send.test.ts` (conflict path, thrown chunk marks claimed recipients and log rows failed, resume sends only pending and failed, permissive error indexes, time budget, counts) with `db` and `resend` mocked.

**Manual checklist per phase.** Every page at 360px, 768px, 1280px on iOS Safari and Android Chrome; keyboard-only run through nav, mobile menu, forms, and quiz; form error states readable; `?service=` and `?niche=` prefill; 404 for unknown niche or service; `view-source` shows metadata and JSON-LD; empty analytics vars load nothing; video click loads the MP4 only then (Network tab); OG preview in a Slack or iMessage unfurl; GA4 DebugView (once enabled) shows a `page_view` per client-side navigation.

**Performance budget.** Lighthouse mobile 90+ all categories; LCP under 2.5 s on 4G throttling; first-party JS under 120 KB gzipped on public pages (no client components on guide pages except `Button` tracking; forms, video, menu, and analytics are the only client components); posters under 120 KB; two font families, six weights total, `display: swap`; no third-party script unless an env var is set. Check with PageSpeed Insights after each phase deploy and `ANALYZE=true npm run build` (wired through `@next/bundle-analyzer` in `next.config.ts`) once per phase.

**Accessibility basics.** One `h1` per page; landmark regions and the skip link; labels on every input; errors linked with `aria-describedby` and `aria-live` on form status; visible focus rings (amber on navy, navy on off-white); amber buttons with navy text at 16px bold minimum; body slate on off-white is well above 7:1; the play control is a real button with a text label; quiz options are radios in a fieldset; honeypot hidden from assistive tech; `prefers-reduced-motion` respected (no animation is used anyway).

**Email deliverability steps, Phase 2 acceptance (unlock and auto-reply templates).** 1) After DNS verification run `npm run email:test -- you@gmail.com` and repeat for an Outlook.com and an iCloud address; inbox or Promotions is fine, Spam is not. 2) In Gmail "Show original" confirm `SPF: PASS`, `DKIM: PASS`, `DMARC: PASS`. 3) Send to a mail-tester.com address; require 9/10 or better. 4) Confirm Gmail shows its "Unsubscribe" link next to the sender on the unlock email (List-Unsubscribe headers). 5) Confirm `Reply-To` lands in the owner inbox.

**Email deliverability steps, Phase 3 acceptance (daily quiz).** 6) Check the daily quiz renders in Gmail web, Gmail iOS, Apple Mail, Outlook desktop, and Outlook web. 7) Confirm the one-click unsubscribe works from Gmail's link on a quiz email. 8) After the first 14 days of quiz warm-up review DMARC reports and Resend's bounce and complaint numbers; if clean, move DMARC to `p=quarantine`; complaints above about 0.1 percent mean the subject line or frequency must change.

## 19. Risks, tradeoffs, and open questions for the owner

| Risk or tradeoff | Note and mitigation |
|---|---|
| Resend 100/day cap | Per-recipient sends consume the transactional quota; the quiz fails past the cap for the rest of the UTC day. Banner at 70 active subscribers; upgrade to Pro before 80. Broadcasts would avoid it at the cost of per-recipient records (Future work). |
| Vercel Pro from day one of the live domain | About $20/month is the honest baseline cost from the moment `ei-conversion.com` points at the site (Phase 1 step 11); Neon, Resend, and R2 stay free for a long time. |
| Deliverability of a brand-new daily sender | Transactional mail warms the domain in Phase 2; the daily quiz starts with a 14-day owner-plus-friends list in Phase 3; DMARC `p=none` then `quarantine`; one-click unsubscribe; bounce and complaint webhook; short plain emails. |
| Daily email fatigue | A daily email is a bold cadence for business owners. Watch unsubscribes and the 0.1 percent complaint threshold in the first month; switch the cron to weekdays (`0 13 * * 1-5`) with no code change. |
| The owner has not run ads yet | The Meta Ads and Google Ads pages must not claim results or a track record. The `honestLine` is mandatory and describes the test-budget method; it is not a disclosure of inexperience. The site may read as established; it may not invent proof. |
| r2.dev while DNS stays at the registrar | Rate limited and not for production per Cloudflare. Fine for placeholders; move DNS to Cloudflare and attach `media.ei-conversion.com` before the first campaign. |
| Mailbox for hello@ | Replies use `Reply-To`, but some recipients reply to the From address. Give `hello@` a real forwarding inbox (section 17 D). |
| Cron timing | Hobby-style crons fire within the hour even on Pro unless the schedule is minute-precise; DST shifts the local hour twice a year. Documented and accepted. |
| Unfinished sends | A timed-out or crashed send stays `in_progress`; the next cron resumes it and `/admin` shows a banner with Resume. On Hobby-style once-a-day crons, that resume can be a day late unless the owner clicks. |
| Cron-vs-admin race for different quizzes | Only the explicit per-row "Send this one now" can send a second quiz on a day, after a confirmation. Same quiz twice on a day is impossible by unique index; same quiz to the same person twice is impossible by `email_log`. |
| Rate limiting in Postgres | Honest but not a bot wall; honeypot and timing gate carry most of the load; Turnstile is the planned upgrade. |
| Single shared admin password | Fine for one operator; no audit trail. Rotate on suspicion; add real users only if someone else needs access. |
| Tokens in email links | Anyone with a quiz link can answer as that subscriber; the token grants nothing else, and unsubscribe uses a separate token. Both pages strip `?t=` from the URL on load and analytics drops it from `page_location`, so tokens never reach Google, Meta, or browser history. Mail forwarding still exposes them to whoever receives the forward; accepted. |
| Gated video is not really gated | `/learn/[service]` is reachable by URL; `noindex` and no nav links. A hard gate adds friction for near-zero benefit. |
| Reactivation policy | Unsubscribed people who type their email again are reactivated (explicit opt-in). Bounced and complained addresses are never auto-reactivated; only the owner can, from `/admin/subscribers`. |
| No consent banner at launch | A stance, not a legal opinion; valid only while the audience stays US-only and nothing loads without an env var. |
| Content load on the owner | Every bracket must be filled before the domain goes live (the production build refuses otherwise), plus nine videos over time, the privacy text, a real mailing address, and at least 14 quizzes before cron is enabled. The site can launch without videos, but the funnel is weaker without the home VSL. |

Open questions for the owner: timezone and preferred local send hour; daily or weekday-only; reply-window promise; service area; pricing stance per service; mailing address for email footers; legal entity name and location; which mailbox receives replies and which existing address the Phase 1 mailto should use; move DNS to Cloudflare now or later; whether the ads services launch with the test-budget framing or as full offerings; whether any EU or UK clients are in scope.

## 20. Future work

- **Rename to E2 Results.** Change `config/site.ts` (name, wordmark "E2", tagline, domain, from and contact addresses), swap `src/app/icon.svg` and `src/app/opengraph-image.tsx`, add the new domain in Vercel with a permanent redirect from the old one in `next.config.ts` `redirects()`, verify the new domain in Resend (the free tier allows three), rename the R2 custom domain, and keep the old domain redirecting for a year. `RESEND_SEGMENT_ID` and the database do not change.
- **More niches.** Add `content/niches/hvac.ts`, `dental.ts`, `construction.ts` and register each with one import line in `niches/index.ts`; the picker, sitemap, static params, Home copy, footer, and the contact form's industry select pick them up. No database migration, because `leads.niche` is text.
- **Turnstile.** Keep the honeypot; add the widget to `ContactForm` and `EmailCapture` gated on `NEXT_PUBLIC_TURNSTILE_SITE_KEY`; verify server-side in both routes.
- **Resend webhook reconciliation.** Handle `contact.updated` so dashboard Broadcast unsubscribes sync back to `subscribers.status`.
- **Broadcast-based quiz.** If the list grows past what Resend Pro justifies, move the daily quiz to a Broadcast against the Segment with `quiz_token` as a contact property; per-recipient records would then come from webhooks instead of `quiz_send_recipients`.
- **Drip automations.** A `sequences` table keyed by service with day offsets (day 0 video, day 2 common mistake, day 5 fit-call invite), driven by the same daily cron and `email_log` keys `drip:{subscriberId}:{step}`.
- **A real case study.** Once the first client agrees in writing, add `content/case-studies.ts` and `/work/[slug]` with client-approved numbers, dates, and context, and relax the claims regex for that file only. Until then the section does not exist, on purpose.
- **Quiz insights.** Per-quiz correct rate trends on `/admin/quizzes`, CSV import of a quiz bank through the admin, an optional monthly streak email.
- **New-subscriber timing.** Exclude subscribers created after the owner-local midnight from that day's send if "within a day" ever feels wrong; one `WHERE` clause.
- **Playwright smoke tests** for the two funnel paths (guide to contact; service to subscribe to learn) once the site is stable.
- **Consent banner** when EU or UK traffic matters or on legal advice; `Analytics.tsx` already reserves the boolean.
- **Second admin user and audit log** if the business hires help.
