# ArchEclipse Supporter / Payment System

One-time contributions via **Ko-fi** (fiat/card/PayPal) and **NOWPayments**
(crypto). No subscriptions. No Lemon Squeezy.

Entitlement source of truth: row presence in the existing `public.supporters`
table. It is written **only** by the `grant_supporter_on_payment` DB trigger
on verified `finished` payments, or manually by an admin. Nothing in QML can
grant supporter status.

## Architecture

```
QML (DonationsWidget)
 ├─ Ko-fi:        open ko-fi.com page externally (with link code in message)
 │                 → Ko-fi webhook → payment-webhook-kofi → supporter_payments
 │                 → trigger → supporters
 └─ Crypto:       POST create-nowpayments-payment (JWT) → invoice_url
                  → open externally → NOWPayments IPN
                  → payment-webhook-nowpayments → supporter_payments
                  → trigger → supporters
```

## Files

| Path | Purpose |
|---|---|
| `supabase/migrations/20260910000000_supporter_payments.sql` | `supporter_payments` ledger, `kofi_link_codes`, entitlement trigger, RLS |
| `supabase/functions/create-nowpayments-payment/index.ts` | Authenticated invoice creation (JWT → NOWPayments) |
| `supabase/functions/payment-webhook-nowpayments/index.ts` | IPN receiver, HMAC-SHA512 verified |
| `supabase/functions/payment-webhook-kofi/index.ts` | Ko-fi webhook, token verified |
| `supabase/functions/_tests/run.mjs` | Local logic tests (`node --test …`) |
| `services/Supabase.qml` | Shared public config singleton (URL, anon key) |
| `services/qmldir` | Registers the singleton |
| `widgets/leftPanel/DonationsWidget.qml` | Supporter UI (amounts, Ko-fi, crypto, claim) |
| `widgets/leftPanel/UserProfileWidget.qml` | Fixed supporter read (was `user_profiles.is_supporter`, which does not exist) |

## Required secrets (Supabase Edge Function secrets — never in the repo)

| Secret | Where to get it |
|---|---|
| `SUPABASE_URL` | Project settings (standard) |
| `SUPABASE_ANON_KEY` | Project settings (standard) |
| `SUPABASE_SERVICE_ROLE_KEY` | Project settings (standard, server-side only) |
| `NOWPAYMENTS_API_KEY` | NOWPayments dashboard → API keys |
| `NOWPAYMENTS_IPN_SECRET` | NOWPayments dashboard → Store/​Payment Settings → IPN secret |
| `KOFI_VERIFICATION_TOKEN` | ko-fi.com/manage/webhooks → Verification Token |

Optional: `NOWPAYMENTS_API_BASE` (defaults to `https://api.nowpayments.io/v1`;
point at the sandbox host for testing).

```bash
supabase secrets set NOWPAYMENTS_API_KEY=… NOWPAYMENTS_IPN_SECRET=… \
  KOFI_VERIFICATION_TOKEN=… SUPABASE_URL=… SUPABASE_ANON_KEY=… \
  SUPABASE_SERVICE_ROLE_KEY=…
```

## Webhook URLs (after `supabase functions deploy`)

- Ko-fi → `https://<project>.supabase.co/functions/v1/payment-webhook-kofi`
- NOWPayments IPN → set per-invoice automatically by
  `create-nowpayments-payment` (`ipn_callback_url`); no dashboard URL needed.
  (A global dashboard IPN URL is unnecessary — each invoice carries its own.)

## Ko-fi configuration

1. Open https://ko-fi.com/manage/webhooks.
2. Set the webhook URL to the `payment-webhook-kofi` URL above.
3. Copy the Verification Token → `KOFI_VERIFICATION_TOKEN` secret.
4. Use “Send Test” on that page to verify delivery (test events carry a
   `verification_token` too; type `Donation` test payloads are recorded —
   delete test rows afterwards or use a dev branch).
5. Donors must paste their `AE-XXXX-XXXX` link code (shown in the shell) into
   the Ko-fi donation message. Without a code the donation is stored
   **unclaimed** and the donor links it via “Check for my donation”.

## NOWPayments configuration

1. Create account, add payout wallet, generate API key → `NOWPAYMENTS_API_KEY`.
2. Generate IPN secret (Store Settings / Payment Settings) →
   `NOWPAYMENTS_IPN_SECRET`.
3. No dashboard callback URL is required (per-invoice `ipn_callback_url`).
4. Sandbox: account-sandbox.nowpayments.io + `NOWPAYMENTS_API_BASE` override;
   pass `case` through test invoices per NOWPayments sandbox docs.

## Status semantics

- NOWPayments: only `payment_status == "finished"` (any case) activates.
  `waiting / confirming / confirmed / sending / partially_paid` stay pending;
  `failed / expired` are terminal without entitlement.
- Ko-fi: only `type == "Donation"` with falsy `is_subscription_payment`.
  Subscriptions, shop orders, commissions are acknowledged (200) and skipped.

## RLS summary (see migration for exact policies)

