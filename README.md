# Standout Studio

<p align="center">
  <img src="docs/readme-banner.png" alt="Standout Studio hero: Own the first impression." width="100%" />
</p>

Marketing site for Standout Studio, a bilingual web studio in Ottawa.

- Live site: [standoutstudio.ca](https://standoutstudio.ca)
- Design source: [Figma mockup](https://www.figma.com/design/nLEk8UpVUfFg1SsvmXmjnG)

## Stack

- [Next.js 16](https://nextjs.org) (App Router) and React 19
- [GSAP](https://gsap.com) with ScrollTrigger for motion, [Lenis](https://lenis.darkroom.engineering) for smooth scroll
- Plain CSS (`src/app/globals.css`), Archivo through `next/font`
- [Web3Forms](https://web3forms.com) for the contact form, [PostHog](https://posthog.com) for analytics
- Hosted on Vercel

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy `.env.example` to `.env.local` and fill in:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (defaults to `https://standoutstudio.ca`) |
| `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` | Contact form delivery. Create a key with `standout.studio.ottawa@gmail.com` as the destination. The key is public by design (client-side submit). Without it, the form falls back to the visitor's mail app. |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | PostHog project token (client-safe). Analytics are off when it is empty. |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog API host, usually `https://us.i.posthog.com` (or `https://eu.i.posthog.com` for EU). |

On Vercel, add the same variables in Project Settings, Environment Variables.

## Scripts

| Command         | Purpose           |
| --------------- | ----------------- |
| `npm run dev`   | Local development |
| `npm run build` | Production build  |
| `npm run start` | Serve production  |
| `npm run lint`  | ESLint            |
| `npm test`      | Business rules of the client and admin areas |
| `node scripts/e2e-portal.mjs` | Browser walk through both areas in demo mode (server running on :3177) |

## How it works

The whole site is **one persistent client app** mounted in the root layout. It owns the
page transitions (loader, iris between pages, menu, Work to case study), so it never
unmounts. It is still rendered on the server from the URL, so every page ships real HTML
in the right language.

The Next.js routes only declare which URLs exist and their metadata:

- `src/app/[[...slug]]` serves English at the root.
- `src/app/fr/[[...slug]]` serves French under `/fr`.
- `src/lib/seo.ts` holds titles, descriptions, canonical and hreflang tags, and the list of
  known paths (used by the sitemap and to answer 404 on anything else).

Inside the app, `src/site/router.js` handles navigation with `history.pushState`:

| Page | English | French |
| --- | --- | --- |
| Home | `/` | `/fr` |
| Work | `/work` | `/fr/work` |
| Case study | `/work/:slug` | `/fr/work/:slug` |
| Services | `/services` | `/fr/services` |
| About | `/about` | `/fr/about` |
| Contact | `/contact` | `/fr/contact` |
| Digital card | `/card` | `/fr/card` |

Old prototype anchors (`#realisations`, `#work-caramello-cafe`...) still land on the right page.

### Client area and admin area

Real server pages, outside the single app (`SiteRoot` renders nothing on these paths):

| Area | English | French |
| --- | --- | --- |
| Client dashboard | `/client` | `/fr/client` |
| Sign-in (clients and studio) | `/client/login` | `/fr/client/login` |
| Admin (French only) | `/admin` | |

- **Sign-in** is by emailed link, no password. Accounts exist only by invitation from the
  admin. Addresses in `ADMIN_EMAILS` become admins on first sign-in.
- **Backends.** With the Supabase variables set, data lives in Supabase
  (`supabase/migrations/`). Without them, **demo mode** runs on an in-memory store with
  fictional data, shows emails in `/admin/emails` and simulates payments. Demo mode is
  refused in production unless `PORTAL_DEMO=1`.
- **One place for the rules:** `src/lib/portal/service.ts` (who can do what, revision
  counter, invoices, reminders, emails). Both backends use it; `npm test` covers it.
- **Security:** client reads go through Postgres row-level security; every write goes
  through the server after the rules check access. Internal notes live in an admin-only
  table.
- **Links between the three parts:** the contact form files a prospect (`/api/leads`),
  events send emails (`src/lib/portal/emails.ts`), Stripe confirms payments
  (`/api/stripe/webhook`), and a daily cron sends reminders (`/api/cron/reminders`).
- Design and decisions: `docs/superpowers/specs/2026-11-20-espace-client-design.md`.
  Going live: `docs/espace-client-mise-en-ligne.md`.

## Project structure

```
src/
  app/                  Next.js routes, metadata, sitemap, robots, icons, share images
    globals.css         All site styles and design tokens
  lib/                  Site config (site.ts), SEO (seo.ts), share image (og.tsx)
  lib/portal/           Client and admin areas: rules, storage, sign-in, emails, Stripe
  components/portal/    Client and admin screens
  app/portal.css        Client and admin styles
  components/seo/       JSON-LD
  proxy.ts              Locale header for <html lang>; refreshes Supabase sessions
  instrumentation-client.ts  PostHog setup
  site/
    SiteRoot.jsx        Entry point: language and the app
    App.jsx             Header, menu, loader, page transitions, smooth scroll
    router.js           URLs and in-app navigation
    i18n.jsx            All French and English copy
    projects.js         Client projects shown on Work and in case studies
    features.js         Feature flags
    motion.js           Shared easing and reveal helpers
    pages/              One file per page, plus shared pieces (Footer, DotEnd...)
    rb/                 Adapted React Bits effects (see LICENSE-react-bits.md)
public/work/<slug>/     Screenshots of each client site (see below)
supabase/migrations/    Database tables and row-level security
tests/                  npm test
scripts/                capture-work.mjs takes those screenshots
```

## Common edits

- **Copy (FR and EN):** `src/site/i18n.jsx`. Page titles and descriptions for search engines
  live in `src/lib/seo.ts`.
- **Prices:** the packages in `src/site/i18n.jsx`, plus the starting price in `src/lib/seo.ts`
  and the share images (`src/app/opengraph-image.tsx`, `src/app/fr/opengraph-image.tsx`).
- **Add a project:** add an entry to `PROJECTS` in `src/site/projects.js` (and its URL to
  `scripts/capture-work.mjs`), then capture it. Its case study page, sitemap entry and
  metadata follow automatically. On Work, projects alternate sides in the same layout.

## Client site screenshots

Each project has three captures in `public/work/<slug>/`:

| File | What it is | Where it shows |
| --- | --- | --- |
| `desktop.webp` | First screen, 1440 x 900 at 2x | Work, case study header, next project |
| `page.webp` | Whole home page, 1440 wide | Scrollable browser window in the case study, home showcase |
| `mobile.webp` | Whole home page, 390 wide at 2x | Scrollable phone in the case study, case study header on phones |

Refresh them after a client site changes (all projects, or one slug):

```bash
node scripts/capture-work.mjs
```

```bash
node scripts/capture-work.mjs caramello-cafe
```

Long pages are cut at 8000 px. If Playwright's own browser is not installed, point
`PW_CHROMIUM` at a Chromium binary.

## Design tokens

| Token | Value |
| --- | --- |
| Brume (light surface) | `#F3F5F4` |
| Pierre (soft panels) | `#E3E8E6` |
| Sarcelle (brand teal) | `#0F6B66` |
| Abysse (ink, dark surface) | `#0C2624` |
| Font | Archivo (variable width) |

The brand signature is the teal dot that ends headlines; the loader and page transitions
open from and close onto it. Motion respects `prefers-reduced-motion`.

## Collaboration

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

See [LICENSE](./LICENSE). Proprietary. All rights reserved.
