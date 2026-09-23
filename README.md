# Campbell River Little Library Map

A playful map of every free little library in Campbell River, BC. Browse without an account; sign in with a magic link to log visits, earn badges, upload photos, and suggest new libraries.

**Stack:** Next.js 16 (App Router) · Tailwind CSS v4 · Supabase (Postgres, Auth, Storage) · Google Maps JS API · Vercel

## Setup

1. **Install:** `npm install`
2. **Supabase project:** create one at [supabase.com](https://supabase.com), then apply the schema:
   - either paste `supabase/migrations/20260921000000_init.sql` into the SQL editor and run it,
   - or with the CLI: `supabase link --project-ref <ref> && supabase db push`
3. **Auth settings** (Supabase → Authentication → URL Configuration):
   - Site URL: `http://localhost:3000` (your production domain later)
   - Redirect URLs: `http://localhost:3000/auth/callback`, `https://YOUR-DOMAIN/auth/callback`
4. **Google Maps key:** enable the *Maps JavaScript API* in Google Cloud, create a key, and restrict it to HTTP referrers (`localhost:3000/*`, `YOUR-DOMAIN/*`).
5. **Env:** `cp .env.example .env.local` and fill in the values.
6. **Optional bulk-load:** add locations to `scripts/seed.ts`, then `npm run seed` (`npm run seed -- --reset` wipes the table first). Otherwise add libraries through the `/submit` form.
7. `npm run dev` → http://localhost:3000

### Make yourself an admin

Sign in once, then run in the Supabase SQL editor:

```sql
update profiles set is_admin = true
where id = (select id from auth.users where email = 'you@example.com');
```

Then go to `/admin/moderate` (it isn't linked in the nav — bookmark it).

## How it works

| Route | What it does |
| --- | --- |
| `/` | Hero, map preview, badges |
| `/map` | Full storybook-styled map, progress bar, library cards |
| `/library/[id]` | Details, photo gallery, "I visited!", directions |
| `/submit` | Suggest a library (pin picker + icon choice) → pending |
| `/upload/[libraryId]` | Photo upload → pending |
| `/profile` | Progress, badges, visited list, your photos |
| `/libraries` | Plain list of every library, grouped by neighbourhood (SEO + screen readers) |
| `/leaderboard` | Top explorers |
| `/admin/moderate` | Approve/reject library submissions, remove live photos (admins only) |

- **Moderation:** new libraries are inserted as `pending` and hidden by row-level security until approved. Photos publish immediately; removing one from `/admin/moderate` marks it `rejected` and deletes its files from storage.
- **Abuse limits:** 3 library submissions per user per day, 10 photos per hour, and the storage bucket caps uploads at 10 MB and image types only.
- **Photos:** stored in the private `library-photos` bucket. Each upload is downscaled in the browser, then re-encoded on the server with `sharp`: a 1200px WebP for display and a 2400px JPEG original. Re-encoding also strips EXIF data, including GPS. Pages display them through short-lived signed URLs.
- **Visits and badges:** anonymous visits live in `localStorage` and move onto the account after sign-in (`VisitSync`). Badges are awarded by Postgres triggers (`award_badges`), so clients can't grant themselves badges. A new badge shows a toast and confetti.
- **Map style:** `src/lib/map-style.ts` holds the JSON style. Swap in any Snazzy Maps preset. Marker illustrations are inline SVGs in `src/lib/markers.ts`, and a new entry there appears automatically in the submit form.

## Moderation emails (optional)

Get an email the moment someone submits a library or photo, with Approve/Reject buttons in it.

1. **Resend:** install it from the Vercel Marketplace (`vercel integration add resend/resend-email`), which sets `RESEND_API_KEY`. Until you verify your own domain in Resend, mail can only be sent to your Resend account's email address.
2. **Env vars** (Vercel → Settings → Environment Variables, and `.env.local` for local runs):
   - `MODERATOR_EMAIL` — where alerts go
   - `RESEND_FROM` — sender, once your domain is verified
   - `NOTIFY_SECRET` — any long random string
   - `REVIEW_TOKEN_SECRET` — another long random string, signs the approve/reject links
3. **Supabase → Database → Webhooks → Create:** one for `libraries` and one for `photos`, both on **Insert**, method **POST**, URL `https://YOUR-DOMAIN/api/notify`, with the header `x-notify-secret: <NOTIFY_SECRET>`.

The email links open `/review?token=…`, which shows the submission with Approve and Reject buttons. Tokens are signed, name a single row, expire after 14 days, and only ever act on a still-pending row — so a re-clicked link can't undo a later decision. Because email scanners follow plain links, nothing is decided until the button on that page is pressed.

## Checks

```
npm test            # unit tests (review tokens, marker/house encoding)
npx tsc --noEmit    # types
npm run lint
npm run check:schema  # warns if src/lib/types.ts drifts from the database
```

CI runs everything except `check:schema` (which needs credentials) on every push and PR.

## Deploy (Vercel)

1. Push to GitHub and import the repo in Vercel, or run `vercel`.
2. Add the env vars from `.env.example`. Set `NEXT_PUBLIC_SITE_URL` to your production URL. `SUPABASE_SERVICE_ROLE_KEY` is only needed if you seed from CI; leave it out otherwise.
3. Add your custom domain under Project → Domains. Then add `https://YOUR-DOMAIN/auth/callback` to Supabase's redirect URLs and the domain to your Google Maps key's referrer list.
