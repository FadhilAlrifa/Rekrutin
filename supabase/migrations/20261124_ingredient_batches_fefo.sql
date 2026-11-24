-- =========================================================================
-- MULTI-BATCH & ATURAN FEFO (FIRST EXPIRED, FIRST OUT) BAHAN BAKU GUDANG
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.ingredient_batches (
  id text PRIMARY KEY,
  ingredient_id text NOT NULL,
  batch_code text NOT NULL,
  qty numeric NOT NULL DEFAULT 0,
  initial_qty numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'pcs',
  entry_date date,
  expiry_date date,
  stocker_name text DEFAULT '',
  notes text DEFAULT '',
  disposed_as_waste boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ingredient_batches_fefo
  ON public.ingredient_batches (ingredient_id, expiry_date ASC NULLS LAST, created_at ASC);

ALTER TABLE public.ingredient_batches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read ingredient_batches" ON public.ingredient_batches;
CREATE POLICY "Allow read ingredient_batches" ON public.ingredient_batches
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow manage ingredient_batches" ON public.ingredient_batches;
CREATE POLICY "Allow manage ingredient_batches" ON public.ingredient_batches
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Backfill batch awal untuk bahan baku eksisting yang sudah memiliki stok
INSERT INTO public.ingredient_batches (
  id,
  ingredient_id,
  batch_code,
  qty,
  initial_qty,
  unit,
  entry_date,
  expiry_date,
  stocker_name,
  notes
)
SELECT
  'BATCH-INIT-' || i.id::text AS id,
  i.id::text AS ingredient_id,
  'BATCH-AWAL' AS batch_code,
  GREATEST(0, COALESCE(i.stock, 0)) AS qty,
  GREATEST(0, COALESCE(i.stock, 0)) AS initial_qty,
  COALESCE(i.unit, 'pcs') AS unit,
  i.entry_date,
  i.expiry_date,
  'Stok Awal' AS stocker_name,
  'Migrasi otomatis stok batch awal' AS notes
FROM public.ingredients i
WHERE COALESCE(i.stock, 0) > 0
  AND NOT EXISTS (
    SELECT 1 FROM public.ingredient_batches b WHERE b.ingredient_id = i.id::text
  );
