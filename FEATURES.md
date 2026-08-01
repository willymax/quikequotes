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
- ✅ Trade-specific starter templates seeded per trade (painting, pressure washing, cleaning, HVAC, landscaping, fumigation, moving services) — `prisma/seed.ts`
- ✅ Good/Better/Best tiers created automatically on quote creation — `app/actions/quotes.ts` `createQuote()`
- ✅ Template line items auto-applied to tiers by `tierHint` on create — `createQuote()`
- ✅ Line item CRUD (add/edit/delete) with tier total recalculation — `app/(app)/quotes/[id]/edit/TierEditor.tsx` + `app/actions/quotes.ts` (`addLineItem`/`updateLineItem`/`deleteLineItem`/`recalcTierTotal`). `LineItem.quantity` (Prisma `Decimal`) is converted to a plain `number` in `edit/page.tsx` before being passed to the client `TierEditor` — Decimal instances aren't serializable across the Server→Client Component boundary and previously threw a dev-mode console error
- ✅ Tier description editing — `updateTierDescription()` action wired into `TierEditor.tsx`'s `TierDescriptionEditor` component
- ✅ Edit client/job details after creation — `app/(app)/quotes/[id]/edit/QuoteDetailsEditor.tsx`, collapsed `<details>` panel over the tier editor covering title, client name/phone/email, job address, `validUntil` and notes. Wired to `updateQuote()` in `app/actions/quotes.ts`, which now zod-validates its input, normalizes empty optionals to `null`, revalidates both `/quotes/[id]` and `/quotes/[id]/edit`, and returns `{ success }`/`{ error }`. `validUntil` is stored at **UTC** midnight (`new Date(\`${d}T00:00:00Z\`)`) so it round-trips back into `<input type="date">` via `toISOString().slice(0, 10)` without shifting a day
- ✅ Edit-page action bar — fixed bar above the app bottom nav with **Done — Review & Send** (→ `/quotes/[id]`) and **Preview as client** (→ `/q/[shareToken]`, new tab), closing the create→edit→send loop that previously dead-ended on the edit screen. No save button: every mutation on the page already persists immediately via server actions
- ✅ Quote-creation errors surfaced — `QuoteWizard.tsx` awaits `createQuote()` and renders its `{ error }` instead of `void`-discarding it (previously a zod failure looked like the button doing nothing). `createQuote`/`updateQuote` share one `quoteFields` schema and a `describeIssues()` helper that names the offending field ("Client email: must be a valid email address") instead of the opaque "Invalid form data". Inputs in both the wizard and the details editor carry matching `maxLength` caps so length overruns are blocked client-side; `clientPhone` raised 20 → 30 chars for international/formatted numbers
- ✅ Add / remove options — `deleteTier()` and `addTier()` in `app/actions/quotes.ts`, surfaced in `TierEditor.tsx` as a per-tier "Remove <label> option" button (behind `window.confirm`, hidden on the last remaining tier) and a "+ Add <label> option" row for whichever of Good/Better/Best is missing. `deleteTier` re-checks the last-tier guard server-side; line items cascade via the schema relation. Quotes still start with all three. `TierEditor`'s active tab falls back to `tiers[0]` when the selected option is deleted
- ✅ Number-input ergonomics — quantity uses `step="any"` (was `step="0.01"`, which made the browser spin/validate in hundredths for a field that's usually `1`); the edit form seeds price from `String(unitCents / 100)` rather than `.toFixed(2)` so an unpriced item reads `0`, not `0.00`; both numeric fields select-on-focus and carry `inputMode="decimal"`
- ✅ Photo upload — UploadThing integration (`app/api/uploadthing/core.ts`, `route.ts`, `lib/uploadthing.ts`), `addPhoto`/`deletePhoto` actions in `app/actions/photos.ts`, upload/delete UI in `app/(app)/quotes/[id]/edit/PhotoManager.tsx`. Public quote view already rendered the grid.
- ⬜ "3-minute" time-to-quote — no instrumentation/telemetry to confirm, and wizard still requires manual per-item entry after template load (no bulk quantity/price shortcuts)

## 3. Client-Facing Quote View

- ✅ Shareable public link via unique `shareToken` (cuid) — `prisma/schema.prisma` `Quote.shareToken`, route `app/q/[token]/page.tsx`
- ✅ Branding — business logo (or initial-letter fallback) and phone shown on client view — `app/q/[token]/page.tsx`
- ✅ Open tracking (two mechanisms):
  - Server-side on first page view — `app/q/[token]/page.tsx` (marks `VIEWED` when status is `SENT`)
  - Email pixel tracking — `app/api/track/open/route.ts`, embedded in `lib/email.ts` templates
- ✅ E-sign — canvas signature capture via `signature_pad`, stored as data URL — `app/q/[token]/sign/SignatureCapture.tsx`, `Quote.signatureDataUrl`
- ✅ Accept flow — per-tier "Accept This Option" → sign page → `acceptQuote()` action sets status `ACCEPTED`, records signer name/timestamp, cancels pending follow-ups — `app/actions/quotes.ts`
- ✅ Accepted option is visible after the fact — `Quote.acceptedTierId` was always persisted but never read. `app/q/[token]/page.tsx` now says "You accepted the **Better** option — $X" in the ACCEPTED banner, rings/badges that tier's card and dims the rest; `app/(app)/quotes/[id]/page.tsx` shows the same option + tax-inclusive amount to the owner
- ✅ Tax — `User.taxRatePercent` (Settings default) is snapshotted onto `Quote.taxRatePercent` at creation and overridable per quote in `QuoteDetailsEditor`, so changing the business rate never rewrites already-sent quotes. `lib/money.ts` holds `formatMoney()` (always 2dp — every page previously did `(cents/100).toLocaleString()`, which rendered 123450 as "$1,234.5") and `quoteTotals()`. Subtotal / Tax (X%) / Total render on the edit, detail, public and sign pages when the rate is above 0; a single total when it's 0. Both `taxRatePercent` columns are Prisma `Decimal`, so every page converts with `Number()` before crossing the Server→Client boundary
- ✅ Decline flow — `app/q/[token]/decline/route.ts` POST handler calls `declineQuote(token)`, 303-redirects back to `/q/[token]`
- ⬜ Quote expiration enforcement — `Quote.validUntil` and `QuoteStatus.EXPIRED` exist in the schema, but nothing sets `EXPIRED` automatically (no cron/cutoff check); `EXPIRED` UI states exist purely for a status that's never reached
- ✅ Copy-link button — `CopyLinkButton.tsx` client component, clipboard API + "Copied!" state

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

- ✅ Business profile form — business name, phone, trade type, logo URL, default tax rate — `app/(app)/settings/SettingsForm.tsx`, `app/actions/settings.ts`
- 🚧 Logo — stored/rendered as a plain URL string (`z.string().url()`), no file upload widget or image hosting integration; user must host their own logo somewhere else and paste a link
- ✅ Template listing (system defaults + user's own) with full-contents preview — `app/(app)/templates/page.tsx`, native `<details>`/`<summary>` disclosure per card, items grouped under Good/Better/Best headers, no truncation
- ✅ Seeded system templates per trade — `prisma/seed.ts`, 2 templates each for Painting, Pressure Washing, Cleaning, Fumigation, HVAC, Landscaping, Moving Services (14 total)
- ✅ Apply template to existing quote (backend) — `applyTemplate()` in `app/actions/templates.ts`
- ✅ Save quote as custom template (backend) — `createCustomTemplate()` in `app/actions/templates.ts`
- ✅ UI to trigger `applyTemplate` / `createCustomTemplate` — `TemplateToolbar` in `TierEditor.tsx` (apply gated by `window.confirm` since it replaces all line items; save-as-template via inline name form). Both this picker and the new-quote wizard's template step show templates across **all** trades (not just the user's own `tradeType`), each labeled with its trade, since `applyTemplate` never enforced a trade match — the prior filter was UI-only and blocked users from browsing/using templates outside their profile's single trade
- ⬜ Template editing/deletion UI — templates page is still read-only display (preview only, no mutation)

## 6. Dashboard & Quote List / Status Tracking

- ✅ Quote list with status badges, sorted newest-first, capped at 50 — `app/(app)/dashboard/page.tsx`. The "Up to $X" figure is the highest tier **including tax**, via `quoteTotals()`
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
- Per-quote discount (flat or %) applied before tax — deliberately deferred when tax shipped
- Terms & conditions: default text in Settings with a per-quote override, rendered above the signature on the client view — deferred alongside discount
- Currency is a hardcoded `$` in `lib/money.ts`; no per-business currency setting

---

## Dev environment note

Turbopack's dev route registry has twice dropped `/quotes/[id]/edit` after edits to
that route's files — the page 404s while `next build` compiles it fine, and
`.next/dev/server/app-paths-manifest.json` simply has no entry for it. The fix is
to clear the dev cache: `npm run dev:clean` (wipes `.next`, then `next dev`).
