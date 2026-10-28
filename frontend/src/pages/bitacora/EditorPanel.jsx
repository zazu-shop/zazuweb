import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listarPersonajes, listarCronicas, agregarXp } from "../../lib/bitacoraService";
import { useAuth } from "../../lib/AuthContext";
import { nivelPorXp } from "../../lib/dndRules";
import { fechaCorta } from "./Bitacora";
import "./bitacora.css";

export default function EditorPanel() {
  const { session } = useAuth();
  const userId = session.user.id; // EditorRoute garantiza que hay sesión

  const [personajes, setPersonajes] = useState([]);
  const [cronicas, setCronicas] = useState([]);
  const [estado, setEstado] = useState("cargando"); // cargando | listo | error

  // Repartir experiencia
  const [xpTotal, setXpTotal] = useState("");
  const [xpMotivo, setXpMotivo] = useState("");
  const [xpModo, setXpModo] = useState("dividir"); // dividir | cada_uno
  const [xpSel, setXpSel] = useState({});
  const [xpCronica, setXpCronica] = useState("");
  const [xpMensaje, setXpMensaje] = useState(null);
  const [xpError, setXpError] = useState(null);
  const [repartiendo, setRepartiendo] = useState(false);

  const cargar = () =>
    Promise.all([
      listarPersonajes({ userId, soloPublicados: false }),
      listarCronicas({ userId, soloPublicadas: false }),
    ])
      .then(([p, c]) => {
        setPersonajes(p);
        setCronicas(c);
        setEstado("listo");
      })
      .catch(() => setEstado("error"));

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const seleccionados = useMemo(() => personajes.filter((p) => xpSel[p.id]), [personajes, xpSel]);
  const total = Math.trunc(Number(xpTotal) || 0);
  const porPersonaje =
    xpModo === "dividir" ? Math.trunc(total / (seleccionados.length || 1)) : total;

  const repartir = async (e) => {
    e.preventDefault();
    setXpError(null);
    setXpMensaje(null);

    if (seleccionados.length === 0) return setXpError("Elige al menos un personaje.");
    if (porPersonaje === 0) return setXpError("La cantidad por personaje no puede ser 0.");

    setRepartiendo(true);
    try {
      await agregarXp(
        seleccionados.map((p) => ({
          character_id: p.id,
          amount: porPersonaje,
          reason: xpMotivo.trim() || null,
          post_id: xpCronica || null,
        }))
      );
      setXpMensaje(
        `✓ ${porPersonaje > 0 ? "+" : ""}${porPersonaje} XP para ${seleccionados.map((p) => p.name).join(", ")}.`
      );
      setXpTotal("");
      setXpMotivo("");
      setXpSel({});
      setXpCronica("");
      await cargar();
    } catch (err) {
      setXpError(err.message);
    } finally {
      setRepartiendo(false);
    }
  };

  return (
    <section className="section zz-bit">
      <div className="container">
        <div className="zz-bit__panel-titulo">
          <div>
            <p className="eyebrow">Bitácora</p>
            <h1>Mi bitácora</h1>
          </div>
          <div className="zz-bit__acciones">
            <Link to="/bitacora/editar/personaje/nuevo" className="btn">+ Nuevo personaje</Link>
            <Link to="/bitacora/editar/cronica/nueva" className="btn">+ Nueva crónica</Link>
            <Link to="/bitacora" className="btn btn-ghost">Ver bitácora pública</Link>
          </div>
        </div>

        {estado === "cargando" && <p className="zz-bazar__status">Cargando…</p>}
        {estado === "error" && <p className="zz-bazar__status">No se pudo cargar tu bitácora.</p>}

        {estado === "listo" && (
          <>
            <div className="zz-bit__panel">
              <h2>Mis personajes</h2>
              {personajes.length === 0 ? (
                <p className="zz-bit__nota">Aún no creaste ningún personaje.</p>
              ) : (
                <div className="zz-admin__tabla-wrap">
                  <table className="zz-admin__tabla-productos">
                    <thead>
                      <tr><th>Personaje</th><th>Nivel</th><th>XP</th><th>Estado</th><th></th></tr>
                    </thead>
                    <tbody>
                      {personajes.map((p) => (
                        <tr key={p.id}>
                          <td>
                            {p.name}
                            <div className="zz-admin__tabla-dim" style={{ fontSize: "0.72rem" }}>
                              {[p.class_name, p.species].filter(Boolean).join(" · ")}
                            </div>
                          </td>
                          <td className="zz-admin__tabla-dim">{nivelPorXp(p.xp)}</td>
                          <td className="zz-admin__tabla-dim">{p.xp}</td>
                          <td>
                            {p.published ? (
                              <span className="zz-admin__badge zz-admin__badge--activo">Publicado</span>
                            ) : (
                              <span className="zz-admin__badge zz-admin__badge--cancelado">Borrador</span>
                            )}
                          </td>
                          <td>
                            <div className="zz-admin__tabla-acciones">
                              <Link to={`/bitacora/personaje/${p.slug}`} className="btn btn-ghost">Ver</Link>
                              <Link to={`/bitacora/editar/personaje/${p.id}`} className="btn btn-ghost">Editar</Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="zz-bit__panel">
              <h2>Repartir experiencia</h2>
              {personajes.length === 0 ? (
                <p className="zz-bit__nota">Crea un personaje para poder darle experiencia.</p>
              ) : (
                <form className="zz-form" onSubmit={repartir}>
                  <div className="zz-bit__fila-campos">
                    <label>
                      Experiencia ganada
                      <input type="number" value={xpTotal} onChange={(e) => setXpTotal(e.target.value)} required />
                    </label>
                    <label>
                      Motivo
                      <input value={xpMotivo} onChange={(e) => setXpMotivo(e.target.value)} placeholder="Ej. Sesión 1: la cripta" />
                    </label>
                    <label>
                      Crónica relacionada (opcional)
                      <select value={xpCronica} onChange={(e) => setXpCronica(e.target.value)}>
                        <option value="">— ninguna —</option>
                        {cronicas.map((c) => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="zz-bit__fila-campos">
                    <label className="zz-bit__check">
                      <input type="radio" name="modoXp" checked={xpModo === "dividir"} onChange={() => setXpModo("dividir")} />
                      Dividir en partes iguales entre los elegidos
                    </label>
                    <label className="zz-bit__check">
                      <input type="radio" name="modoXp" checked={xpModo === "cada_uno"} onChange={() => setXpModo("cada_uno")} />
                      Dar esa cantidad a cada uno
                    </label>
                  </div>

                  <div className="zz-bit__fila-campos">
                    {personajes.map((p) => (
                      <label className="zz-bit__check" key={p.id}>
                        <input
                          type="checkbox"
                          checked={Boolean(xpSel[p.id])}
                          onChange={(e) => setXpSel({ ...xpSel, [p.id]: e.target.checked })}
                        />
                        {p.name} <small className="zz-bit__nota">({p.xp} XP)</small>
                      </label>
                    ))}
                  </div>

                  {seleccionados.length > 0 && total !== 0 && (
                    <p className="zz-bit__nota">
                      Cada personaje elegido recibirá {porPersonaje > 0 ? "+" : ""}{porPersonaje} XP.
                    </p>
                  )}

                  <button className="btn" type="submit" disabled={repartiendo}>
                    {repartiendo ? "Repartiendo…" : "Repartir experiencia"}
                  </button>
                  {xpMensaje && <p className="zz-form__status zz-form__status--ok">{xpMensaje}</p>}
                  {xpError && <p className="zz-form__status zz-form__status--error">{xpError}</p>}
                </form>
              )}
            </div>

            <div className="zz-bit__panel">
              <h2>Mis crónicas</h2>
              {cronicas.length === 0 ? (
                <p className="zz-bit__nota">Aún no escribiste ninguna crónica.</p>
              ) : (
                <div className="zz-admin__tabla-wrap">
                  <table className="zz-admin__tabla-productos">
                    <thead>
                      <tr><th>Título</th><th>Personaje</th><th>Fecha</th><th>Estado</th><th></th></tr>
                    </thead>
                    <tbody>
                      {cronicas.map((c) => (
                        <tr key={c.id}>
                          <td>{c.title}</td>
                          <td className="zz-admin__tabla-dim">{c.dnd_characters?.name || "—"}</td>
                          <td className="zz-admin__tabla-dim">{fechaCorta(c.created_at)}</td>
                          <td>
                            {c.published ? (
                              <span className="zz-admin__badge zz-admin__badge--activo">Publicada</span>
                            ) : (
                              <span className="zz-admin__badge zz-admin__badge--cancelado">Borrador</span>
                            )}
                          </td>
                          <td>
                            <div className="zz-admin__tabla-acciones">
                              <Link to={`/bitacora/cronica/${c.slug}`} className="btn btn-ghost">Ver</Link>
                              <Link to={`/bitacora/editar/cronica/${c.id}`} className="btn btn-ghost">Editar</Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}