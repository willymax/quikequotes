# FEATURES.md

Living roadmap for QuikeQuotes v1. Status reflects what's actually in the code, not the plan. Update this as modules move.

Legend: ✅ done · 🚧 partial / in-progress · ⬜ not started

---

## 1. Auth & Account

- ✅ Supabase email/password sign-up — `app/(auth)/sign-up/[[...sign-up]]/SignUpForm.tsx`, confirmation-email flow
- ✅ Supabase email/password sign-in — `app/(auth)/sign-in/[[...sign-in]]/SignInForm.tsx`
- ✅ Session refresh + route protection — `proxy.ts` (redirects unauthenticated users off `/dashboard`, `/quotes`, `/templates`, `/settings`; redirects authed users off auth pages)
- ✅ Auto-create `User` row on first login, forced onboarding to `/settings` until `businessName` set — `lib/auth.ts` `requireDbUser()`
- ✅ Sign out — `app/(app)/settings/SignOutButton.tsx`
- ⬜ Password reset / forgot-password flow — no route or form found
- ⬜ OAuth / social sign-in — not present
- ⬜ Email verification gate for protected routes — signup requires email confirmation via Supabase, but nothing in-app checks/blocks on unverified state beyond Supabase's own redirect

## 2. Quote Builder

- ✅ 3-step mobile wizard (client info → template → create) — `app/(app)/quotes/new/QuoteWizard.tsx`
- ✅ Trade-specific starter templates seeded per trade (painting, pressure washing, cleaning, HVAC, landscaping) — `prisma/seed.ts`
- ✅ Good/Better/Best tiers created automatically on quote creation — `app/actions/quotes.ts` `createQuote()`
- ✅ Template line items auto-applied to tiers by `tierHint` on create — `createQuote()`
- ✅ Line item CRUD (add/edit/delete) with tier total recalculation — `app/(app)/quotes/[id]/edit/TierEditor.tsx` + `app/actions/quotes.ts` (`addLineItem`/`updateLineItem`/`deleteLineItem`/`recalcTierTotal`)
- ✅ Tier description editing — `updateTierDescription()` action (no UI hook found yet for description field in `TierEditor.tsx` — action exists, editor doesn't expose it) — 🚧 more accurately partial, see note
- ⬜ **Photo upload** — `QuotePhoto` model exists in `prisma/schema.prisma` and the public quote view renders a photo grid (`app/q/[token]/page.tsx`), but there is no upload UI, no storage integration (no UploadThing/S3/Blob/Cloudinary in `package.json`), and no server action to create `QuotePhoto` rows. This is a core v1 loop item and is currently a dead end.
- ⬜ "3-minute" time-to-quote — no instrumentation/telemetry to confirm, and wizard still requires manual per-item entry after template load (no bulk quantity/price shortcuts)

Note on tier description: `updateTierDescription` is a real, wired server action, but `TierEditor.tsx` never calls it — treat as 🚧 backend-only.

## 3. Client-Facing Quote View

- ✅ Shareable public link via unique `shareToken` (cuid) — `prisma/schema.prisma` `Quote.shareToken`, route `app/q/[token]/page.tsx`
- ✅ Branding — business logo (or initial-letter fallback) and phone shown on client view — `app/q/[token]/page.tsx`
- ✅ Open tracking (two mechanisms):
  - Server-side on first page view — `app/q/[token]/page.tsx` (marks `VIEWED` when status is `SENT`)
  - Email pixel tracking — `app/api/track/open/route.ts`, embedded in `lib/email.ts` templates
- ✅ E-sign — canvas signature capture via `signature_pad`, stored as data URL — `app/q/[token]/sign/SignatureCapture.tsx`, `Quote.signatureDataUrl`
- ✅ Accept flow — per-tier "Accept This Option" → sign page → `acceptQuote()` action sets status `ACCEPTED`, records signer name/timestamp, cancels pending follow-ups — `app/actions/quotes.ts`
- 🚧 Decline flow — **broken**: the client view posts `<form action="/q/[token]/decline" method="POST">` (`app/q/[token]/page.tsx` line ~190) but no route handler exists at that path (only `page.tsx`, `sign/`, and `not-found.tsx` exist under `app/q/[token]/`). The `declineQuote(token)` server action is fully implemented in `app/actions/quotes.ts` but nothing calls it — this will 404 today.
- ⬜ Quote expiration enforcement — `Quote.validUntil` and `QuoteStatus.EXPIRED` exist in the schema, but nothing sets `EXPIRED` automatically (no cron/cutoff check); `EXPIRED` UI states exist purely for a status that's never reached
- ⬜ Copy-link button — present in UI (`app/(app)/quotes/[id]/page.tsx`) but wired to `onClick={undefined}` — visibly a stub, does nothing

## 4. Automated Follow-Up Engine

- ✅ Data model for scheduled follow-ups (`FollowUp`: day, channel, status, scheduledAt) — `prisma/schema.prisma`
- ✅ Day 1 / Day 3 / Day 7 scheduling on send — `lib/follow-ups.ts` `scheduleFollowUps()` (Day 1 = SMS, Day 3 = Email, Day 7 = SMS — note: spec says Day 7 is a "nudge," channel not specified as SMS vs email in CLAUDE.md; implementation picked SMS)
- ✅ Cron worker — `app/api/cron/follow-ups/route.ts`, bearer-secret protected, runs hourly via `vercel.json` (`0 * * * *`), processes due `PENDING` rows in batches of 50
- ✅ Stop-on-accept / stop-on-decline — `cancelPendingFollowUps()` called from `acceptQuote()` and `declineQuote()` (marks pending as `SKIPPED`)
- ✅ Skip-if-terminal safety check inside cron itself (belt-and-suspenders re-check at send time) — `app/api/cron/follow-ups/route.ts`
- ✅ Twilio SMS integration — `lib/sms.ts`, `twilio` in `package.json`
- ✅ Resend email integration — `lib/email.ts`, `resend` in `package.json`
- ✅ Failure handling — failed sends marked `FAILED` with error string, don't crash the batch (`Promise.allSettled`)
- ⬜ **Stop-on-reply** — CLAUDE.md explicitly requires follow-ups to stop "on reply or acceptance." No inbound webhook exists for either channel (no Twilio inbound SMS webhook, no Resend/email reply or bounce webhook — confirmed no `webhook` files anywhere in `app/`). Only accept/decline stop the cadence today; a client replying by text or email does nothing.
- ⬜ Day 7 email variant / Day 1 email variant — `lib/email.ts` only has a `DAY_3` template (falls back to it for any other day); `lib/sms.ts` only has `DAY_1`/`DAY_7` copy (falls back to `DAY_1`). Fine for current fixed cadence, but not built out per-day per-channel if cadence changes.
- ⬜ Initial "quote sent" notification is email-only — `sendQuote()` in `app/actions/quotes.ts` only emails on send if `clientEmail` present; no equivalent initial SMS if only phone is on file.

## 5. Settings & Templates

- ✅ Business profile form — business name, phone, trade type, logo URL — `app/(app)/settings/SettingsForm.tsx`, `app/actions/settings.ts`
- 🚧 Logo — stored/rendered as a plain URL string (`z.string().url()`), no file upload widget or image hosting integration; user must host their own logo somewhere else and paste a link
- ✅ Template listing (system defaults + user's own) — `app/(app)/templates/page.tsx`
- ✅ Seeded system templates per trade — `prisma/seed.ts` (Painting interior/exterior, Pressure Washing driveway, plus others — truncated read, more trades likely seeded)
- ✅ Apply template to existing quote (backend) — `applyTemplate()` in `app/actions/templates.ts`
- ✅ Save quote as custom template (backend) — `createCustomTemplate()` in `app/actions/templates.ts`
- ⬜ UI to trigger `applyTemplate` / `createCustomTemplate` — grepped entire `app/` tree, both functions are defined but never imported/called from any component. Template application currently only happens at quote-creation time via the wizard's step 2 picker (a separate code path in `createQuote()`); mid-edit template swap and "save as template" are backend-only stubs.
- ⬜ Template editing/deletion UI — templates page is read-only display

## 6. Dashboard & Quote List / Status Tracking

- ✅ Quote list with status badges, sorted newest-first, capped at 50 — `app/(app)/dashboard/page.tsx`
- ✅ Status enum covers full lifecycle: `DRAFT → SENT → VIEWED → ACCEPTED/DECLINED/EXPIRED` — `prisma/schema.prisma`
- ✅ Empty state / first-quote CTA — `app/(app)/dashboard/page.tsx`
- ✅ Per-quote detail page with tier breakdown, share link display, accepted-signature summary — `app/(app)/quotes/[id]/page.tsx`
- ✅ Mobile bottom nav (Quotes / New Quote / Settings) — `app/(app)/layout.tsx`
- ⬜ Filtering/search/sort on dashboard — list is a flat unfiltered feed
- ⬜ Pagination past 50 quotes — `take: 50` hard cap, no "load more"
- ⬜ Revenue/analytics rollups (e.g., total quoted, acceptance rate) — no aggregation queries anywhere

---

## Explicitly out of scope for v1

From `CLAUDE.md` — confirmed absent from the codebase, not planned for this phase:

- Deposit collection (no payments/Stripe integration anywhere)
- Missed-call text-back
- Review requests

## Ideas seen nowhere in code (future, not commitments)

- Password reset flow
- Team/multi-user accounts per business (schema is single-owner `User` → `Quote`; no org/team model)
- SMS/email inbound reply handling (needed to actually satisfy "stop on reply" — see Module 4)
- Quote expiration automation (cron to flip `SENT`/`VIEWED` → `EXPIRED` past `validUntil`)
- In-app photo storage/CDN integration
- Logo upload widget (vs. pasted URL)
- Analytics/reporting dashboard
- Client-side "ask a question" / reply-in-thread on the quote view
