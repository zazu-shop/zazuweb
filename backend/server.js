require("dotenv").config();
const express = require("express");
const cors = require("cors");

const productsRouter = require("./routes/products");
const contactRouter = require("./routes/contact");
const ordersRouter = require("./routes/orders");

const app = express();
const PORT = process.env.PORT || 4000;

// En producción, restringe esto a tu dominio de Vercel en vez de "*"
const allowedOrigin = process.env.FRONTEND_URL || "*";
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ ok: true, service: "zazu-backend" });
});

app.use("/api/products", productsRouter);
app.use("/api/contact", contactRouter);
app.use("/api/orders", ordersRouter);

// Manejo básico de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada." });
});

app.listen(PORT, () => {
  console.log(`[Zazu] Backend escuchando en http://localhost:${PORT}`);
});