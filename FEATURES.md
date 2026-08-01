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
- ✅ Template line items auto-applied to tiers by `tierHint` on create — `createQuote()`. Tier totals are now recalculated immediately after the insert: `createQuote()` created tiers at `totalCents: 0` and never wrote the column, so a quote built from a template rendered every option as **$0** on the edit page, detail page, client view and dashboard until the user edited any one line item and tripped `recalcTierTotal()` by hand. Every read path trusts the stored `QuoteTier.totalCents` rather than summing live, so anything writing line items must recalc. The helper now lives in `lib/tiers.ts` (it can't be exported from the `"use server"` actions file — every export there must be an async server action) and is shared by `createQuote`, the three line-item actions, and `applyTemplate`, which previously carried its own inline `reduce` — two implementations of one rule, one of them missing
- ✅ Line item CRUD (add/edit/delete) with tier total recalculation — `app/(app)/quotes/[id]/edit/TierEditor.tsx` + `app/actions/quotes.ts` (`addLineItem`/`updateLineItem`/`deleteLineItem`/`recalcTierTotal`). `LineItem.quantity` (Prisma `Decimal`) is converted to a plain `number` in `edit/page.tsx` before being passed to the client `TierEditor` — Decimal instances aren't serializable across the Server→Client Component boundary and previously threw a dev-mode console error
- ✅ Tier description editing — `updateTierDescription()` action wired into `TierEditor.tsx`'s `TierDescriptionEditor` component
- ✅ Edit client/job details after creation — `app/(app)/quotes/[id]/edit/QuoteDetailsEditor.tsx`, collapsed `<details>` panel over the tier editor covering title, client name/phone/email, job address, `validUntil` and notes. Wired to `updateQuote()` in `app/actions/quotes.ts`, which now zod-validates its input, normalizes empty optionals to `null`, revalidates both `/quotes/[id]` and `/quotes/[id]/edit`, and returns `{ success }`/`{ error }`. `validUntil` is stored at **UTC** midnight (`new Date(\`${d}T00:00:00Z\`)`) so it round-trips back into `<input type="date">` via `toISOString().slice(0, 10)` without shifting a day
- ✅ Edit-page action bar — fixed bar above the app bottom nav with **Done — Review & Send** (→ `/quotes/[id]`) and **Preview as client** (→ `/q/[shareToken]`, new tab), closing the create→edit→send loop that previously dead-ended on the edit screen. No save button: every mutation on the page already persists immediately via server actions
- ✅ Quote-creation errors surfaced — `QuoteWizard.tsx` awaits `createQuote()` and renders its `{ error }` instead of `void`-discarding it (previously a zod failure looked like the button doing nothing). `createQuote`/`updateQuote` share one `quoteFields` schema and a `describeIssues()` helper that names the offending field ("Client email: must be a valid email address") instead of the opaque "Invalid form data". Inputs in both the wizard and the details editor carry matching `maxLength` caps so length overruns are blocked client-side; `clientPhone` raised 20 → 30 chars for international/formatted numbers
- ✅ Add / remove options — `deleteTier()` and `addTier()` in `app/actions/quotes.ts`, surfaced in `TierEditor.tsx` as a per-tier "Remove <label> option" button (behind `window.confirm`, hidden on the last remaining tier) and a "+ Add <label> option" row for whichever of Good/Better/Best is missing. `deleteTier` re-checks the last-tier guard server-side; line items cascade via the schema relation. Quotes still start with all three. `TierEditor`'s active tab falls back to `tiers[0]` when the selected option is deleted
- ✅ Number-input ergonomics — quantity uses `step="any"` (was `step="0.01"`, which made the browser spin/validate in hundredths for a field that's usually `1`); the edit form seeds price from `String(unitCents / 100)` rather than `.toFixed(2)` so an unpriced item reads `0`, not `0.00`; both numeric fields select-on-focus and carry `inputMode="decimal"`
- ✅ Accepted/declined quotes are read-only — `lib/quote-lock.ts` (`LOCKED_STATUSES`, `isQuoteLocked`, `lockedMessage`). Enforced **server-side** in every mutation that touches a quote: `updateQuote`, `sendQuote`, `addTier`, `deleteTier`, `addLineItem`, `updateLineItem`, `deleteLineItem`, `updateTierDescription` (`app/actions/quotes.ts`), `applyTemplate` (`app/actions/templates.ts`) and `addPhoto`/`deletePhoto` (`app/actions/photos.ts`) — hiding the button is not a guard. `/quotes/[id]/edit` redirects to the detail page when locked and the detail page swaps the Edit/Send row for the reason. `EXPIRED` deliberately stays editable so a stale quote can be revived by extending `validUntil`. `sendQuote` needed the guard for a second reason: it writes `status: "SENT"` unconditionally, so a re-send would have silently downgraded an ACCEPTED quote
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
- ✅ Decline flow — `app/q/[token]/decline/route.ts` POST handler calls `declineQuote(token)`, 303-redirects back to `/q/[token]`. `declineQuote()` now carries the same `["SENT", "VIEWED"]` status gate `acceptQuote()` has; without it anyone holding the share link could flip an already-ACCEPTED quote to DECLINED
- ⬜ Quote expiration enforcement — `Quote.validUntil` and `QuoteStatus.EXPIRED` exist in the schema, but nothing sets `EXPIRED` automatically (no cron/cutoff check); `EXPIRED` UI states exist purely for a status that's never reached
- ✅ Copy-link button — `CopyLinkButton.tsx` client component, clipboard API + "Copied!" state. The URL itself is now an anchor opening `/q/[token]` in a new tab, not inert text; the copy handler is wrapped in `try/catch` with a "Copy failed" state (`navigator.clipboard` is `undefined` on a non-secure origin, which used to throw an unhandled rejection with no feedback) and clears its timeout on unmount. Still gated on `status !== "DRAFT"` — the draft link is reachable from the edit page's "Preview as client"

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
- ✅ UI to trigger `applyTemplate` / `createCustomTemplate` — `TemplateToolbar` in `TierEditor.tsx` (apply gated by `window.confirm` since it replaces all line items; save-as-template via inline name form)
- ✅ Trade-type filtering with an escape hatch — all three template lists (wizard step 2, edit-page picker, `/templates`) default to the trade set in Settings and expose an **All trades** chip. Templates the user saved themselves always show regardless of trade — they built them deliberately, and a painter who also pressure-washes shouldn't lose their own work to one profile field. Rule lives in `lib/trades.ts` `matchesTrade()`; `TRADE_LABELS` moved there too (it was copy-pasted verbatim in three files). The shared scope query is `lib/templates.ts` `templateScope()`/`TEMPLATE_ORDER`. Both client consumers filter in-memory via `app/components/TradeFilterChips.tsx` (the full list is already on the page, so toggling costs no round-trip); `/templates` is a server component so its chips are `<Link>`s driving `?trades=all`, which survives a reload. `applyTemplate` still enforces no trade match server-side — the filter is a default, not a permission
- ⬜ Template editing/deletion UI — templates page is still read-only display (preview only, no mutation)
- ⬜ `/templates` is unreachable from the app chrome — the bottom nav has only Quotes / New Quote / Settings, so the page exists but can only be reached by typing the URL. `createCustomTemplate` also skips zod validation on `name` (client `required` attribute only)

## 6. Dashboard & Quote List / Status Tracking

- ✅ Quote list with status badges — `app/(app)/dashboard/page.tsx`. The "Up to $X" figure is the highest tier **including tax**, via `quoteTotals()`
- ✅ Status enum covers full lifecycle: `DRAFT → SENT → VIEWED → ACCEPTED/DECLINED/EXPIRED` — `prisma/schema.prisma`
- ✅ Empty state / first-quote CTA — `app/(app)/dashboard/page.tsx`
- ✅ Per-quote detail page with tier breakdown, share link display, accepted-signature summary — `app/(app)/quotes/[id]/page.tsx`
- ✅ Mobile bottom nav (Quotes / New Quote / Settings) — `app/(app)/layout.tsx`
- ✅ Status tabs — **All · Drafts · Sent · Accepted · Closed**, each chip carrying its count. `Sent` folds `SENT`+`VIEWED` (a viewed quote is still an open opportunity) and `Closed` folds `DECLINED`+`EXPIRED`, so five chips cover six statuses. Horizontally scrollable; unknown `?tab=` slug falls back to All
- ✅ Search + sort — `?q=` matches title or client name (`contains`, `mode: "insensitive"`); `?sort=newest|oldest|client`. Both live in a plain `method="get"` form with the active tab as a hidden field, so the whole dashboard stays SSR — no client component, no client state, and every view is a shareable URL. Sorting by amount is deliberately absent: the amount lives on `QuoteTier.totalCents` with the rate on `Quote`, so it isn't expressible in the query and would force sorting the whole table in memory
- ✅ Pagination — `?limit=` (default 20, clamped 20–200), queried as `take: limit + 1` so the extra row is what decides whether to render "Load more"; the link carries the current tab/q/sort. Replaces the old hard `take: 50` cap
- ✅ Rollups — Open (sum of the highest tier, tax-inc, across `SENT`+`VIEWED`), Won (sum of the *accepted* tier's tax-inc total — `acceptedTierId` is finally load-bearing, not just display) and acceptance rate (`accepted / (accepted + declined + expired)`, shown as `—` rather than a misleading 0% when nothing has been decided). One scoped `findMany` feeds both the rollups and the tab counts. The sums run in JS because the amount lives on the tier and the rate on the quote — no SQL `SUM` available. That's a full scan of one operator's quotes per dashboard load; denormalising a total onto `Quote` isn't worth it at v1 volume
- ✅ Distinct empty states — "no quotes at all" (first-quote CTA) vs. "nothing in this tab / no search matches" (offers Clear filters)

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
