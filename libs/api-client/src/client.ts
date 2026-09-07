// Shared Supabase client instance

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig, realtimeConfig } from './config';

export const supabase: SupabaseClient = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: realtimeConfig,
    global: {
      headers: {
        'X-Client-Info': 'wada-bmad-api-client',
      },
    },
  }
);