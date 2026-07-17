const express = require("express");
const { supabase } = require("../lib/supabaseClient");

const router = express.Router();

// GET /api/products — lista todas las piezas del bazar
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, price, category, image_url, stock, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Zazu] Error al leer products:", error.message);
    return res.status(500).json({ error: "No se pudo leer el catálogo." });
  }

  res.json(data);
});

// GET /api/products/:id — detalle de una pieza
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return res.status(404).json({ error: "Pieza no encontrada." });
  }

  res.json(data);
});

module.exports = router;