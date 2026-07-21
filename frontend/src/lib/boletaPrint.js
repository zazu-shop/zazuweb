const ETIQUETAS_ENVIO = {
  delivery: "Delivery a domicilio",
  recojo_tienda: "Recojo en tienda",
  otros: "Por coordinar",
};

/**
 * Abre una ventana nueva con una boleta de entrega estilo pergamino/sello
 * antiguo, lista para imprimir. Es un documento HTML independiente (no
 * comparte los estilos del sitio) para que la impresión salga limpia.
 */
export function imprimirBoleta(pedido) {
  const ventana = window.open("", "_blank", "width=650,height=850");
  if (!ventana) return;

  const filasItems = pedido.order_items
    .map(
      (item) => `
        <tr>
          <td>${item.name}</td>
          <td style="text-align:center">${item.qty}</td>
          <td style="text-align:right">S/ ${(item.price * item.qty).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const fecha = new Date(pedido.created_at).toLocaleDateString("es-PE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = `
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Boleta ${pedido.order_number}</title>
<style>
  @page { size: A5; margin: 0; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 28px;
    font-family: 'Georgia', 'EB Garamond', serif;
    background: #f2e8d0;
    color: #2b1f14;
    background-image:
      radial-gradient(circle at 15% 20%, rgba(139,111,71,0.15), transparent 40%),
      radial-gradient(circle at 85% 80%, rgba(139,111,71,0.15), transparent 40%);
  }
  .marco {
    border: 3px double #6b4f2a;
    padding: 26px;
    position: relative;
    min-height: 90vh;
  }
  .marco::before {
    content: "";
    position: absolute;
    inset: 8px;
    border: 1px solid #8b6f47;
    pointer-events: none;
  }
  .encabezado { text-align: center; margin-bottom: 18px; }
  .encabezado h1 {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 26px;
    letter-spacing: 4px;
    margin: 0 0 4px;
    color: #3a2a15;
  }
  .encabezado p { margin: 2px 0; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #6b4f2a; }
  .sello {
    position: absolute;
    top: 20px;
    right: 26px;
    width: 90px;
  }
  .sello img {
    width: 100%;
    display: block;
    opacity: 0.92;
  }
  .datos { margin: 22px 0; font-size: 13px; line-height: 1.8; }
  .datos strong { color: #3a2a15; }
  table { width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 13px; }
  th {
    text-align: left;
    border-bottom: 1px solid #8b6f47;
    padding: 6px 4px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #6b4f2a;
  }
  td { padding: 7px 4px; border-bottom: 1px dotted #8b6f47; }
  .total-fila td { border-bottom: none; font-weight: bold; font-size: 15px; padding-top: 12px; }
  .pie {
    margin-top: 40px;
    text-align: center;
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #6b4f2a;
  }
</style>
</head>
<body onload="window.print()">
  <div class="marco">
    <div class="sello"><img src="${window.location.origin}/logo/logo-original.png" alt="" /></div>
    <div class="encabezado">
      <h1>Zazu Shop</h1>
      <p>Boleta de entrega</p>
    </div>

    <div class="datos">
      <strong>N.º de pedido:</strong> ${pedido.order_number}<br/>
      <strong>Fecha:</strong> ${fecha}<br/>
      <strong>Cliente:</strong> ${pedido.customer_name}<br/>
      <strong>Celular:</strong> ${pedido.customer_phone || "—"}<br/>
      <strong>Envío:</strong> ${ETIQUETAS_ENVIO[pedido.shipping_method] || pedido.shipping_method}<br/>
      ${pedido.shipping_address ? `<strong>Dirección:</strong> ${pedido.shipping_address}<br/>` : ""}
      ${pedido.shipping_reference ? `<strong>Referencia:</strong> ${pedido.shipping_reference}<br/>` : ""}
    </div>

    <table>
      <thead>
        <tr><th>Pieza</th><th style="text-align:center">Cant.</th><th style="text-align:right">Subtotal</th></tr>
      </thead>
      <tbody>
        ${filasItems}
        ${pedido.shipping_cost > 0 ? `<tr><td>Envío</td><td></td><td style="text-align:right">S/ ${Number(pedido.shipping_cost).toFixed(2)}</td></tr>` : ""}
        <tr class="total-fila"><td colspan="2">TOTAL</td><td style="text-align:right">S/ ${Number(pedido.total).toFixed(2)}</td></tr>
      </tbody>
    </table>

    <p class="pie">Objetos con memoria, hechos a mano</p>
  </div>
</body>
</html>`;

  ventana.document.write(html);
  ventana.document.close();
}