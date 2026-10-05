import { createClient } from "@supabase/supabase-js";

// Nilai ini diisi lewat file .env (lokal) dan Environment Variables (Vercel / Netlify).
// Kunci "anon / publishable" memang aman dipakai di frontend,
// yang melindungi data adalah aturan RLS di supabase-setup.sql.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && key ? createClient(url, key) : null;

export default supabase;