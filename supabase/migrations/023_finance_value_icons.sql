-- Switch Finance benefit and About value icons to the built-in line-icon set
-- (same glyphs as the Service & Repairs cards). Finance already has an `icon`
-- column holding a single character / emoji; About needs a new column.

-- 1. Finance benefits: map legacy single-char / emoji icons to icon keys. -----

UPDATE finance_benefits SET icon = CASE icon
    WHEN '💰' THEN 'dollar-sign'
    WHEN '$'  THEN 'dollar-sign'
    WHEN '%'  THEN 'percent'
    WHEN '📅' THEN 'calendar'
    WHEN '~'  THEN 'calendar'
    WHEN '⚡' THEN 'zap'
    WHEN '!'  THEN 'zap'
    WHEN '🤝' THEN 'handshake'
    WHEN '*'  THEN 'users'
    ELSE icon
END
WHERE icon NOT IN (
    'dollar-sign','wallet','percent','calendar','zap','badge-check',
    'handshake','map-pin','users','circle-check'
);

-- Anything still unrecognised falls back to a sensible default.
UPDATE finance_benefits SET icon = 'dollar-sign'
WHERE icon NOT IN (
    'dollar-sign','wallet','percent','calendar','zap','badge-check',
    'handshake','map-pin','users','circle-check'
);

ALTER TABLE finance_benefits ALTER COLUMN icon SET DEFAULT 'dollar-sign';

-- 2. About values: add an icon column and backfill by title. ------------------

ALTER TABLE about_values ADD COLUMN IF NOT EXISTS icon text NOT NULL DEFAULT 'star';

UPDATE about_values SET icon = CASE
    WHEN title ILIKE 'Transparency%' THEN 'eye'
    WHEN title ILIKE 'Quality%'      THEN 'award'
    WHEN title ILIKE 'Customer%'     THEN 'heart'
    WHEN title ILIKE 'Reliab%'       THEN 'shield-check'
    WHEN title ILIKE 'Communit%'     THEN 'users'
    ELSE 'star'
END
WHERE icon = 'star';

NOTIFY pgrst, 'reload schema';
