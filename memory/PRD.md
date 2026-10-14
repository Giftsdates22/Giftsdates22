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

## Not configured / backlog
- P1: Email (EMERGENT_EMAIL_KEY) and Twilio SMS not configured.
- P1: Original user accounts/data not in repo (they live in the old database).
- P2: Stripe webhook secret, PUBLIC_APP_URL, WEBHOOK_CRON_SECRET.
