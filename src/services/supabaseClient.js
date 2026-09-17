import { createClient } from '@supabase/supabase-js';

// Ganti dengan URL dan Anon Public Key dari project Supabase Anda
const SUPABASE_URL = 'https://ewcbmxdxeodzkwsuxwpe.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_E4R5sXBg1h2aaJdb4SdyZg_Rajusjd5';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);