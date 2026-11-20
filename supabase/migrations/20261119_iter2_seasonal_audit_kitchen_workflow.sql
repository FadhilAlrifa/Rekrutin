-- =========================================================================
-- Stocko Iteration 2 Migration:
-- 1. Historical & Seasonal Demand Forecasting (seasonal_events)
-- 2. Audit Trail & Stock Movements (audit_logs, stock_movements)
-- 3. Flexible Order & Kitchen Workflow (merchant_settings, orders, order_items, transactions extensions)
-- =========================================================================

-- 1. Seasonal Events Table
CREATE TABLE IF NOT EXISTS public.seasonal_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'holiday',
  start_date date NOT NULL,
  end_date date NOT NULL,
  expected_lift_pct numeric NOT NULL DEFAULT 30,
  notes text,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Operational Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  user_name text NOT NULL,
  role text NOT NULL,
  action_type text NOT NULL,
  entity_type text,
  entity_id text,
  entity_name text,
  before_value text,
  after_value text,
  delta_label text,
  reason text,
  outlet text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Stock Movements Table (Structured Movement Ledger)
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id text,
  ingredient_name text NOT NULL,
  movement_type text NOT NULL,
  qty_change numeric NOT NULL,
  before_stock numeric,
  after_stock numeric,
  unit text,
  cost_impact numeric NOT NULL DEFAULT 0,
  order_id text,
  user_id text,
  user_name text,
  role text,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Merchant Workflow Settings
CREATE TABLE IF NOT EXISTS public.merchant_settings (
  id text PRIMARY KEY DEFAULT 'default',
  default_order_channel text NOT NULL DEFAULT 'dine_in',
  payment_flow text NOT NULL DEFAULT 'pay_first',
  closed_kitchen_enabled boolean NOT NULL DEFAULT true,
  require_cashier_shift boolean NOT NULL DEFAULT true,
  updated_by text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Orders & Order Items (Flexible Order State Machine)
CREATE TABLE IF NOT EXISTS public.orders (
  id text PRIMARY KEY,
  order_number text NOT NULL,
  order_channel text NOT NULL DEFAULT 'dine_in',
  payment_flow text NOT NULL DEFAULT 'pay_first',
  order_status text NOT NULL DEFAULT 'open',
  payment_status text NOT NULL DEFAULT 'unpaid',
  kitchen_status text NOT NULL DEFAULT 'queued',
  payment_method text DEFAULT 'cash',
  table_number text DEFAULT 'Kasir Utama',
  customer_name text,
  total_amount numeric NOT NULL DEFAULT 0,
  waste_cost numeric NOT NULL DEFAULT 0,
  cashier_id text,
  cashier_name text,
  stock_deducted boolean NOT NULL DEFAULT false,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  revision_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  cancel_reason text,
  outlet text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id text,
  product_name text NOT NULL,
  qty numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  cogs_unit numeric NOT NULL DEFAULT 0,
  item_status text NOT NULL DEFAULT 'active',
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Extend Transactions Table for Backward Compatibility
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS order_channel text DEFAULT 'dine_in',
  ADD COLUMN IF NOT EXISTS payment_flow text DEFAULT 'pay_first',
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'paid',
  ADD COLUMN IF NOT EXISTS kitchen_status text DEFAULT 'served',
  ADD COLUMN IF NOT EXISTS cashier_id text,
  ADD COLUMN IF NOT EXISTS cashier_name text,
  ADD COLUMN IF NOT EXISTS waste_cost numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cancel_reason text,
  ADD COLUMN IF NOT EXISTS revision_history jsonb DEFAULT '[]'::jsonb;

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON public.audit_logs (action_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON public.stock_movements (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_kitchen_status ON public.orders (kitchen_status);

-- 8. RLS Policies
ALTER TABLE public.seasonal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['seasonal_events', 'audit_logs', 'stock_movements', 'merchant_settings', 'orders', 'order_items']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Allow all access %s" ON public.%I;', tbl, tbl);
    EXECUTE format('CREATE POLICY "Allow all access %s" ON public.%I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);', tbl, tbl);
  END LOOP;
END $$;
