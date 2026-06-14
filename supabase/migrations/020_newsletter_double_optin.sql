-- ============================================================
-- 020: Newsletter double opt-in
-- Adds confirmation state to newsletter_subscribers. New sign-ups are
-- created unconfirmed and must click a tokenised link emailed to them
-- before they count as a real subscriber.
-- ============================================================

ALTER TABLE newsletter_subscribers
    ADD COLUMN IF NOT EXISTS confirmed          boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS confirmed_at       timestamptz,
    ADD COLUMN IF NOT EXISTS confirmation_token uuid DEFAULT gen_random_uuid();

-- Every row that exists at the moment this migration runs predates double
-- opt-in (it was a single-opt-in sign-up), so treat it as already confirmed.
-- New rows inserted after this point keep the default confirmed = false.
UPDATE newsletter_subscribers
    SET confirmed    = true,
        confirmed_at = COALESCE(confirmed_at, subscribed_at)
    WHERE confirmed = false;

-- Confirmation happens by token lookup.
CREATE INDEX IF NOT EXISTS idx_newsletter_confirmation_token
    ON newsletter_subscribers (confirmation_token);

-- Note: subscribe + confirm both run through the service-role client in the
-- app (server action / confirm route), so no anon RLS policy changes are
-- needed here. The existing public INSERT policy is left in place but is no
-- longer exercised by the form.
