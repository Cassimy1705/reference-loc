import { createClient } from "@supabase/supabase-js";

let supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();

// Si l'utilisateur n'a renseigné que l'identifiant du projet, on reconstitue l'URL complète de Supabase
if (supabaseUrl && !supabaseUrl.startsWith("http://") && !supabaseUrl.startsWith("https://")) {
  supabaseUrl = `https://${supabaseUrl}.supabase.co`;
}

// Nous initialisons le client seulement si les identifiants sont fournis pour éviter de faire crasher l'application au chargement
export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
