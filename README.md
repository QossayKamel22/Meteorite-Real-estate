# Meteorite Real Estate

Premium, Apple-inspired redesign of the Meteorite Real Estate website — a RERA-certified Dubai property brokerage since 2005.

Built with Next.js (App Router), TypeScript and Tailwind CSS v4.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verified content

All company facts (contact details, statistics, testimonials, credentials, CEO profile) live in [`src/lib/content.ts`](src/lib/content.ts) and were sourced directly from the live site at meteoriterealestate.com. Do not add or change facts there without a verified source.

## Known gaps requiring backend work

- **Authentication** — `/login` and `/register` are fully built UI (validation, password visibility, guest mode) but not wired to a real auth provider. No backend is configured, so sign-in intentionally shows a "not connected" notice rather than faking success. Wire up Supabase Auth, NextAuth with a database adapter, or similar.
- **Native property listings** — the live site's listing data isn't exposed in a scrapable, structured form (no prices/specs found in static HTML). Property browsing links out to the company's verified Bayut portfolio instead of displaying fabricated cards.
- **Favorites** — stored in `localStorage` only (per-device, not synced), and needs real property IDs once native listings exist.
- **Media, Payment, Add Property pages** — link out to the original WordPress pages/contact channels since their original content couldn't be verified or migrated.

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — ESLint
