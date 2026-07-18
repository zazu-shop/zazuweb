import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../lib/AuthContext";
import { descargarImagenCupon } from "../../lib/cuponImageGenerator";
import "./admin.css";

const CUPON_VACIO = { id: null, code: "", discount_percent: "", active: true, expires_at: "" };

export default function AdminCupones() {
  const { logout } = useAuth();
  const [cupones, setCupones] = useState([]);
  const [estado, setEstado] = useState("cargando");
  const [form, setForm] = useState(CUPON_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [generandoId, setGenerandoId] = useState(null);

  const cargar = () => {
    setEstado("cargando");
    supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setEstado("error");
          return;
        }
        setCupones(data);
        setEstado("listo");
      });
  };

  useEffect(cargar, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleEditar = (cupon) => {
    setForm({ ...cupon, expires_at: cupon.expires_at ? cupon.expires_at.slice(0, 10) : "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNuevo = () => setForm(CUPON_VACIO);

  const handleEliminar = async (id) => {
    if (!confirm("¿Eliminar este cupón?")) return;
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (!error) setCupones((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    const payload = {
      code: form.code.trim().toUpperCase(),
      discount_percent: Number(form.discount_percent),
      active: form.active,
      expires_at: form.expires_at || null,
    };

    try {
      if (form.id) {
        const { error } = await supabase.from("coupons").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("coupons").insert([payload]);
        if (error) throw error;
      }
      setForm(CUPON_VACIO);
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleDescargar = async (cupon) => {
    setGenerandoId(cupon.id);
    try {
      await descargarImagenCupon(cupon);
    } finally {
      setGenerandoId(null);
    }
  };

  return (
    <section className="section container">
      <div className="zz-admin__header">
        <div>
          <p className="eyebrow">Panel de administración</p>
          <h1>Cupones</h1>
        </div>
        <div className="zz-admin__header-acciones">
          <Link to="/admin/pedidos" className="btn btn-ghost">Ver pedidos</Link>
          <Link to="/admin/productos" className="btn btn-ghost">Productos</Link>
          <button className="btn btn-ghost" onClick={logout}>Cerrar sesión</button>
        </div>
      </div>

      <div className="zz-panel">
        <h2>{form.id ? "Editar cupón" : "Nuevo cupón"}</h2>
        <form className="zz-form zz-admin__form-producto" onSubmit={handleSubmit}>
          <div className="zz-admin__form-fila">
            <label>
              Código
              <input type="text" name="code" value={form.code} onChange={handleChange} placeholder="BRUJA10" required />
            </label>
            <label>
              Descuento (%)
              <input type="number" step="0.01" name="discount_percent" value={form.discount_percent} onChange={handleChange} required />
            </label>
            <label>
              Vence (opcional)
              <input type="date" name="expires_at" value={form.expires_at} onChange={handleChange} />
            </label>
          </div>

          <label className="zz-admin__checkbox">
            <input type="checkbox" name="active" checked={form.active} onChange={handleChange} />
            Activo
          </label>

          <div className="zz-admin__form-acciones">
            <button className="btn" type="submit" disabled={guardando}>
              {guardando ? "Guardando…" : form.id ? "Guardar cambios" : "Crear cupón"}
            </button>
            {form.id && (
              <button type="button" className="btn btn-ghost" onClick={handleNuevo}>Cancelar edición</button>
            )}
          </div>

          {error && <p className="zz-form__status zz-form__status--error">{error}</p>}
        </form>
      </div>

      <h2 style={{ marginTop: "2.5rem", marginBottom: "1rem" }}>Cupones existentes</h2>

      {estado === "cargando" && <p className="zz-bazar__status">Cargando cupones…</p>}
      {estado === "error" && <p className="zz-bazar__status">No se pudieron cargar los cupones.</p>}

      {estado === "listo" && cupones.length === 0 && (
        <p className="zz-bazar__status">Aún no has creado ningún cupón.</p>
      )}

      {estado === "listo" && cupones.length > 0 && (
        <div className="zz-admin__lista">
          {cupones.map((cupon) => (
            <div className="zz-admin__producto-fila" key={cupon.id}>
              <div className="zz-admin__producto-placeholder" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", color: "var(--zz-gold-bright)", fontSize: "0.7rem" }}>
                -{cupon.discount_percent}%
              </div>
              <div className="zz-admin__producto-info">
                <p className="zz-admin__producto-nombre">
                  {cupon.code} {!cupon.active && <span style={{ color: "#d67a6a" }}>(inactivo)</span>}
                </p>
                <p className="zz-admin__producto-meta">
                  {cupon.expires_at
                    ? `Vence: ${new Date(cupon.expires_at).toLocaleDateString("es-PE")}`
                    : "Sin fecha de vencimiento"}
                </p>
              </div>
              <button className="btn btn-ghost" onClick={() => handleDescargar(cupon)} disabled={generandoId === cupon.id}>
                {generandoId === cupon.id ? "Generando…" : "Descargar para Instagram"}
              </button>
              <button className="btn btn-ghost" onClick={() => handleEditar(cupon)}>Editar</button>
              <button className="zz-admin__eliminar" onClick={() => handleEliminar(cupon.id)}>Eliminar</button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}