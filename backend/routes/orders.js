const express = require("express");

const router = express.Router();

// POST /api/orders/send-confirmation
// Envía al cliente (y opcionalmente a ti) el correo con el resumen del
// pedido. Usa Resend (https://resend.com) — capa gratuita disponible.
router.post("/send-confirmation", async (req, res) => {
  const { orderNumber, customerName, customerEmail, items, total } = req.body;

  if (!orderNumber || !customerEmail || !items) {
    return res.status(400).json({ error: "Faltan datos del pedido." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const storeOwnerEmail = process.env.STORE_OWNER_EMAIL; // opcional, para copiarte el pedido

  if (!apiKey || !fromEmail) {
    console.warn(
      "[Zazu] Falta RESEND_API_KEY o RESEND_FROM_EMAIL en backend/.env — no se envió el correo."
    );
    return res
      .status(200)
      .json({ ok: false, warning: "Correo no configurado en el servidor." });
  }

  const filasItems = items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${i.name} × ${i.qty}</td><td style="padding:6px 0;text-align:right">S/ ${(
          i.price * i.qty
        ).toFixed(2)}</td></tr>`
    )
    .join("");

  const html = `
    <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="letter-spacing: 2px;">ZAZU SHOP</h2>
      <p>Hola ${customerName || ""}, recibimos tu pedido <strong>${orderNumber}</strong>.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        ${filasItems}
      </table>
      <p style="font-size: 1.1em;"><strong>Total: S/ ${Number(total).toFixed(2)}</strong></p>
      <p>Pago por Yape: escanea el QR que te mostramos en el checkout y envíanos
      el comprobante por WhatsApp mencionando tu número de pedido
      <strong>${orderNumber}</strong>. Confirmaremos tu pedido en cuanto lo verifiquemos.</p>
      <p style="margin-top: 24px; font-size: 0.85em; color: #666;">Zazu Shop — objetos con memoria, hechos a mano.</p>
    </div>
  `;

  try {
    const destinatarios = [customerEmail];

    const respuesta = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: destinatarios,
        bcc: storeOwnerEmail || undefined,
        subject: `Pedido ${orderNumber} recibido — Zazu Shop`,
        html,
      }),
    });

    if (!respuesta.ok) {
      const detalle = await respuesta.text();
      console.error("[Zazu] Error de Resend:", detalle);
      return res.status(200).json({ ok: false, warning: "No se pudo enviar el correo." });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("[Zazu] Error al enviar correo:", err.message);
    res.status(200).json({ ok: false, warning: "No se pudo enviar el correo." });
  }
});

module.exports = router;