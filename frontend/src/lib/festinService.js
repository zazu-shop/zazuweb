import { supabase } from "./supabaseClient";

export async function obtenerFestin(slug) {
  const { data: festin, error } = await supabase
    .from("feasts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!festin) return null;

  const { data: items, error: errorItems } = await supabase
    .from("feast_items")
    .select("*")
    .eq("feast_id", festin.id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (errorItems) throw new Error(errorItems.message);
  return { festin, items };
}

// El servidor valida stock y toma los precios de la base de datos; lo que
// mande el navegador solo cuenta como "qué piezas y cuántas".
export async function crearPedidoFestin({ feastId, name, phone, items, payLater = false, commitmentDate = null }) {
  const { data, error } = await supabase.rpc("crear_pedido_festin", {
    p_feast_id: feastId,
    p_name: name,
    p_phone: phone,
    p_items: items.map(({ itemId, qty }) => ({ item_id: itemId, qty })),
    p_pay_later: payLater,
    p_commitment_date: payLater ? commitmentDate : null,
  });
  if (error) throw new Error(error.message);
  return data; // { order_number, total, lines: [{ name, price, qty }] }
}

export async function buscarPedidoFestin(orderNumber, phone) {
  const { data, error } = await supabase.rpc("buscar_pedido_festin", {
    p_order_number: orderNumber,
    p_phone: phone,
  });
  if (error) throw new Error(error.message);
  return data; // null si no coincide
}