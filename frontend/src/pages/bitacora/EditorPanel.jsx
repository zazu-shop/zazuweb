import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { 
  listarPersonajes, 
  listarCronicas, 
  agregarXp, 
  actualizarMaxPointBuy,
  agregarOroPersonaje 
} from "../../lib/bitacoraService";
import { useAuth } from "../../lib/AuthContext";
import { nivelPorXp } from "../../lib/dndRules";
import { fechaCorta } from "./Bitacora";
import "./bitacora.css";
import "./editarPersonaje.css";

export default function EditorPanel() {
  const { session } = useAuth();
  const userId = session.user.id; // EditorRoute garantiza que hay sesión

  const [personajes, setPersonajes] = useState([]);
  const [cronicas, setCronicas] = useState([]);
  const [estado, setEstado] = useState("cargando"); // cargando | listo | error

  // Repartir recursos (XP, Puntos PB u Oro)
  const [tipoRecurso, setTipoRecurso] = useState("xp"); // 'xp' | 'puntos' | 'oro'
  const [recursoTotal, setRecursoTotal] = useState("");
  const [recursoMotivo, setRecursoMotivo] = useState("");
  const [recursoModo, setRecursoModo] = useState("dividir"); // dividir | cada_uno
  const [recursoSel, setRecursoSel] = useState({});
  const [recursoCronica, setRecursoCronica] = useState("");
  const [mensajeStatus, setMensajeStatus] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
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

  const seleccionados = useMemo(
    () => personajes.filter((p) => recursoSel[p.id]),
    [personajes, recursoSel]
  );
  
  const total = Math.trunc(Number(recursoTotal) || 0);
  const porPersonaje =
    recursoModo === "dividir" ? Math.trunc(total / (seleccionados.length || 1)) : total;

  const repartir = async (e) => {
    e.preventDefault();
    setErrorStatus(null);
    setMensajeStatus(null);

    if (seleccionados.length === 0) return setErrorStatus("Elige al menos un personaje.");
    if (porPersonaje === 0) return setErrorStatus("La cantidad no puede ser 0.");

    setRepartiendo(true);
    try {
      if (tipoRecurso === "xp") {
        // Otorgar Experiencia (XP)
        await agregarXp(
          seleccionados.map((p) => ({
            character_id: p.id,
            amount: porPersonaje,
            reason: recursoMotivo.trim() || null,
            post_id: recursoCronica || null,
          }))
        );
        setMensajeStatus(
          `✓ ${porPersonaje > 0 ? "+" : ""}${porPersonaje} XP otorgada a ${seleccionados.map((p) => p.name).join(", ")}.`
        );
      } else if (tipoRecurso === "puntos") {
        // Otorgar Puntos de Atributo (Point Buy Max)
        for (const p of seleccionados) {
          const maxActual = Number(p.max_point_buy ?? 27);
          await actualizarMaxPointBuy(p.id, maxActual + porPersonaje);
        }
        setMensajeStatus(
          `✓ ${porPersonaje > 0 ? "+" : ""}${porPersonaje} Pts PB otorgados a ${seleccionados.map((p) => p.name).join(", ")}.`
        );
      } else if (tipoRecurso === "oro") {
        // Otorgar Oro (PO)
        for (const p of seleccionados) {
          await agregarOroPersonaje(p.id, porPersonaje);
        }
        setMensajeStatus(
          `✓ ${porPersonaje > 0 ? "+" : ""}${porPersonaje} PO otorgados a ${seleccionados.map((p) => p.name).join(", ")}.`
        );
      }

      setRecursoTotal("");
      setRecursoMotivo("");
      setRecursoSel({});
      setRecursoCronica("");
      await cargar();
    } catch (err) {
      setErrorStatus(err.message);
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
            {/* PANEL DE PERSONAJES */}
            <div className="zz-bit__panel">
              <h2>Mis personajes</h2>
              {personajes.length === 0 ? (
                <p className="zz-bit__nota">Aún no creaste ningún personaje.</p>
              ) : (
                <div className="zz-admin__tabla-wrap">
                  <table className="zz-admin__tabla-productos">
                    <thead>
                      <tr>
                        <th>Personaje</th>
                        <th>Nivel</th>
                        <th>XP Total</th>
                        <th>Oro (PO)</th>
                        <th>PB Máximo</th>
                        <th>Estado</th>
                        <th></th>
                      </tr>
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
                          <td className="zz-admin__tabla-dim">{p.xp} XP</td>
                          <td className="zz-admin__tabla-dim" style={{ color: "var(--zz-gold-bright)" }}>
                            {p.gp || 0} po
                          </td>
                          <td>
                            <span className="zz-edper__badge-puntos">
                              <strong>{p.max_point_buy ?? 27}</strong> pts
                            </span>
                          </td>
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

            {/* PANEL DE REPARTIR RECURSOS (XP, PUNTOS Y ORO) */}
            <div className="zz-bit__panel">
              <h2>Repartir Experiencia, Puntos y Tesoro</h2>
              {personajes.length === 0 ? (
                <p className="zz-bit__nota">Crea un personaje para poder asignarle recursos.</p>
              ) : (
                <form className="zz-form" onSubmit={repartir}>
                  {/* Selector de Tipo de Recurso */}
                  <div className="zz-bit__selector-recurso">
                    <label className={`zz-bit__check ${tipoRecurso === 'xp' ? 'zz-bit__check--active' : ''}`}>
                      <input
                        type="radio"
                        name="tipoRecurso"
                        checked={tipoRecurso === "xp"}
                        onChange={() => setTipoRecurso("xp")}
                      />
                      ⚡ Experiencia (XP)
                    </label>

                    <label className={`zz-bit__check ${tipoRecurso === 'puntos' ? 'zz-bit__check--active' : ''}`}>
                      <input
                        type="radio"
                        name="tipoRecurso"
                        checked={tipoRecurso === "puntos"}
                        onChange={() => setTipoRecurso("puntos")}
                      />
                      💎 Puntos PB Max
                    </label>

                    <label className={`zz-bit__check ${tipoRecurso === 'oro' ? 'zz-bit__check--active' : ''}`}>
                      <input
                        type="radio"
                        name="tipoRecurso"
                        checked={tipoRecurso === "oro"}
                        onChange={() => setTipoRecurso("oro")}
                      />
                      🪙 Oro (PO)
                    </label>
                  </div>

                  <div className="zz-bit__fila-campos">
                    <label>
                      {tipoRecurso === "xp" 
                        ? "Experiencia a Repartir" 
                        : tipoRecurso === "puntos" 
                        ? "Puntos PB a Regalar" 
                        : "Oro (PO) a Otorgar"}
                      <input
                        type="number"
                        min="1"
                        value={recursoTotal}
                        onChange={(e) => setRecursoTotal(e.target.value)}
                        placeholder={tipoRecurso === "xp" ? "Ej. 300" : tipoRecurso === "puntos" ? "Ej. 2" : "Ej. 50"}
                        required
                      />
                    </label>
                    <label>
                      Motivo / Recompensa
                      <input
                        value={recursoMotivo}
                        onChange={(e) => setRecursoMotivo(e.target.value)}
                        placeholder="Ej. Sesión 1: Derrota del jefe"
                      />
                    </label>
                    {tipoRecurso === "xp" && (
                      <label>
                        Crónica relacionada (opcional)
                        <select
                          value={recursoCronica}
                          onChange={(e) => setRecursoCronica(e.target.value)}
                        >
                          <option value="">— ninguna —</option>
                          {cronicas.map((c) => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                          ))}
                        </select>
                      </label>
                    )}
                  </div>

                  <div className="zz-bit__fila-campos">
                    <label className="zz-bit__check">
                      <input
                        type="radio"
                        name="modoXp"
                        checked={recursoModo === "dividir"}
                        onChange={() => setRecursoModo("dividir")}
                      />
                      Dividir en partes iguales entre los elegidos
                    </label>
                    <label className="zz-bit__check">
                      <input
                        type="radio"
                        name="modoXp"
                        checked={recursoModo === "cada_uno"}
                        onChange={() => setRecursoModo("cada_uno")}
                      />
                      Dar esa cantidad a cada uno
                    </label>
                  </div>

                  {/* Selección de Personajes */}
                  <div className="zz-bit__fila-campos" style={{ flexWrap: "wrap", gap: "0.8rem" }}>
                    {personajes.map((p) => (
                      <label className="zz-bit__check" key={p.id}>
                        <input
                          type="checkbox"
                          checked={Boolean(recursoSel[p.id])}
                          onChange={(e) => setRecursoSel({ ...recursoSel, [p.id]: e.target.checked })}
                        />
                        <span>
                          {p.name}{" "}
                          <small className="zz-bit__nota">
                            ({p.xp} XP | {p.gp || 0} po | PB Max: {p.max_point_buy ?? 27} pts)
                          </small>
                        </span>
                      </label>
                    ))}
                  </div>

                  {seleccionados.length > 0 && total !== 0 && (
                    <p className="zz-bit__nota" style={{ color: "var(--zz-gold-bright)" }}>
                      Cada personaje elegido recibirá {porPersonaje > 0 ? "+" : ""}{porPersonaje}{" "}
                      {tipoRecurso === "xp" ? "XP" : tipoRecurso === "puntos" ? "Pts PB" : "po"}.
                    </p>
                  )}

                  <button className="btn" type="submit" disabled={repartiendo}>
                    {repartiendo
                      ? "Procesando…"
                      : `Repartir ${
                          tipoRecurso === "xp" 
                            ? "Experiencia" 
                            : tipoRecurso === "puntos" 
                            ? "Puntos PB" 
                            : "Oro"
                        }`}
                  </button>

                  {mensajeStatus && <p className="zz-form__status zz-form__status--ok">{mensajeStatus}</p>}
                  {errorStatus && <p className="zz-form__status zz-form__status--error">{errorStatus}</p>}
                </form>
              )}
            </div>

            {/* PANEL DE CRÓNICAS */}
            <div className="zz-bit__panel">
              <h2>Mis crónicas</h2>
              {cronicas.length === 0 ? (
                <p className="zz-bit__nota">Aún no escribiste ninguna crónica.</p>
              ) : (
                <div className="zz-admin__tabla-wrap">
                  <table className="zz-admin__tabla-productos">
                    <thead>
                      <tr>
                        <th>Título</th>
                        <th>Personaje</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th></th>
                      </tr>
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