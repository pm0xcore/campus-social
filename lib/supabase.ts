import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client
export const supabase = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client with service role (for API routes)
// Used in API routes where we need admin privileges
export function createClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey);
}

// Alias for backwards compatibility
export const createServerClient = createClient;
