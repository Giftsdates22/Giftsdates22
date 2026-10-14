# PRD — GiftsDates (imported)

## Original problem statement
"add exact website from Github saving all logins and texture" — https://github.com/GiftsDates21/GiftsDates21.git

## User choices
- Public repo; keep original login system; keep exact look, adapt to run here.

## Architecture
React (CRA/craco) + FastAPI (server.py, ~4.9k lines) + MongoDB. JWT email/password auth. Emergent LLM (translation/support chat), Stripe (test key), Emergent object storage.

## Implemented (2026-06)
- Repo copied as-is into /app; deps installed; backend .env given JWT_SECRET, EMERGENT_LLM_KEY, STRIPE_SECRET_KEY, ADMIN_EMAILS.
- Admin account created: giftsdates@gmail.com (see memory/test_credentials.md).
- Smoke test passed 100% backend + frontend.

- Stripe: Emergent claimable sandbox provisioned (acct_1UPpFf2ejuym8P5a, CA, test mode) and keys added to backend/.env. Coins, custom amounts, Premium/Lite (one-time, Stripe-managed tax) and VIP (subscription) checkout tested end-to-end (iteration_2: 100%).
- Availability v2 (2026-10): owners set a weekly schedule + specific days, each with multiple time ranges (overnight supported). Inviters pick any open day and any 15-min start time on a clock picker (plus 2.5h quick chips); backend validates the full 2.5h fits a range and avoids booked/buffer blocks. Fixed Profile save crash (empty relationship_intent / 422 toast). iteration_3 + manual verification.
- Copy weekly hours ("Copy to all days" per weekday) + Add to calendar dropdown (Google Calendar link; .ics with 1d/2h/30m reminders) on accepted/confirmed bookings and invite dates (2026-10).
- Date reminders (2026-10): 24h + 1h in-app + email to both people for accepted/confirmed bookings and confirmed invite dates (invites' extra 3h/30m reminders removed; start/end notices in-app only). Atomic per-flag dedupe. Runs in the 60s lifecycle loop + platform cron `.emergent/crons.yml` (*/15 → /api/cron/tick). Email via Emergent-managed Resend (EMERGENT_EMAIL_KEY, EMAIL_FROM_NAME=GiftsDates, PUBLIC_APP_URL set to preview URL).
- Dates page cleanup (2026-10): removed "Incoming (you're invited)/Outgoing (you booked) — None" blocks; bookings now one "Booked dates" list (only when any) with "Invited you / You booked" tags; new header with counts, dashed empty states, full empty-state CTA, cancelled section hidden when empty.
- Date filters (All / Waiting for reply / Confirmed / Completed / Cancelled with counts, covers invites + bookings) and live CountdownBadge on confirmed dates (pulses <1h, "Happening now" during the 2.5h date) (2026-10).
- Pickup → taxi switch (2026-10): inviter on a DATE_CONFIRMED pickup date can "Send taxi money instead" (prefilled with requested taxi amount, editable) until 30 min before start; POST /api/invites/{id}/pickup/switch-to-taxi charges coins into escrow (total_hold), clears pickup address, notifies recipient (in-app + email).

## Not configured / backlog
- P1: Email (EMERGENT_EMAIL_KEY) and Twilio SMS not configured.
- P1: Original user accounts/data not in repo (they live in the old database).
- P2: Stripe webhook secret, PUBLIC_APP_URL, WEBHOOK_CRON_SECRET.
