-- =========================================================================
-- PEMISAHAN HARGA BELI AWAL VS HARGA PASAR TERBARU BAHAN BAKU (OWNER VIEW)
-- =========================================================================

ALTER TABLE IF EXISTS public.ingredients
  ADD COLUMN IF NOT EXISTS initial_purchase_price numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_market_price numeric DEFAULT 0;

-- Backfill harga pasar terbaru mengikuti unit_price jika belum terisi
UPDATE public.ingredients
SET current_market_price = COALESCE(NULLIF(current_market_price, 0), unit_price, 0)
WHERE COALESCE(current_market_price, 0) = 0
  AND COALESCE(unit_price, 0) > 0;

-- Backfill harga beli awal dari riwayat harga tertua jika ada, atau unit_price saat ini
WITH earliest_history AS (
  SELECT DISTINCT ON (ingredient_id)
    ingredient_id,
    CASE
      WHEN COALESCE(old_price, 0) > 0 THEN old_price
      ELSE COALESCE(new_price, 0)
    END AS first_recorded_price
  FROM public.ingredient_price_history
  WHERE ingredient_id IS NOT NULL
  ORDER BY ingredient_id, changed_at ASC
)
UPDATE public.ingredients i
SET initial_purchase_price = COALESCE(
  NULLIF(i.initial_purchase_price, 0),
  NULLIF(eh.first_recorded_price, 0),
  NULLIF(i.current_market_price, 0),
  i.unit_price,
  0
)
FROM earliest_history eh
WHERE i.id = eh.ingredient_id
  AND COALESCE(i.initial_purchase_price, 0) = 0;

UPDATE public.ingredients
SET initial_purchase_price = COALESCE(NULLIF(initial_purchase_price, 0), NULLIF(current_market_price, 0), unit_price, 0)
WHERE COALESCE(initial_purchase_price, 0) = 0
  AND (COALESCE(current_market_price, 0) > 0 OR COALESCE(unit_price, 0) > 0);
