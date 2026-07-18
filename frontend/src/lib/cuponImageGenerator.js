function cargarImagen(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Genera y descarga una imagen 1080x1920 (formato historia de Instagram)
 * con el código de cupón, lista para publicar.
 */
export async function descargarImagenCupon(cupon) {
  try {
    await document.fonts.load('700 90px Cinzel');
    await document.fonts.load('600 40px "JetBrains Mono"');
  } catch {
    // seguimos con fuentes del sistema si no cargan a tiempo
  }

  const logo = await cargarImagen("/logo/icon-white.png");

  const width = 1080;
  const height = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // Fondo con leve viñeta púrpura (coherente con el sitio)
  const gradiente = ctx.createRadialGradient(width / 2, height * 0.35, 100, width / 2, height * 0.35, width);
  gradiente.addColorStop(0, "#1d1428");
  gradiente.addColorStop(1, "#0b0710");
  ctx.fillStyle = gradiente;
  ctx.fillRect(0, 0, width, height);

  // Marco dorado
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 6;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  // Logo
  if (logo) {
    const logoW = 220;
    const logoH = logoW * (logo.height / logo.width);
    ctx.drawImage(logo, width / 2 - logoW / 2, 160, logoW, logoH);
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#ece3ce";
  ctx.font = "600 54px Cinzel, serif";
  ctx.fillText("ZAZU SHOP", width / 2, 480);

  ctx.font = "400 34px 'EB Garamond', serif";
  ctx.fillStyle = "#b9ae95";
  ctx.fillText("tiene un cupón para ti", width / 2, 540);

  // Descuento grande
  ctx.font = "700 220px Cinzel, serif";
  ctx.fillStyle = "#e8c468";
  ctx.fillText(`${cupon.discount_percent}%`, width / 2, 900);

  ctx.font = "600 44px 'EB Garamond', serif";
  ctx.fillStyle = "#ece3ce";
  ctx.fillText("de descuento", width / 2, 970);

  // Código del cupón, como si fuera un sello
  const cajaY = 1120;
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 3;
  ctx.strokeRect(width / 2 - 260, cajaY, 520, 130);
  ctx.font = "700 60px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#e8c468";
  ctx.fillText(cupon.code, width / 2, cajaY + 82);

  ctx.font = "400 30px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#b9ae95";
  ctx.fillText("Usa este código en tu compra", width / 2, cajaY + 210);

  if (cupon.expires_at) {
    const fecha = new Date(cupon.expires_at).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    ctx.font = "400 28px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#7a7085";
    ctx.fillText(`Válido hasta el ${fecha}`, width / 2, cajaY + 260);
  }

  ctx.font = "400 30px 'EB Garamond', serif";
  ctx.fillStyle = "#b9ae95";
  ctx.fillText("Objetos con memoria, hechos a mano", width / 2, height - 140);

  const enlace = document.createElement("a");
  enlace.download = `cupon-${cupon.code}.png`;
  enlace.href = canvas.toDataURL("image/png");
  enlace.click();
}