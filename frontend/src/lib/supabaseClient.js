import { createClient } from "@supabase/supabase-js";

// El frontend normalmente NO debe hablar directo con Postgres: pasa por el
// backend (carpeta /backend). Este cliente queda listo por si necesitas
// auth de Supabase en el navegador (login de usuarios, magic links, etc.)
// Usa siempre la ANON KEY aquí, nunca la service_role key.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;