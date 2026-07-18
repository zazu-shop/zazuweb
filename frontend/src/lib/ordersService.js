import { supabase } from "./supabaseClient";

/**
 * Genera un número de pedido legible, ej. "ZZ-9F3K21".
 * Se hace en el navegador para que el cliente lo vea al instante, sin
 * depender de una segunda consulta a Supabase.
 */
function generarNumeroPedido() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const azar = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `ZZ-${timestamp}${azar}`;
}

/**
 * Crea un pedido y sus items en Supabase. Devuelve { orderId, orderNumber }
 * ya conocidos por el cliente (no dependemos de leer de vuelta la fila,
 * así no hace falta abrir permiso de lectura pública sobre pedidos).
 */
export async function crearPedido({ cliente, items, total, paymentMethod = "yape_manual", shipping = {}, coupon = null, userId = null }) {
  if (!supabase) {
    throw new Error("Supabase no está configurado (revisa frontend/.env).");
  }

  const orderId = crypto.randomUUID();
  const orderNumber = generarNumeroPedido();

  const { error: errorPedido } = await supabase.from("orders").insert([
    {
      id: orderId,
      order_number: orderNumber,
      customer_name: cliente.name,
      customer_email: cliente.email,
      customer_phone: cliente.phone || null,
      total,
      payment_method: paymentMethod,
      status: "pendiente_verificacion",
      shipping_method: shipping.method || "otros",
      shipping_cost: shipping.cost || 0,
      shipping_dni: shipping.dni || null,
      shipping_address: shipping.address || null,
      shipping_reference: shipping.reference || null,
      shipping_time_range: shipping.timeRange || null,
      coupon_code: coupon?.code || null,
      discount_amount: coupon?.discountAmount || 0,
      user_id: userId,
    },
  ]);

  if (errorPedido) {
    throw new Error(errorPedido.message);
  }

  const filasItems = items.map((item) => ({
    order_id: orderId,
    product_id: item.id,
    name: item.name,
    price: item.price,
    qty: item.qty,
  }));

  const { error: errorItems } = await supabase.from("order_items").insert(filasItems);

  if (errorItems) {
    throw new Error(errorItems.message);
  }

  // Reservamos el stock al crear el pedido (no al confirmarse el pago),
  // así dos personas no pueden comprar la última unidad al mismo tiempo
  // mientras se verifica el Yape. Si el pedido se cancela, se restaura.
  const itemsParaStock = items.map((item) => ({ product_id: item.id, qty: item.qty }));
  const { error: errorStock } = await supabase.rpc("decrementar_stock_pedido", {
    items: itemsParaStock,
  });

  if (errorStock) {
    // No bloqueamos el pedido por esto (ya se creó), pero lo dejamos en
    // consola para que puedas detectarlo si pasa seguido.
    console.error("[Zazu] No se pudo descontar el stock:", errorStock.message);
  }

  return { orderId, orderNumber };
}