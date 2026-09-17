# Ei Conversion

Marketing site for a solo operator selling Website, Meta Ads, Local SEO, and
Google Ads to local service businesses. Next.js App Router, TypeScript,
Tailwind 4, hosted on Vercel.

The full build plan lives in `docs/IMPLEMENTATION_PLAN.md`. This file is the
quick start.

## Quick start

```bash
nvm use            # Node 24 (see .nvmrc)
npm install
cp .env.example .env.local
npm run dev        # http://localhost:3000
```

Scripts:

| Script | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | `prebuild` runs `scripts/check-env.ts`, then `next build` |
| `npm run lint` | ESLint (Next 16 no longer lints during build) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest. Set `CONTENT_STRICT=1` to also fail on bracket placeholders |
| `npm run analyze` | Bundle report |

## Phases

`APP_PHASE` and `NEXT_PUBLIC_APP_PHASE` (must match) gate what is live:

- **1**: static site. Contact page uses a mailto link; deep-dive band links straight to `/learn/[service]`.
- **2**: contact form, email capture, database, welcome and notification emails.
- **3**: admin, quizzes, daily send, cron.

## Content

Everything the owner edits is under `src/content/` and `src/config/site.ts`.
Anything in `[BRACKETS]` is a placeholder. A production build refuses to ship
while any remain. Adding a niche = copy `src/content/niches/plumbing.ts`, edit
it, add one import line and one key in `src/content/niches/index.ts`.

Renaming the brand = edit `src/config/site.ts` and swap `src/app/icon.svg`.

## Video

Videos are self-hosted MP4s on Cloudflare R2, registered in
`src/content/videos.ts`. Encode with:

```bash
ffmpeg -i in.mov -vf "scale=1280:720" -c:v libx264 -profile:v high -preset slow -crf 23 \
  -maxrate 2500k -bufsize 5000k -pix_fmt yuv420p -r 30 -c:a aac -b:a 128k -movflags +faststart out.mp4
ffmpeg -ss 00:00:03 -i out.mp4 -frames:v 1 -q:v 3 poster.jpg
```

Upload with `Cache-Control: public, max-age=31536000, immutable`, set
`NEXT_PUBLIC_MEDIA_BASE_URL`, and flip the slot to `ready: true`.

## Cron and timezones (Phase 3)

Vercel cron runs in UTC. `0 13 * * *` is 9:00 Eastern in summer and 8:00 in
winter; the one-hour DST drift is accepted. Weekdays only: `0 13 * * 1-5`.
