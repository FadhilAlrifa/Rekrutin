-- =========================================================================
-- DAILY SALES HISTORY (AGREGASI PENJUALAN HARIAN PER MENU & TANGGAL)
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.daily_sales_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_date date NOT NULL,
  menu_id text NOT NULL,
  menu_name text NOT NULL,
  category text DEFAULT 'Umum',
  quantity_sold numeric NOT NULL DEFAULT 0,
  total_revenue numeric NOT NULL DEFAULT 0,
  estimated_profit numeric NOT NULL DEFAULT 0,
  transactions_count integer NOT NULL DEFAULT 0,
  holiday_label text DEFAULT '',
  is_holiday boolean NOT NULL DEFAULT false,
  outlet text DEFAULT 'Semua Cabang (Terpusat)',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT daily_sales_history_date_menu_unique UNIQUE (sales_date, menu_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_sales_history_date
  ON public.daily_sales_history (sales_date DESC);

ALTER TABLE public.daily_sales_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read daily_sales_history" ON public.daily_sales_history;
CREATE POLICY "Allow read daily_sales_history" ON public.daily_sales_history
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow manage daily_sales_history" ON public.daily_sales_history;
CREATE POLICY "Allow manage daily_sales_history" ON public.daily_sales_history
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Backfill agregasi awal dari tabel transactions yang sudah ada
INSERT INTO public.daily_sales_history (
  sales_date,
  menu_id,
  menu_name,
  category,
  quantity_sold,
  total_revenue,
  estimated_profit,
  transactions_count,
  updated_at
)
SELECT
  (t.created_at AT TIME ZONE 'Asia/Makassar')::date AS sales_date,
  COALESCE(NULLIF(item->>'id', ''), lower(trim(COALESCE(item->>'name', 'menu')))) AS menu_id,
  COALESCE(NULLIF(item->>'name', ''), 'Menu POS') AS menu_name,
  COALESCE(NULLIF(item->>'category', ''), 'Umum') AS category,
  SUM(GREATEST(0, COALESCE((item->>'qty')::numeric, 0))) AS quantity_sold,
  SUM(GREATEST(0, COALESCE((item->>'qty')::numeric, 0)) * GREATEST(0, COALESCE((item->>'price')::numeric, 0))) AS total_revenue,
  0 AS estimated_profit,
  COUNT(DISTINCT t.id) AS transactions_count,
  now() AS updated_at
FROM public.transactions t
CROSS JOIN LATERAL jsonb_array_elements(
  CASE WHEN jsonb_typeof(t.items) = 'array' THEN t.items ELSE '[]'::jsonb END
) AS item
WHERE COALESCE(t.kitchen_status, '') NOT IN ('cancelled', 'cancelled_waste')
  AND COALESCE(t.payment_status, '') <> 'refunded'
  AND COALESCE((item->>'qty')::numeric, 0) > 0
GROUP BY 1, 2, 3, 4
ON CONFLICT (sales_date, menu_id)
DO UPDATE SET
  menu_name = EXCLUDED.menu_name,
  quantity_sold = EXCLUDED.quantity_sold,
  total_revenue = EXCLUDED.total_revenue,
  transactions_count = EXCLUDED.transactions_count,
  updated_at = now();
