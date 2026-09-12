-- ArchEclipse supporter/payment system.
--
-- WHY THIS MIGRATION EXISTS
--  * `public.supporters` already exists (id uuid PK -> auth.users, presence =
--    supporter). It is reused as-is; no is_supporter column is added anywhere.
--  * `public.user_profiles` has NO is_supporter column (the QML profile query
--    referencing it always got NULL). No column is added there either: the
--    frontend now derives supporter state from `supporters` row presence.
--  * New tables below are the smallest set needed for verified one-time
--    payments: an auditable payment ledger (`supporter_payments`) and
--    short-lived Ko-fi account-linking codes (`kofi_link_codes`). Ko-fi has no
--    secure native user-reference mechanism, so the donor pastes a code into
--    the Ko-fi message and the webhook resolves it server-side.
--  * Entitlement is granted ONLY by the `grant_supporter_on_payment` trigger
--    (verified finished payments with a known user_id). Webhooks insert
--    payment rows; they never write `supporters` directly. Nothing in QML can
--    grant supporter status.
--
-- Applied to the main project with explicit user approval
-- (free plan: no development branches available).

-- gen_random_uuid() for payment ids (no-op if already installed).
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Payment ledger: one row per payment intent / verified payment.
-- NOWPayments: row created by create-nowpayments-payment (status pending),
--   transitioned by the IPN webhook. order_id sent to NOWPayments == id.
-- Ko-fi: row created by the Ko-fi webhook (status finished), user_id set via
--   link code, or left NULL (unclaimed) for later email-claim by the donor.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.supporter_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  provider text NOT NULL CHECK (provider IN ('kofi', 'nowpayments')),
  provider_payment_id text,
  amount numeric,
  currency text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'finished', 'failed', 'expired')),
  donor_email text,
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Idempotency: the same provider delivery processed twice must not duplicate.
CREATE UNIQUE INDEX IF NOT EXISTS supporter_payments_provider_pid_uidx
  ON public.supporter_payments (provider, provider_payment_id)
  WHERE provider_payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS supporter_payments_user_id_idx
  ON public.supporter_payments (user_id);

-- Unclaimed Ko-fi lookup by donor email (claim flow).
CREATE INDEX IF NOT EXISTS supporter_payments_unclaimed_kofi_idx
  ON public.supporter_payments (provider, status)
  WHERE user_id IS NULL;

-- ---------------------------------------------------------------------------
-- Ko-fi link codes: short-lived, single-use, user-bound.
-- Created by the signed-in user via REST (RLS: own rows only). The Ko-fi
-- webhook consumes the code found in the donation message.
-- Format enforced client-side: AE-XXXX-XXXX (unambiguous alphabet).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.kofi_link_codes (
  code text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  used boolean NOT NULL DEFAULT false,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '2 hours'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS kofi_link_codes_user_id_idx
  ON public.kofi_link_codes (user_id);

-- ---------------------------------------------------------------------------
-- updated_at maintenance.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS supporter_payments_touch_updated_at ON public.supporter_payments;
CREATE TRIGGER supporter_payments_touch_updated_at
  BEFORE UPDATE ON public.supporter_payments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Entitlement: the ONLY writer path for supporter status besides manual admin.
-- Fires on verified finished payments that are attributed to a user.
-- INSERT ... ON CONFLICT DO NOTHING makes re-deliveries idempotent.
-- SECURITY DEFINER so the trigger (not the caller) owns the supporters write.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.grant_supporter_on_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NOT NULL
     AND NEW.status = 'finished'
     AND NEW.provider IN ('kofi', 'nowpayments') THEN
    INSERT INTO public.supporters (id) VALUES (NEW.user_id)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS supporter_payments_grant_supporter ON public.supporter_payments;
CREATE TRIGGER supporter_payments_grant_supporter
  AFTER INSERT OR UPDATE ON public.supporter_payments
  FOR EACH ROW EXECUTE FUNCTION public.grant_supporter_on_payment();

-- ---------------------------------------------------------------------------
-- Row Level Security. Principle: users read their own state; all writes that
-- grant value happen server-side (service_role / trigger). RLS is never
-- weakened for existing tables.
-- ---------------------------------------------------------------------------
ALTER TABLE public.supporter_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kofi_link_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own payments" ON public.supporter_payments;
CREATE POLICY "Users can read own payments"
  ON public.supporter_payments FOR SELECT
  USING (auth.uid() = user_id);

-- Claim discovery: a signed-in donor whose VERIFIED auth email
-- (auth.users, not the user-editable user_profiles.email) matches the Ko-fi
-- donor email can see their own unclaimed finished Ko-fi payments.
DROP POLICY IF EXISTS "Users can discover own unclaimed Ko-fi payments" ON public.supporter_payments;
CREATE POLICY "Users can discover own unclaimed Ko-fi payments"
  ON public.supporter_payments FOR SELECT
  USING (
    provider = 'kofi'
    AND status = 'finished'
    AND user_id IS NULL
    AND donor_email IS NOT NULL
    AND lower(donor_email) = lower(NULLIF(auth.jwt() ->> 'email', ''))
  );

-- Claim: same email-match guard on the old row; the new row must attribute
-- exactly to the claimant and keep the verified finished state. The trigger
-- then grants supporter status atomically in the same transaction.
DROP POLICY IF EXISTS "Users can claim own unclaimed Ko-fi payments" ON public.supporter_payments;
CREATE POLICY "Users can claim own unclaimed Ko-fi payments"
  ON public.supporter_payments FOR UPDATE
  USING (
    provider = 'kofi'
    AND status = 'finished'
    AND user_id IS NULL
    AND donor_email IS NOT NULL
    AND lower(donor_email) = lower(NULLIF(auth.jwt() ->> 'email', ''))
  )
  WITH CHECK (
    provider = 'kofi'
    AND status = 'finished'
    AND user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can read own Ko-fi link codes" ON public.kofi_link_codes;
CREATE POLICY "Users can read own Ko-fi link codes"
  ON public.kofi_link_codes FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own Ko-fi link codes" ON public.kofi_link_codes;
CREATE POLICY "Users can create own Ko-fi link codes"
  ON public.kofi_link_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Hardening: trigger functions must not be directly RPC-executable.
-- (Triggers fire regardless of EXECUTE privilege.)
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.grant_supporter_on_payment() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
