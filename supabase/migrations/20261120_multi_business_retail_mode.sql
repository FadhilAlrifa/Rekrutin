-- =========================================================================
-- Stocko Iteration 4 Migration:
-- Multi-Business Mode Support (F&B & Ritel)
-- =========================================================================

-- 1. Tambahkan field business_type pada merchant_settings ('fnb' | 'retail')
ALTER TABLE public.merchant_settings
  ADD COLUMN IF NOT EXISTS business_type text NOT NULL DEFAULT 'fnb';

-- 2. Perluas tabel products untuk mendukung SKU Ritel, Varian, Satuan, Stok Langsung, Buffer Minimum, & Harga Kulakan
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sku text,
  ADD COLUMN IF NOT EXISTS unit text DEFAULT 'pcs',
  ADD COLUMN IF NOT EXISTS variant_label text,
  ADD COLUMN IF NOT EXISTS purchase_price numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stock numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS min_stock_threshold numeric NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS product_mode text NOT NULL DEFAULT 'fnb';

-- 3. Tabel riwayat perubahan harga kulakan / supplier produk ritel
CREATE TABLE IF NOT EXISTS public.product_purchase_price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id bigint REFERENCES public.products(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  sku text,
  unit text DEFAULT 'pcs',
  old_price numeric NOT NULL DEFAULT 0,
  new_price numeric NOT NULL DEFAULT 0,
  change_pct numeric NOT NULL DEFAULT 0,
  notes text DEFAULT 'Pembaruan harga kulakan supplier',
  changed_by text,
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_purchase_price_history_prod
  ON public.product_purchase_price_history (product_id, changed_at DESC);

ALTER TABLE public.product_purchase_price_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access product_purchase_price_history" ON public.product_purchase_price_history;
CREATE POLICY "Allow all access product_purchase_price_history"
  ON public.product_purchase_price_history FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);
