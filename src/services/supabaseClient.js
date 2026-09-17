import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://ewcbmxdxeodzkwsuxwpe.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_E4R5sXBg1h2aaJdb4SdyZg_Rajusjd5';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const supabaseAdminAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});