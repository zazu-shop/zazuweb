import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  obtenerCronicaPorId,
  guardarCronica,
  eliminarCronica,
  listarPersonajes,
} from "../../lib/bitacoraService";
import { useAuth } from "../../lib/AuthContext";
import ImageUpload from "../../components/ImageUpload";
import "./bitacora.css";

const VACIA = { title: "", body: "", cover_url: "", character_id: "", published: true };

export default function EditarCronica() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const esNueva = !id || id === "nueva";

  const [f, setF] = useState(VACIA);
  const [personajes, setPersonajes] = useState([]);
  const [cargando, setCargando] = useState(!esNueva);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    listarPersonajes({ userId: session.user.id, soloPublicados: false })
      .then(setPersonajes)
      .catch(() => {});

    if (esNueva) return;
    obtenerCronicaPorId(id)
      .then((c) => {
        if (!c) setError("No se encontró esta crónica.");
        else setF({ ...VACIA, ...c, cover_url: c.cover_url || "", character_id: c.character_id || "" });
        setCargando(false);
      })
      .catch((err) => {
        setError(err.message);
        setCargando(false);
      });
  }, [id, esNueva, session.user.id]);

  const set = (campo, valor) => setF((prev) => ({ ...prev, [campo]: valor }));

  // Reemplaza la función guardar en EditarCronica.jsx (alrededor de la línea 40)
  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const limpio = {
        ...f,
        // 🛑 Convertir string vacío de UUID a null
        character_id: f.character_id ? f.character_id : null,
      };

      // 🛑 Si es nueva crónica, elimina el id
      if (esNueva || !limpio.id || limpio.id === "nueva") {
        delete limpio.id;
      }

      const guardada = await guardarCronica(limpio, session.user.id);
      navigate(`/bitacora/cronica/${guardada.slug}`);
    } catch (err) {
      setError(err.message);
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    if (!confirm("¿Eliminar esta crónica? No se puede deshacer.")) return;
    try {
      await eliminarCronica(id);
      navigate("/bitacora/editar");
    } catch (err) {
      setError(err.message);
    }
  };

  if (cargando) {
    return (
      <section className="section container">
        <p className="zz-bazar__status">Cargando crónica…</p>
      </section>
    );
  }

  return (
    <section className="section zz-bit">
      <div className="container" style={{ maxWidth: 780 }}>
        <Link to="/bitacora/editar" className="zz-bit__nota">← Mi bitácora</Link>
        <p className="eyebrow" style={{ marginTop: "1rem" }}>{esNueva ? "Nueva crónica" : "Editar crónica"}</p>
        <h1 style={{ marginBottom: "var(--space-md)" }}>{f.title || "Sin título"}</h1>

        <form className="zz-form" onSubmit={guardar}>
          <label>
            Título
            <input value={f.title} onChange={(e) => set("title", e.target.value)} required />
          </label>

          <label>
            Personaje al que enlaza
            <select value={f.character_id} onChange={(e) => set("character_id", e.target.value)}>
              <option value="">— ninguno —</option>
              {personajes.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>

          <fieldset className="zz-bit__bloque">
            <legend>Imagen de portada (opcional)</legend>
            <ImageUpload
              value={f.cover_url}
              onChange={(url) => set("cover_url", url)}
              userId={session.user.id}
              etiqueta="Portada"
            />
          </fieldset>

          <label>
            Texto (deja una línea en blanco entre párrafos)
            <textarea
              rows="14"
              value={f.body || ""}
              onChange={(e) => set("body", e.target.value)}
              placeholder="Hoy empezó mi primera partida…"
            />
          </label>

          <label className="zz-bit__check">
            <input type="checkbox" checked={f.published} onChange={(e) => set("published", e.target.checked)} />
            Publicada (visible para todos)
          </label>

          <div className="zz-bit__acciones">
            <button className="btn" type="submit" disabled={guardando}>
              {guardando ? "Guardando…" : "Guardar crónica"}
            </button>
            <Link to="/bitacora/editar" className="btn btn-ghost">Cancelar</Link>
            {!esNueva && (
              <button type="button" className="zz-admin__eliminar" onClick={eliminar}>
                Eliminar crónica
              </button>
            )}
          </div>

          {error && <p className="zz-form__status zz-form__status--error">{error}</p>}
        </form>
      </div>
    </section>
  );
}