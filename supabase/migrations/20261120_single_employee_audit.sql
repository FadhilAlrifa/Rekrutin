-- =========================================================================
-- Stocko Iteration 3 Migration:
-- Single-Employee Account Enforcement (Nama Saja) & Audit Readiness
-- =========================================================================

-- 1. Perluas tabel user_roles agar menyimpan nama lengkap pribadi & status aktif/nonaktif (tanpa ID employee)
ALTER TABLE public.user_roles
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS outlet_name text DEFAULT 'Cabang Utama - Makassar',
  ADD COLUMN IF NOT EXISTS deactivated_at timestamptz,
  ADD COLUMN IF NOT EXISTS deactivated_reason text;

-- 2. Tabel riwayat sesi login/logout karyawan (Stocker & Kasir)
CREATE TABLE IF NOT EXISTS public.employee_login_sessions (
  id text PRIMARY KEY,
  user_id text,
  full_name text NOT NULL,
  email text,
  role text NOT NULL,
  outlet_name text DEFAULT 'Cabang Utama - Makassar',
  device_info text,
  session_status text NOT NULL DEFAULT 'active',
  login_at timestamptz NOT NULL DEFAULT now(),
  logout_at timestamptz
);

-- 3. Tambahkan kolom nama aktor spesifik di audit_logs & stock_movements
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS cashier_name text,
  ADD COLUMN IF NOT EXISTS stocker_name text;

ALTER TABLE public.stock_movements
  ADD COLUMN IF NOT EXISTS cashier_name text,
  ADD COLUMN IF NOT EXISTS stocker_name text;

CREATE INDEX IF NOT EXISTS idx_employee_sessions_login_at ON public.employee_login_sessions (login_at DESC);
CREATE INDEX IF NOT EXISTS idx_employee_sessions_full_name ON public.employee_login_sessions (full_name);

-- 4. Pastikan RLS user_roles & employee_login_sessions mengizinkan operasi admin secara aman
ALTER TABLE public.employee_login_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access employee_login_sessions" ON public.employee_login_sessions;
CREATE POLICY "Allow all access employee_login_sessions"
  ON public.employee_login_sessions FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update user_roles" ON public.user_roles;
CREATE POLICY "Allow update user_roles"
  ON public.user_roles FOR UPDATE TO anon, authenticated
  USING (true) WITH CHECK (true);
