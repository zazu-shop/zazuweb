import { useEffect, useState } from "react";
import { listarEditores, agregarEditor, quitarEditor } from "../../lib/bitacoraService";
import "./admin.css";

export default function AdminEditores() {
  const [editores, setEditores] = useState([]);
  const [estado, setEstado] = useState("cargando"); // cargando | listo | error
  const [email, setEmail] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const cargar = () =>
    listarEditores()
      .then((data) => {
        setEditores(data || []);
        setEstado("listo");
      })
      .catch(() => setEstado("error"));

  useEffect(() => {
    cargar();
  }, []);

  const agregar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    setMensaje(null);
    try {
      await agregarEditor(email.trim());
      setMensaje(`✓ ${email.trim()} ya puede escribir en la bitácora.`);
      setEmail("");
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const quitar = async (editor) => {
    if (
      !confirm(
        `¿Quitar el permiso de editor a ${editor.editor_email}? Sus personajes y crónicas publicados siguen visibles, pero ya no podrá editarlos.`
      )
    )
      return;
    try {
      await quitarEditor(editor.editor_id);
      await cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="section container">
      <div className="zz-admin__header">
        <div>
          <p className="eyebrow">Panel de administración</p>
          <h1>Editores de la bitácora</h1>
        </div>
      </div>

      <div className="zz-panel">
        <h2>Dar permiso de editor</h2>
        <p className="zz-admin__tabla-dim" style={{ fontSize: "0.85rem", margin: "0.5rem 0 var(--space-sm)" }}>
          La persona debe haber creado antes su cuenta en el sitio. Escribe el correo con el que se registró.
        </p>
        <form className="zz-form" onSubmit={agregar}>
          <label>
            Correo de la cuenta
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <button className="btn" type="submit" disabled={guardando}>
            {guardando ? "Guardando…" : "Dar permiso"}
          </button>
          {mensaje && <p className="zz-form__status zz-form__status--ok">{mensaje}</p>}
          {error && <p className="zz-form__status zz-form__status--error">{error}</p>}
        </form>
      </div>

      <h2 style={{ margin: "2.5rem 0 1rem" }}>Editores actuales</h2>

      {estado === "cargando" && <p className="zz-bazar__status">Cargando…</p>}
      {estado === "error" && <p className="zz-bazar__status">No se pudo cargar la lista.</p>}
      {estado === "listo" && editores.length === 0 && (
        <p className="zz-bazar__status">Aún no diste permiso a nadie (tú, como admin, ya puedes escribir).</p>
      )}

      {estado === "listo" && editores.length > 0 && (
        <div className="zz-admin__tabla-wrap">
          <table className="zz-admin__tabla-productos">
            <thead>
              <tr><th>Correo</th><th>Desde</th><th></th></tr>
            </thead>
            <tbody>
              {editores.map((ed) => (
                <tr key={ed.editor_id}>
                  <td>{ed.editor_email}</td>
                  <td className="zz-admin__tabla-dim">
                    {new Date(ed.granted_at).toLocaleDateString("es-PE")}
                  </td>
                  <td>
                    <button className="zz-admin__eliminar" onClick={() => quitar(ed)}>Quitar permiso</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}