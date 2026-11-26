-- Tambahkan dukungan tipe layanan F&B ('dine_in_take_away' | 'take_away_only')
ALTER TABLE public.merchant_settings
  ADD COLUMN IF NOT EXISTS fnb_service_mode text NOT NULL DEFAULT 'dine_in_take_away';
