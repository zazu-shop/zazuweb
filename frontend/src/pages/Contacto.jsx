import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "./contacto.css";

const ESTADO_INICIAL = { name: "", email: "", message: "" };

export default function Contacto() {
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
      console.error("[Zazu] Error al guardar mensaje:", error.message);
      setEnvio("error");
      return;
    }

    setEnvio("ok");
    setForm(ESTADO_INICIAL);
  };

  return (
    <section className="section zz-contacto">
      <div className="container zz-contacto__inner">
        <div>
          <p className="eyebrow">Contacto</p>
          <h1>Invoca un encargo</h1>
          <p className="lead">
            Cuéntanos qué pieza tienes en mente. Respondemos en un plazo de
            dos días.
          </p>
        </div>

        <form className="zz-form" onSubmit={handleSubmit}>
          <label>
            Nombre
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Correo
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Mensaje
            <textarea
              name="message"
              rows="5"
              value={form.message}
              onChange={handleChange}
              required
            />
          </label>

          <button className="btn" type="submit" disabled={envio === "enviando"}>
            {envio === "enviando" ? "Enviando…" : "Enviar mensaje"}
          </button>

          {envio === "ok" && (
            <p className="zz-form__status zz-form__status--ok">
              Mensaje recibido. El sigilo ha sido trazado.
            </p>
          )}
          {envio === "sin-config" && (
            <p className="zz-form__status zz-form__status--error">
              Falta conectar Supabase: crea <code>frontend/.env</code> con
              <code> VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code>.
            </p>
          )}
          {envio === "error" && (
            <p className="zz-form__status zz-form__status--error">
              No se pudo enviar. Intenta de nuevo en unos minutos por favor.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}