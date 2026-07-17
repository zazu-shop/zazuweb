import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "./seguimiento.css";

const ESTADOS_LABEL = {
  pendiente_verificacion: "Pendiente de verificación",
  pagado: "Pagado",
  cancelado: "Cancelado",
};

const ENVIO_LABEL = {
  delivery: "Delivery a domicilio",
  recojo_tienda: "Recojo en tienda",
  otros: "Por coordinar",
};

const FORM_INICIAL = { orderNumber: "", email: "" };

export default function Seguimiento() {
  const [form, setForm] = useState(FORM_INICIAL);
  const [estado, setEstado] = useState("form"); // form | buscando | encontrado | no-encontrado | error
  const [pedido, setPedido] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEstado("buscando");

    if (!supabase) {
      setEstado("error");
      return;
    }

    const { data, error } = await supabase.rpc("buscar_pedido", {
      p_order_number: form.orderNumber.trim(),
      p_email: form.email.trim(),
    });

    if (error) {
      console.error("[Zazu] Error al buscar pedido:", error.message);
      setEstado("error");
      return;
    }

    if (!data) {
      setEstado("no-encontrado");
      return;
    }

    setPedido(data);
    setEstado("encontrado");
  };

  const buscarOtro = () => {
    setEstado("form");
    setPedido(null);
    setForm(FORM_INICIAL);
  };

  return (
    <section className="section container zz-seguimiento">
      <p className="eyebrow">Seguimiento de pedido</p>
      <h1>¿Cómo va tu pedido?</h1>
      <p className="lead zz-seguimiento__intro">
        Ingresa tu número de pedido y el correo que usaste al comprar para ver el resumen y el
        estado actual. Esto no rastrea el envío en tiempo real, solo el estado que registramos.
      </p>

      {(estado === "form" || estado === "buscando") && (
        <form className="zz-form zz-seguimiento__form" onSubmit={handleSubmit}>
          <label>
            Número de pedido
            <input
              type="text"
              name="orderNumber"
              placeholder="ZZ-XXXXXX"
              value={form.orderNumber}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Correo usado en la compra
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <button className="btn" type="submit" disabled={estado === "buscando"}>
            {estado === "buscando" ? "Buscando…" : "Consultar pedido"}
          </button>
        </form>
      )}

      {estado === "no-encontrado" && (
        <div className="zz-seguimiento__resultado">
          <p className="zz-form__status zz-form__status--error">
            No encontramos un pedido con esos datos. Revisa que el número de pedido y el correo
            sean exactamente los que usaste al comprar.
          </p>
          <button className="btn btn-ghost" onClick={buscarOtro}>Intentar de nuevo</button>
        </div>
      )}

      {estado === "error" && (
        <div className="zz-seguimiento__resultado">
          <p className="zz-form__status zz-form__status--error">
            No se pudo consultar tu pedido en este momento. Intenta de nuevo en unos minutos.
          </p>
        </div>
      )}

      {estado === "encontrado" && pedido && (
        <div className="zz-seguimiento__resultado">
          <div className="zz-panel">
            <div className="zz-seguimiento__header">
              <div>
                <p className="eyebrow">Pedido</p>
                <h2>{pedido.order_number}</h2>
              </div>
              <span className={`zz-admin__badge zz-admin__badge--${pedido.status}`}>
                {ESTADOS_LABEL[pedido.status] || pedido.status}
              </span>
            </div>

            <p className="zz-seguimiento__fecha">
              Realizado el {new Date(pedido.created_at).toLocaleDateString("es-PE", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            <div className="zz-seguimiento__items">
              {pedido.items?.map((item, i) => (
                <div className="zz-checkout__linea" key={i}>
                  <span>{item.name} × {item.qty}</span>
                  <span>S/ {(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
              {pedido.shipping_cost > 0 && (
                <div className="zz-checkout__linea">
                  <span>Envío</span>
                  <span>S/ {Number(pedido.shipping_cost).toFixed(2)}</span>
                </div>
              )}
              <div className="zz-checkout__linea zz-checkout__total">
                <span>Total</span>
                <span>S/ {Number(pedido.total).toFixed(2)}</span>
              </div>
            </div>

            <p className="zz-seguimiento__envio">
              Método de envío: {ENVIO_LABEL[pedido.shipping_method] || pedido.shipping_method}
            </p>
          </div>

          <button className="btn btn-ghost zz-seguimiento__otro" onClick={buscarOtro}>
            Consultar otro pedido
          </button>
        </div>
      )}
    </section>
  );
}