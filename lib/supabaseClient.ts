/**
 * AetherOps AI - Supabase Client Configuration
 * Safe client initialization with robust fallbacks for local, CI/CD, and Vercel environments.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseUrl = rawUrl && rawUrl.startsWith('http') ? rawUrl : 'https://aetherops-demo.supabase.co';

const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const supabaseAnonKey = rawKey && rawKey.length > 10 ? rawKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.demo-anon-token-aetherops';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    rawUrl &&
    rawUrl.startsWith('http') &&
    !rawUrl.includes('placeholder') &&
    !rawUrl.includes('your-project') &&
    rawKey &&
    rawKey.length > 20 &&
    !rawKey.includes('dummy')
  );
};

// Singleton instance to prevent multiple client instantiations
let cachedClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (cachedClient) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (error) {
    console.warn('[AetherOps Supabase] Fallback client initialized:', error);
    cachedClient = createClient('https://aetherops-demo.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.demo', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return cachedClient;
};

export const supabase = getSupabaseClient();
