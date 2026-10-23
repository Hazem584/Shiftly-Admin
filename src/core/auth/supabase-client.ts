import { createClient } from "@supabase/supabase-js";
const url = import.meta.env.VITE_SUPABASE_URL ?? "";
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";
const base = import.meta.env.VITE_API_BASE_URL ?? "";
export const configured =
  /^https?:\/\//.test(base) &&
  base.replace(/\/$/, "").endsWith("/api/v1") &&
  /^https:\/\//.test(url) &&
  key.length > 10;
export const supabase = configured
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storage: window.sessionStorage,
      },
    })
  : null;
