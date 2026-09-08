import { createClient } from "@supabase/supabase-js";

const rawUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://dzgdwwauiblbivpuhgxv.supabase.co";

const rawKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_DeYzIhzz8ZbUE2GIc5hQ9g_bZc5KQkR";

export const supabaseUrl = (rawUrl || "").replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
export const supabaseAnonKey = (rawKey || "").trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith("https://")
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;