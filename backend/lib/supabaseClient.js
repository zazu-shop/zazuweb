const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    "[Zazu] Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el .env del backend."
  );
}

// service_role key: tiene permisos totales, por eso SOLO vive en el
// backend (jamás en el frontend ni en el repo público).
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = { supabase };
