import { supabase } from "./supabaseClient";
import { crearSlug } from "./dndRules";

export const sumarXp = (log = []) => log.reduce((suma, e) => suma + Number(e.amount || 0), 0);

const COLUMNAS_PERSONAJE = [
  "name", "class_name", "species", "background", "alignment", "size", "speed", "portrait_url",
  "hit_die", "hp_max", "hp_current", "ac", "initiative_bonus",
  "str_score", "dex_score", "con_score", "int_score", "wis_score", "cha_score",
  "saves", "skills", "languages", "armor_prof", "weapon_prof", "tool_prof",
  "features", "attacks", "equipment", "cp", "sp", "gp", "notes", "published",
];

const COLUMNAS_NUMERICAS = [
  "hp_max", "hp_current", "ac", "initiative_bonus",
  "str_score", "dex_score", "con_score", "int_score", "wis_score", "cha_score",
  "cp", "sp", "gp",
];

function lanzar(error) {
  if (error) throw new Error(error.message);
}

/* ---------------- Personajes ---------------- */

export async function listarPersonajes({ userId = null, soloPublicados = true } = {}) {
  let consulta = supabase
    .from("dnd_characters")
    .select("*, dnd_xp_log(amount)")
    .order("created_at", { ascending: false });
  if (soloPublicados) consulta = consulta.eq("published", true);
  if (userId) consulta = consulta.eq("user_id", userId);

  const { data, error } = await consulta;
  lanzar(error);
  return data.map((p) => ({ ...p, xp: sumarXp(p.dnd_xp_log) }));
}

async function obtenerPersonaje(columna, valor) {
  const { data, error } = await supabase
    .from("dnd_characters")
    .select("*, dnd_xp_log(*, dnd_posts(slug, title))")
    .eq(columna, valor)
    .maybeSingle();
  lanzar(error);
  if (data) {
    data.dnd_xp_log.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  return data;
}

export const obtenerPersonajePorSlug = (slug) => obtenerPersonaje("slug", slug);
export const obtenerPersonajePorId = (id) => obtenerPersonaje("id", id);

export async function guardarPersonaje(datos, userId) {
  const fila = {};
  COLUMNAS_PERSONAJE.forEach((c) => {
    fila[c] = COLUMNAS_NUMERICAS.includes(c) ? Number(datos[c]) || 0 : datos[c];
  });

  if (datos.id) {
    const { data, error } = await supabase
      .from("dnd_characters")
      .update({ ...fila, updated_at: new Date().toISOString() })
      .eq("id", datos.id)
      .select()
      .single();
    lanzar(error);
    return data;
  }

  const { data, error } = await supabase
    .from("dnd_characters")
    .insert([{ ...fila, user_id: userId, slug: crearSlug(datos.name) }])
    .select()
    .single();
  lanzar(error);
  return data;
}

export async function eliminarPersonaje(id) {
  const { error } = await supabase.from("dnd_characters").delete().eq("id", id);
  lanzar(error);
}

/* ---------------- Experiencia ---------------- */

export async function agregarXp(filas) {
  const { error } = await supabase.from("dnd_xp_log").insert(filas);
  lanzar(error);
}

/* ---------------- Crónicas ---------------- */

export async function listarCronicas({ userId = null, soloPublicadas = true, personajeId = null } = {}) {
  let consulta = supabase
    .from("dnd_posts")
    .select("id, slug, title, body, cover_url, published, created_at, character_id, dnd_characters(name, slug)")
    .order("created_at", { ascending: false });
  if (soloPublicadas) consulta = consulta.eq("published", true);
  if (userId) consulta = consulta.eq("user_id", userId);
  if (personajeId) consulta = consulta.eq("character_id", personajeId);

  const { data, error } = await consulta;
  lanzar(error);
  return data;
}

const SELECCION_CRONICA = "*, dnd_characters(id, name, slug, portrait_url, class_name, species)";

export async function obtenerCronicaPorSlug(slug) {
  const { data, error } = await supabase.from("dnd_posts").select(SELECCION_CRONICA).eq("slug", slug).maybeSingle();
  lanzar(error);
  return data;
}

export async function obtenerCronicaPorId(id) {
  const { data, error } = await supabase.from("dnd_posts").select(SELECCION_CRONICA).eq("id", id).maybeSingle();
  lanzar(error);
  return data;
}

export async function guardarCronica(datos, userId) {
  const fila = {
    title: datos.title.trim(),
    body: datos.body,
    cover_url: datos.cover_url || null,
    character_id: datos.character_id || null,
    published: datos.published,
  };

  if (datos.id) {
    const { data, error } = await supabase
      .from("dnd_posts")
      .update({ ...fila, updated_at: new Date().toISOString() })
      .eq("id", datos.id)
      .select()
      .single();
    lanzar(error);
    return data;
  }

  const { data, error } = await supabase
    .from("dnd_posts")
    .insert([{ ...fila, user_id: userId, slug: crearSlug(datos.title) }])
    .select()
    .single();
  lanzar(error);
  return data;
}

export async function eliminarCronica(id) {
  const { error } = await supabase.from("dnd_posts").delete().eq("id", id);
  lanzar(error);
}

/* ---------------- Fotos ---------------- */

// Reduce la foto antes de subirla (máx. 900 px por lado) para no llenar el almacenamiento.
function reducirImagen(archivo, maxLado = 900, calidad = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(archivo);
    img.onload = () => {
      const escala = Math.min(1, maxLado / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * escala);
      canvas.height = Math.round(img.height * escala);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#0b0710";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("No se pudo procesar la imagen"))),
        "image/jpeg",
        calidad
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("El archivo no es una imagen válida"));
    };
    img.src = url;
  });
}

export async function subirImagen(archivo, userId) {
  const blob = await reducirImagen(archivo);
  const ruta = `${userId}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from("dnd").upload(ruta, blob, { contentType: "image/jpeg" });
  lanzar(error);
  return supabase.storage.from("dnd").getPublicUrl(ruta).data.publicUrl;
}

/* ---------------- Editores (solo admin) ---------------- */

export async function listarEditores() {
  const { data, error } = await supabase.rpc("admin_listar_editores");
  lanzar(error);
  return data;
}

export async function agregarEditor(email) {
  const { error } = await supabase.rpc("admin_agregar_editor", { p_email: email });
  lanzar(error);
}

export async function quitarEditor(userId) {
  const { error } = await supabase.rpc("admin_quitar_editor", { p_user_id: userId });
  lanzar(error);
}