const express = require("express");
const { supabase } = require("../lib/supabaseClient");

const router = express.Router();

// POST /api/contact — guarda el mensaje del formulario de contacto
router.post("/", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Faltan campos obligatorios." });
  }

  const { error } = await supabase
    .from("contact_messages")
    .insert([{ name, email, message }]);

  if (error) {
    console.error("[Zazu] Error al guardar mensaje:", error.message);
    return res.status(500).json({ error: "No se pudo enviar el mensaje." });
  }

  res.status(201).json({ ok: true });
});

module.exports = router;
