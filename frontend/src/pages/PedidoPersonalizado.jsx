import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "./pedidoPersonalizado.css";

const ESTADO_INICIAL = {
  name: "",
  email: "",
  phone: "",
  message: "",
  budget: "",
  reference_notes: "",
};

const WHATSAPP_NUMERO = import.meta.env.VITE_WHATSAPP_NUMERO || "";

export default function PedidoPersonalizado() {
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [envio, setEnvio] = useState("idle"); // idle | enviando | ok | error | sin-config

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!supabase) {
      setEnvio("sin-config");
      return;
    }

    setEnvio("enviando");

    const { error } = await supabase.from("contact_messages").insert([form]);

    if (error) {
      console.error("[Zazu] Error al guardar el encargo:", error.message);
      setEnvio("error");
      return;
    }

    setEnvio("ok");
    setForm(ESTADO_INICIAL);
  };

  const mensajeWhatsapp = encodeURIComponent(
    "Hola Zazu Shop, quiero contarles la idea de una pieza personalizada."
  );

  if (envio === "ok") {
    return (
      <section className="section container zz-pedido-personalizado zz-pedido-personalizado--ok">
        <p className="eyebrow">Encargo recibido</p>
        <h1>Tu idea ya está con nosotros</h1>
        <p className="lead">
          Revisamos cada encargo a mano — te contactaremos por correo o celular en un plazo de
          hasta dos días con una propuesta y un precio estimado.
        </p>
        {WHATSAPP_NUMERO && (
          <a
            className="btn"
            href={`https://wa.me/${WHATSAPP_NUMERO}?text=${mensajeWhatsapp}`}
            target="_blank"
            rel="noreferrer"
          >
            Adelantar por WhatsApp
          </a>
        )}
        <button className="btn btn-ghost" onClick={() => setEnvio("idle")} style={{ marginTop: "1rem" }}>
          Enviar otro encargo
        </button>
      </section>
    );
  }

  return (
    <section className="section zz-pedido-personalizado">
      <div className="container zz-pedido-personalizado__inner">
        <div>
          <p className="eyebrow">Pedido personalizado</p>
          <h1>Encárganos una pieza a tu medida</h1>
          <p className="lead">
            ¿Tienes en mente un amuleto, grimorio o vela que no está en el Bazar? Cuéntanos la
            idea y la tallamos para ti.
          </p>

          <div className="zz-pedido-personalizado__aviso">
            <p>
              <strong>Antes de enviar tu idea:</strong> trabajamos encargos que se acercan a las
              piezas que ya ves en el <a href="/bazar">Bazar</a> o a nuestro estilo — esotérico,
              medieval y de fantasía, hecho a mano. Si tu idea calza con eso, ¡adelante! Si es muy
              distinta a lo que trabajamos, es probable que no podamos tomar el encargo.
            </p>
          </div>

          <div className="zz-pedido-personalizado__tips">
            <p className="eyebrow">Para que la propuesta sea más precisa</p>
            <ul>
              <li>Describe el tipo de pieza y su uso (ritual, decoración, regalo…)</li>
              <li>Menciona materiales o colores que tengas en mente</li>
              <li>Si tienes una imagen de referencia, cuéntanoslo — la pedimos por WhatsApp</li>
              <li>Un rango de presupuesto nos ayuda a ajustar la propuesta</li>
            </ul>
          </div>
        </div>

        <form className="zz-form" onSubmit={handleSubmit}>
          <label>
            Nombre
            <input type="text" name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label>
            Correo
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>

          <label>
            Celular (opcional, para WhatsApp)
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} />
          </label>

          <label>
            Describe la pieza que imaginas
            <textarea
              name="message"
              rows="5"
              value={form.message}
              onChange={handleChange}
              required
              placeholder="Ej. Un amuleto de cuervo en madera oscura, con una piedra púrpura engastada, para usar como colgante..."
            />
          </label>

          <label>
            Presupuesto aproximado (opcional)
            <input
              type="text"
              name="budget"
              value={form.budget}
              onChange={handleChange}
              placeholder="Ej. S/ 80 - S/ 150"
            />
          </label>

          <label>
            Referencias o notas adicionales (opcional)
            <textarea
              name="reference_notes"
              rows="3"
              value={form.reference_notes}
              onChange={handleChange}
              placeholder="Ej. Vi algo parecido en tu Instagram, o tengo una foto de inspiración"
            />
          </label>

          <button className="btn" type="submit" disabled={envio === "enviando"}>
            {envio === "enviando" ? "Enviando…" : "Enviar mi idea"}
          </button>

          {envio === "sin-config" && (
            <p className="zz-form__status zz-form__status--error">
              Falta conectar Supabase: crea <code>frontend/.env</code> con
              <code> VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code>.
            </p>
          )}
          {envio === "error" && (
            <p className="zz-form__status zz-form__status--error">
              No se pudo enviar. Intenta de nuevo en unos minutos.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}