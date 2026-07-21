import { supabase } from "./supabaseClient";

export async function obtenerMiCodigoReferido() {
  const { data, error } = await supabase.rpc("obtener_o_crear_codigo_referido");
  if (error) throw new Error(error.message);
  return data;
}

export async function validarCodigoReferido(code) {
  if (!code?.trim()) return null;
  const { data, error } = await supabase.rpc("validar_codigo_referido", { p_code: code.trim() });
  if (error) return null;
  return data; // user_id dueño del código, o null
}

export async function otorgarSelloReferido(code, orderId) {
  await supabase.rpc("otorgar_sello_referido", { p_code: code, p_order_id: orderId });
}

export async function registrarSelloCompra(userId, orderId) {
  if (!userId) return;
  await supabase.from("loyalty_stamps").insert([{ user_id: userId, motivo: "compra", order_id: orderId }]);
}

export async function contarSellos(userId) {
  const { count } = await supabase
    .from("loyalty_stamps")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);
  return count || 0;
}