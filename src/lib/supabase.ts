import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ofltdenhtlpykwjbqmwl.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_O1eg8NownX75-PF8_Y5CbQ_k-HR0Mie';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const REGISTRATION_CAP = Number(process.env.REGISTRATION_CAP) || 100;
export const SHORTLIST_COUNT = Number(process.env.SHORTLIST_CAP) || 40;
