-- ============================================================================
-- STOCKO ENTERPRISE POS - MIGRASI SKEMA HPP (COGS), RIWAYAT HARGA, & ANALITIK
-- Jalankan script ini di Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================================

-- 1. Pembaruan Tabel `ingredients` (Harga Beli & Buffer Stock Threshold)
ALTER TABLE public.ingredients
  ADD COLUMN IF NOT EXISTS unit_price numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS min_stock_threshold numeric;

-- Sinkronisasi nilai awal min_stock_threshold dari min_limit yang sudah ada
UPDATE public.ingredients
SET min_stock_threshold = COALESCE(min_stock_threshold, min_limit, 5)
WHERE min_stock_threshold IS NULL;

-- 2. Tabel Riwayat Perubahan Harga Bahan Baku (`ingredient_price_history`)
CREATE TABLE IF NOT EXISTS public.ingredient_price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id bigint REFERENCES public.ingredients(id) ON DELETE CASCADE,
  ingredient_name text NOT NULL,
  unit text DEFAULT 'pcs',
  old_price numeric NOT NULL DEFAULT 0,
  new_price numeric NOT NULL DEFAULT 0,
  change_pct numeric NOT NULL DEFAULT 0,
  notes text DEFAULT 'Pembaruan harga pasar',
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_price_history_ing_id
  ON public.ingredient_price_history(ingredient_id, changed_at DESC);

-- 3. Tabel Relasi Resep Menu (`menu_recipes`) untuk pelacakan relasional BOM & HPP
CREATE TABLE IF NOT EXISTS public.menu_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id bigint REFERENCES public.products(id) ON DELETE CASCADE,
  ingredient_id bigint REFERENCES public.ingredients(id) ON DELETE SET NULL,
  ingredient_name text NOT NULL,
  qty numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'gram',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_menu_recipes_product
  ON public.menu_recipes(product_id);

-- 4. Tabel Log Mutasi Stok (`stock_logs`) untuk pencatatan otomatis pengurangan BOM & restock
CREATE TABLE IF NOT EXISTS public.stock_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id bigint REFERENCES public.ingredients(id) ON DELETE SET NULL,
  item_name text NOT NULL,
  mutation_type text NOT NULL,
  qty_label text NOT NULL,
  outlet text DEFAULT 'Cabang Utama - Makassar',
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Kebijakan Row-Level Security (RLS) untuk akses aplikasi Stocko
ALTER TABLE public.ingredient_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read price history" ON public.ingredient_price_history;
CREATE POLICY "Allow read price history" ON public.ingredient_price_history
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow insert price history" ON public.ingredient_price_history;
CREATE POLICY "Allow insert price history" ON public.ingredient_price_history
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow manage menu recipes" ON public.menu_recipes;
CREATE POLICY "Allow manage menu recipes" ON public.menu_recipes
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow manage stock logs" ON public.stock_logs;
CREATE POLICY "Allow manage stock logs" ON public.stock_logs
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
