import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase environment variables. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file."
  );
}

// Singleton Supabase client – used for Auth, DB reads, etc.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Backward-compatible async getter (used by older code paths)
export async function getSupabaseClient() {
  return supabase;
}
