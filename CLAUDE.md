# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md
@FEATURES.md

## Product

**QuikeQuotes** — mobile-first quoting + automated follow-up SaaS for home-service solopreneurs (painters, pressure washers, cleaners, HVAC, landscapers). $29–79/month.

Target user: 1–5 person operation, on a ladder all day, quoting from their phone in the driveway.

**Core loop (v1 only):**
1. 3-min quote from driveway — trade-specific templates, photo upload, good/better/best tiers
2. Client gets a shareable link — branded, open tracking, e-sign, Accept button
3. Automated follow-up — Day 1 SMS, Day 3 email, Day 7 nudge; stops on reply or acceptance

**Out of scope for v1:** deposit collection, missed-call text-back, review requests.

**Design constraint:** every flow must work fast on mobile. Complexity kills adoption for this user.

## Commands

```bash
npm run dev      # start dev server at localhost:3000
npm run build    # production build
npm run start    # serve production build
npm run lint     # ESLint 9 flat config (eslint.config.mjs)
```

No test runner is configured yet.

## Stack

- **Next.js 16** (App Router) — `app/` directory only; no `pages/`
- **React 19**
- **TypeScript 5** — strict mode
- **Tailwind CSS v4** — configured via `@tailwindcss/postcss` in `postcss.config.mjs`; v4 syntax differs from v3 (no `tailwind.config.js`, utility classes generated from CSS)
- **ESLint 9** — flat config (`eslint.config.mjs`); uses `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`

## Architecture

Single-route app at `app/page.tsx`. Entry point is `app/layout.tsx`, which loads Geist/Geist Mono fonts via `next/font/google` and sets CSS variables `--font-geist-sans` / `--font-geist-mono` consumed in `globals.css`.

Routing: add new routes as directories under `app/` with a `page.tsx`. Shared UI goes in `app/components/` (not yet created). Server Components are the default; mark client components with `"use client"`.

## Key Caveats

- **Tailwind v4** drops `tailwind.config.js`; configure theme via CSS `@theme` blocks in `globals.css`.
- **Next.js 16** APIs may differ from training data — always check `node_modules/next/dist/docs/` before writing Next.js-specific code.
- **Prisma 7** — `url`/`directUrl` no longer go in `schema.prisma`. They go in `prisma.config.ts`. `PrismaClient` requires a database adapter (`PrismaPg` from `@prisma/adapter-pg`). See `lib/db.ts`.
- **Proxy** — Next.js 16 renamed `middleware.ts` → `proxy.ts`; export function must be named `proxy`. Supabase session refresh lives here — use `getUser()` not `getSession()` per Supabase SSR docs.
- **Server Actions** — Actions used as `<form action={...}>` must return `void`. To surface errors, use `useTransition` + `startTransition` in a client component.
