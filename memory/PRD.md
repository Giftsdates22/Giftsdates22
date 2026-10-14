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
- Pickup → taxi switch (2026-10): inviter on a DATE_CONFIRMED pickup date can "Send taxi money instead" (fixed to the exact taxi fee the invited person requested — not editable, server ignores any amount sent) until 30 min before start; POST /api/invites/{id}/pickup/switch-to-taxi charges coins into escrow (total_hold), clears pickup address, notifies recipient (in-app + email).
- Invitee availability overview (2026-10): AvailabilityOverview shows the weekly schedule + next open days with ranges, booked times and count of free start times. Shown on ProfileView (tap day → invite modal preselected) and at the top of Invite/Book modals (tap day selects it). Updated: only FREE ranges are shown (booked + locked/cancelled blocks subtracted via freeRanges); no "Booked" tags, no busy strikethrough on calendars; fully-booked days hidden. Best Time Highlight: bestDayKeys = top 3 upcoming days by free start times (none if all equal) → "Best day" star badge + amber row tint in overview, gold ring on Invite/Book calendars.
- Slot locking (2026-10): `_taken_blocks` (active+cancelled bookings, active+cancelled invite dates, locked_slots → per local day, reason booked/cancelled, ±15m buffer) feeds /profiles/{id}/availability; `_assert_slot_free` enforces TIME_PASSED / SLOT_LOCKED / SLOT_BUSY on POST /invites and /dates/book. Invites + bookings now store local_day/local_time. Time picker shows "Locked times" (another date / cancelled date) and blocks past times today; overview still shows only free ranges. iteration_5: 13/13 backend, UI pass. Later: "Locked times" list removed from the inviter's time picker (locks stay enforced server-side); Available hours = free ranges only.
- Reopen locked slots (2026-10): Profile "Locked times" card (LockedSlots.jsx) lists upcoming cancelled/refused locks; Premium/Premium-lite/VIP can Reopen (POST /api/me/locked-slots/unlock {day,time} → users.unlocked_slots "day|HH:MM"; 403 PREMIUM_REQUIRED otherwise). GET /api/me/locked-slots. _taken_blocks + _recipient_slot_or_400 honor unlocked_slots. "Reopen all (n)" button (POST /api/me/locked-slots/unlock-all, subscribers only) shown when 2+ locks.
- Date-time UX (2026-10): in-app reminders 15 min before start (m15) and 15 min before end (end15) for invites + bookings. CountdownBadge phases: amber upcoming → red countdown last 15 min (soon) → yellow count-up during the 2.5h date → red countdown 15-min after-buffer → hidden. Optional live location (LiveLocation.jsx; POST/GET /api/live-location/{invite|booking}/{id}) open from 2h before start until end: share toggle (browser GPS, 15s throttle), embedded Google map of the other's position, Google Maps directions to them / to venue (no API key).

## Not configured / backlog
- P1: Email (EMERGENT_EMAIL_KEY) and Twilio SMS not configured.
- P1: Original user accounts/data not in repo (they live in the old database).
- P2: Stripe webhook secret, PUBLIC_APP_URL, WEBHOOK_CRON_SECRET.
