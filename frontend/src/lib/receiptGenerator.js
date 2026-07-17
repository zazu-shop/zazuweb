function cargarImagen(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    // Si el logo no carga (ruta faltante, etc.) seguimos sin él en vez de
    // romper la descarga completa del resumen.
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

const ETIQUETAS_ENVIO = {
  delivery: "Delivery a domicilio",
  recojo_tienda: "Recojo en tienda",
  otros: "Por coordinar",
};

/**
 * Dibuja un resumen de pedido estilo recibo/catálogo (con el logo de Zazu)
 * en un <canvas>, en formato vertical (cómodo de ver en celular), y
 * dispara su descarga como PNG. No depende de ningún servicio externo:
 * todo ocurre en el navegador del cliente.
 */
export async function descargarResumenPedido(pedido) {
  try {
    await document.fonts.load('600 30px Cinzel');
    await document.fonts.load('16px "EB Garamond"');
    await document.fonts.load('600 18px "JetBrains Mono"');
  } catch {
    // Si las fuentes no cargan a tiempo, seguimos con las del sistema.
  }

  const logo = await cargarImagen("/logo/icon-white.png");

  const width = 540;
  const lineHeight = 32;
  const extraEnvio = pedido.shippingMethod ? 30 : 0;
  const height = 720 + pedido.items.length * lineHeight + extraEnvio;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // Fondo
  ctx.fillStyle = "#0b0710";
  ctx.fillRect(0, 0, width, height);

  // Borde dorado
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, width - 36, height - 36);

  // Logo (si no se pudo cargar, seguimos sin él)
  if (logo) {
    const logoW = 68;
    const logoH = logoW * (logo.height / logo.width);
    ctx.drawImage(logo, width / 2 - logoW / 2, 50, logoW, logoH);
  }

  // Título
  ctx.textAlign = "center";
  ctx.fillStyle = "#ece3ce";
  ctx.font = "600 28px Cinzel, serif";
  ctx.fillText("ZAZU SHOP", width / 2, 160);

  ctx.font = "400 15px 'EB Garamond', serif";
  ctx.fillStyle = "#b9ae95";
  ctx.fillText("Resumen de tu pedido", width / 2, 184);

  // Número de pedido y fecha
  ctx.font = "600 20px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#e8c468";
  ctx.fillText(pedido.orderNumber, width / 2, 224);

  ctx.font = "400 13px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#b9ae95";
  const fecha = new Date().toLocaleDateString("es-PE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  ctx.fillText(fecha, width / 2, 246);

  // Cliente
  let y = 292;
  ctx.textAlign = "left";
  ctx.font = "400 15px 'EB Garamond', serif";
  ctx.fillStyle = "#ece3ce";
  ctx.fillText(`Cliente: ${pedido.name}`, 40, y);

  if (pedido.shippingMethod) {
    y += 26;
    ctx.font = "400 14px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#b9ae95";
    ctx.fillText(`Envío: ${ETIQUETAS_ENVIO[pedido.shippingMethod] || pedido.shippingMethod}`, 40, y);
  }

  y += 26;
  ctx.strokeStyle = "rgba(201,162,39,0.35)";
  ctx.beginPath();
  ctx.moveTo(40, y);
  ctx.lineTo(width - 40, y);
  ctx.stroke();

  // Items
  y += 34;
  pedido.items.forEach((item) => {
    ctx.textAlign = "left";
    ctx.font = "400 15px 'EB Garamond', serif";
    ctx.fillStyle = "#ece3ce";
    ctx.fillText(`${item.name}  ×${item.qty}`, 40, y);

    ctx.textAlign = "right";
    ctx.font = "400 15px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#e8c468";
    ctx.fillText(`S/ ${(item.price * item.qty).toFixed(2)}`, width - 40, y);

    y += lineHeight;
  });

  // Envío (si aplica costo)
  if (pedido.shippingCost) {
    ctx.textAlign = "left";
    ctx.font = "400 14px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#b9ae95";
    ctx.fillText("Costo de envío", 40, y);
    ctx.textAlign = "right";
    ctx.fillText(`S/ ${Number(pedido.shippingCost).toFixed(2)}`, width - 40, y);
    y += lineHeight;
  }

  // Total
  y += 6;
  ctx.strokeStyle = "rgba(201,162,39,0.35)";
  ctx.beginPath();
  ctx.moveTo(40, y);
  ctx.lineTo(width - 40, y);
  ctx.stroke();
  y += 38;

  ctx.textAlign = "left";
  ctx.font = "600 21px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#ece3ce";
  ctx.fillText("TOTAL", 40, y);

  ctx.textAlign = "right";
  ctx.fillStyle = "#e8c468";
  ctx.fillText(`S/ ${pedido.total.toFixed(2)}`, width - 40, y);

  // Mensaje de agradecimiento
  y += 70;
  ctx.textAlign = "center";
  ctx.font = "600 20px Cinzel, serif";
  ctx.fillStyle = "#e8c468";
  ctx.fillText("¡Gracias por tu compra!", width / 2, y);

  y += 26;
  ctx.font = "400 14px 'EB Garamond', serif";
  ctx.fillStyle = "#b9ae95";
  ctx.fillText("Cada pieza de Zazu lleva algo de magia consigo.", width / 2, y);

  // Pie
  ctx.font = "400 12px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#7a7085";
  ctx.fillText("Objetos con memoria, hechos a mano", width / 2, height - 34);

  const enlace = document.createElement("a");
  enlace.download = `pedido-${pedido.orderNumber}.png`;
  enlace.href = canvas.toDataURL("image/png");
  enlace.click();
}