- `supporters`: existing `SELECT own` policy unchanged; **no** user INSERT.
- `supporter_payments`: users `SELECT` own rows; `SELECT` + `UPDATE`-to-claim
  unclaimed Ko-fi rows matching their **verified auth email**
  (`auth.jwt()->>'email'`, not the user-editable profile email).
- `kofi_link_codes`: users `SELECT`/`INSERT` own rows.

## Local testing (no real purchases, no prod writes)

```bash
node --test supabase/functions/_tests/run.mjs   # 26 checks, all offline
```

Covers: HMAC-SHA512 primitive (cross-checked node vs python), sorted-key
signing, tamper/wrong-secret rejection, status mapping (only `finished`
grants), NULL-user and unknown-provider never grant, Ko-fi code extraction +
event gating, function/migration sync (no hardcoded secrets, JWT-verified
user, idempotent upserts).

QML: `qmllint` 1.0 in this environment cannot parse `?.` (already used across
the repo, e.g. baseline `UserProfileWidget.qml`); new/edited files were
verified by stripping only that operator (exit 0) plus a balance check
matching baseline. Validate visually with `qmlls`/running shell.

## Deployment status (2026-09-10 — applied to the MAIN project)

Free plan: no branches. Migration + hardening applied and all 3 functions
deployed ACTIVE with explicit user approval. Verified live:

- tables `supporter_payments` / `kofi_link_codes` present, RLS on, 5 policies
- triggers `supporter_payments_grant_supporter` + `touch_updated_at` present
- `create-nowpayments-payment` without token → `401 Sign in required`
- both webhooks without secrets → `500 Webhook not configured` (expected
  until secrets below are set — endpoints are live)
- smoke test: pending unattributed insert grants nothing (`supporters`
  stayed at 1), duplicate `(provider, provider_payment_id)` rejected by
  unique index `supporter_payments_provider_pid_uidx`, smoke rows removed
- live provider test (2026-09-10, production key, no funds moved): key valid;
  `$5` invoice created with the exact edge-function payload shape
  (test invoice id `5049702768`, unpaid, expires on its own);
  `order_id` + `ipn_callback_url` echoed correctly; `supporter_payments`
  stayed 0 / `supporters` stayed 1 (no payment → no IPN → nothing recorded)
- minimums found live: BTC→USD min ≈ 0.0002625 BTC (≈$20), ETH→USD min
  ≈ $0.43 — the shell hints low-amount donors toward low-minimum coins
- MCP wrapper at mcp.nowpayments.io is currently broken for these tools
  (returns 404 `Cannot GET /v1/full-currencies` for min/invoice calls);
  direct REST API used instead and works
- NOT yet testable until you set the 3 secrets: live IPN through our
  webhook (needs `NOWPAYMENTS_IPN_SECRET`), live create-flow (needs
  `NOWPAYMENTS_API_KEY` on Supabase + your shell session), Ko-fi webhook
  (needs `KOFI_VERIFICATION_TOKEN`)
- security advisors: no findings on new objects (remaining `handle_new_user`
  + leaked-password warnings are pre-existing/out of scope)

## Still required (you — I have no secrets tool)

Set in Dashboard → Edge Functions → Secrets (project
`skekmjmsgcbfhbwgpzkp`):

- `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET`, `KOFI_VERIFICATION_TOKEN`
  (`SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` are
  auto-injected; `NOWPAYMENTS_API_BASE` optional, defaults to production)

Then:

- Ko-fi → https://ko-fi.com/manage/webhooks → URL
  `https://skekmjmsgcbfhbwgpzkp.supabase.co/functions/v1/payment-webhook-kofi`
- NOWPayments needs no dashboard URL (per-invoice `ipn_callback_url`).
- Run the manual verification checklist below with sandbox/test payments.

## Deployment (if ever re-doing from scratch)

1. Create a Supabase development branch from production.
2. Apply `supabase/migrations/20260910000000_supporter_payments.sql` there.
3. `supabase functions deploy create-nowpayments-payment
   payment-webhook-nowpayments payment-webhook-kofi --project-ref <branch>`.
4. Set the six secrets on the branch.
5. Run the checklist below against the branch (sandbox providers).
6. Report migrations/RLS/functions, get explicit approval, then merge.

## Manual verification checklist (on the branch)

1. Signed-out shell: supporter section prompts sign-in; no status granted.
2. Signed-in non-supporter: status reads “not yet”; profile shows “Member”.
3. Ko-fi code appears (`AE-XXXX-XXXX`); Ko-fi button opens the Ko-fi page.
4. NOWPayments checkout returns an `invoice_url`; no secret in the response.
5. IPN with bad signature → 403, no row, no supporter.
6. IPN `finished` (good signature) → `supporter_payments.finished` +
   `supporters` row; UI shows Supporter after Refresh (no restart).
7. Same IPN replayed → `{duplicate:true}`, single payment row, state intact.
8. IPN `waiting`/`failed` → pending/failed, **no** supporter row.
9. Ko-fi webhook with bad token → 403; good token + code → attributed.
10. Ko-fi replay (same `kofi_transaction_id`) → duplicate, one row.
11. Ko-fi without code → unclaimed row + successful claim via the UI.
12. Pre-existing supporter row still reports Supporter; settings sync and
    other widgets unaffected.
