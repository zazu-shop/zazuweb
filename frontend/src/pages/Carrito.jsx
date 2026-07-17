import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../lib/CartContext";
import { crearPedido } from "../lib/ordersService";
import { descargarResumenPedido } from "../lib/receiptGenerator";
import ChispasDoradas from "../components/ChispasDoradas";
import "./carrito.css";

const WHATSAPP_NUMERO = import.meta.env.VITE_WHATSAPP_NUMERO || "";

const FORM_INICIAL = {
  name: "",
  email: "",
  phone: "",
  shippingMethod: "delivery", // delivery | recojo_tienda | otros
  dni: "",
  address: "",
  reference: "",
  timeRange: "",
};

const COSTO_DELIVERY = 10;

const ETIQUETAS_ENVIO = {
  delivery: "Delivery a domicilio (Pueblo Libre y alrededores)",
  recojo_tienda: "Recojo en tienda",
  otros: "Otros (coordinamos después de tu compra)",
};

export default function Carrito() {
  const { items, updateQty, removeItem, totalPrice, clearCart } = useCart();

  const [vista, setVista] = useState("resumen"); // resumen | formulario | confirmado
  const [form, setForm] = useState(FORM_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [pedido, setPedido] = useState(null);
  const [generandoResumen, setGenerandoResumen] = useState(false);
  const [errorResumen, setErrorResumen] = useState(null);

  const costoEnvio = form.shippingMethod === "delivery" ? COSTO_DELIVERY : 0;
  const totalConEnvio = totalPrice + costoEnvio;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError(null);

    try {
      const snapshotItems = items.map((i) => ({ ...i }));
      const { orderNumber } = await crearPedido({
        cliente: form,
        items: snapshotItems,
        total: totalConEnvio,
        shipping: {
          method: form.shippingMethod,
          cost: costoEnvio,
          dni: form.dni,
          address: form.address,
          reference: form.reference,
          timeRange: form.timeRange,
        },
      });

      setPedido({
        orderNumber,
        name: form.name,
        email: form.email,
        phone: form.phone,
        items: snapshotItems,
        total: totalConEnvio,
        shippingMethod: form.shippingMethod,
        shippingCost: costoEnvio,
      });
      clearCart();
      setVista("confirmado");
    } catch (err) {
      console.error("[Zazu] Error al crear pedido:", err.message);
      setError("No se pudo registrar el pedido. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  const handleDescargarResumen = async () => {
    setGenerandoResumen(true);
    setErrorResumen(null);
    try {
      await descargarResumenPedido(pedido);
    } catch (err) {
      console.error("[Zazu] Error al generar el resumen:", err);
      setErrorResumen("No se pudo generar la imagen del resumen. Intenta de nuevo.");
    } finally {
      setGenerandoResumen(false);
    }
  };

  if (items.length === 0 && vista !== "confirmado") {
    return (
      <section className="section container zz-carrito__vacio">
        <p className="eyebrow">Tu carrito</p>
        <h1>Aún no hay nada aquí</h1>
        <p className="lead">Explora el bazar y encuentra tu próxima pieza.</p>
        <Link to="/bazar" className="btn">Ir al Bazar</Link>
      </section>
    );
  }

  const mensajeWhatsapp = pedido
    ? encodeURIComponent(
        `Hola Zazu Shop, soy ${pedido.name}. Ya yapeé mi pedido ${pedido.orderNumber} por S/ ${pedido.total.toFixed(2)} (envío: ${ETIQUETAS_ENVIO[pedido.shippingMethod]}). Les adjunto la captura del pago.`
      )
    : "";

  return (
    <section className="section">
      {vista === "confirmado" && <ChispasDoradas />}
      <div className="container zz-carrito">
        {/* ---- Columna izquierda: items del carrito o resumen del pedido confirmado ---- */}
        <div className="zz-carrito__col-izq">
          <p className="eyebrow">{vista === "confirmado" ? "Pedido registrado" : "Tu carrito"}</p>
          <h1>{vista === "confirmado" ? pedido.orderNumber : "Piezas seleccionadas"}</h1>

          <div className="zz-carrito__lista">
            {(vista === "confirmado" ? pedido.items : items).map((item) => (
              <div className="zz-carrito__item" key={item.id}>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} />
                ) : (
                  <div className="zz-carrito__item-placeholder" />
                )}

                <div className="zz-carrito__item-info">
                  <h3>{item.name}</h3>
                  <p className="zz-carrito__item-price">S/ {item.price}</p>
                </div>

                {vista === "confirmado" ? (
                  <span className="zz-carrito__item-qty-static">×{item.qty}</span>
                ) : (
                  <div className="zz-carrito__item-qty">
                    <button onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                  </div>
                )}

                <p className="zz-carrito__item-subtotal">
                  S/ {(item.qty * Number(item.price)).toFixed(2)}
                </p>

                {vista !== "confirmado" && (
                  <button className="zz-carrito__remove" onClick={() => removeItem(item.id)} aria-label="Quitar">
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {vista !== "confirmado" && (
            <div className="zz-carrito__resumen">
              <button className="btn btn-ghost" onClick={clearCart}>Vaciar carrito</button>
              <p className="zz-carrito__total">Total: S/ {totalPrice.toFixed(2)}</p>
            </div>
          )}

          {vista === "confirmado" && (
            <p className="zz-carrito__envio-info">
              Envío: {ETIQUETAS_ENVIO[pedido.shippingMethod]}
              {pedido.shippingCost > 0 && ` — S/ ${pedido.shippingCost.toFixed(2)}`}
            </p>
          )}
        </div>

        {/* ---- Columna derecha: resumen / formulario / confirmación ---- */}
        <aside className="zz-carrito__col-der">
          {vista === "resumen" && (
            <div className="zz-panel">
              <h2>Resumen</h2>
              {items.map((item) => (
                <div className="zz-checkout__linea" key={item.id}>
                  <span>{item.name} × {item.qty}</span>
                  <span>S/ {(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
              <div className="zz-checkout__linea zz-checkout__total">
                <span>Total</span>
                <span>S/ {totalPrice.toFixed(2)}</span>
              </div>
              <button className="btn zz-panel__cta" onClick={() => setVista("formulario")}>
                Proceder al pago →
              </button>
            </div>
          )}

          {vista === "formulario" && (
            <div className="zz-panel">
              <h2>Tus datos</h2>
              <form className="zz-form" onSubmit={handleSubmit}>
                <label>
                  Nombre completo
                  <input type="text" name="name" value={form.name} onChange={handleChange} required />
                </label>
                <label>
                  Correo
                  <input type="email" name="email" value={form.email} onChange={handleChange} required />
                </label>
                <label>
                  Celular (WhatsApp)
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} required />
                </label>

                <fieldset className="zz-envio">
                  <legend>Método de envío</legend>

                  <label className="zz-envio__opcion">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="delivery"
                      checked={form.shippingMethod === "delivery"}
                      onChange={handleChange}
                    />
                    <span>Delivery — Pueblo Libre y alrededores (S/ {COSTO_DELIVERY.toFixed(2)})</span>
                  </label>

                  <label className="zz-envio__opcion">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="recojo_tienda"
                      checked={form.shippingMethod === "recojo_tienda"}
                      onChange={handleChange}
                    />
                    <span>Recojo en tienda (gratis)</span>
                  </label>

                  <label className="zz-envio__opcion">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="otros"
                      checked={form.shippingMethod === "otros"}
                      onChange={handleChange}
                    />
                    <span>Otros — lo coordinamos después de tu compra (gratis)</span>
                  </label>
                </fieldset>

                {form.shippingMethod === "delivery" && (
                  <div className="zz-envio__campos">
                    <label>
                      DNI
                      <input type="text" name="dni" value={form.dni} onChange={handleChange} required />
                    </label>
                    <label>
                      Dirección exacta
                      <input type="text" name="address" value={form.address} onChange={handleChange} required />
                    </label>
                    <label>
                      Referencia
                      <input type="text" name="reference" value={form.reference} onChange={handleChange} />
                    </label>
                    <label>
                      Rango horario deseado
                      <input
                        type="text"
                        name="timeRange"
                        placeholder="Ej. 3pm — 6pm"
                        value={form.timeRange}
                        onChange={handleChange}
                        required
                      />
                    </label>
                  </div>
                )}

                <div className="zz-checkout__linea zz-checkout__total">
                  <span>Total con envío</span>
                  <span>S/ {totalConEnvio.toFixed(2)}</span>
                </div>

                <button className="btn" type="submit" disabled={enviando}>
                  {enviando ? "Generando pedido…" : "Generar número de pedido"}
                </button>

                {error && <p className="zz-form__status zz-form__status--error">{error}</p>}
              </form>
              <button className="zz-panel__back" onClick={() => setVista("resumen")}>
                ← Volver al resumen
              </button>
            </div>
          )}

          {vista === "confirmado" && (
            <div className="zz-panel zz-panel--confirmado">
              <h2>Paga con Yape</h2>
              <img src="/pago/yape-qr.png" alt="Código QR de Yape de Zazu Shop" className="zz-checkout__qr" />
              <p className="zz-panel__monto">S/ {pedido.total.toFixed(2)}</p>

              <p className="zz-panel__instrucciones">
                1. Escanea el QR y paga el monto exacto.<br />
                2. Toma una captura del pago.<br />
                3. Envíanosla por WhatsApp mencionando tu número de pedido{" "}
                <strong>{pedido.orderNumber}</strong>.
              </p>

              <div className="zz-panel__acciones">
                {WHATSAPP_NUMERO ? (
                  <a
                    className="btn"
                    href={`https://wa.me/${WHATSAPP_NUMERO}?text=${mensajeWhatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Enviar captura por WhatsApp
                  </a>
                ) : (
                  <p className="zz-checkout__aviso">
                    Falta configurar <code>VITE_WHATSAPP_NUMERO</code> en <code>frontend/.env</code>.
                  </p>
                )}

                <button className="btn btn-ghost" onClick={handleDescargarResumen} disabled={generandoResumen}>
                  {generandoResumen ? "Generando…" : "Descargar resumen del pedido"}
                </button>
              </div>

              {errorResumen && (
                <p className="zz-form__status zz-form__status--error">{errorResumen}</p>
              )}

              <Link to="/bazar" className="zz-panel__back">Seguir explorando el Bazar</Link>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}