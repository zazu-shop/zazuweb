import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { obtenerPersonajePorSlug, listarCronicas, sumarXp } from "../../lib/bitacoraService";
import { useAuth } from "../../lib/AuthContext";
import { ABILITIES, MARCAS_COMPETENCIA, calcularFicha, conSigno } from "../../lib/dndRules";
import XpBar from "../../components/XpBar";
import Sigil from "../../components/Sigil";
import { fechaCorta } from "./Bitacora";
import "./bitacora.css";

export default function Personaje() {
  const { slug } = useParams();
  const { session, esAdmin } = useAuth();
  const [p, setP] = useState(null);
  const [cronicas, setCronicas] = useState([]);
  const [estado, setEstado] = useState("cargando"); // cargando | listo | no-existe | error

  useEffect(() => {
    setEstado("cargando");
    obtenerPersonajePorSlug(slug)
      .then(async (personaje) => {
        if (!personaje) {
          setEstado("no-existe");
          return;
        }
        setP(personaje);
        setCronicas(await listarCronicas({ personajeId: personaje.id }).catch(() => []));
        setEstado("listo");
      })
      .catch(() => setEstado("error"));
  }, [slug]);

  const xp = p ? sumarXp(p.dnd_xp_log) : 0;
  const ficha = useMemo(() => (p ? calcularFicha(p, xp) : null), [p, xp]);

  if (estado === "cargando") {
    return (
      <section className="section container">
        <p className="zz-bazar__status">Abriendo la hoja de personaje…</p>
      </section>
    );
  }

  if (estado !== "listo") {
    return (
      <section className="section container" style={{ textAlign: "center" }}>
        <p className="eyebrow">Bitácora</p>
        <h1>{estado === "error" ? "No se pudo abrir esta hoja" : "Este personaje no está disponible"}</h1>
        <Link to="/bitacora" className="btn" style={{ marginTop: "1.5rem" }}>Volver a la bitácora</Link>
      </section>
    );
  }

  const puedeEditar = Boolean(session && (p.user_id === session.user.id || esAdmin));
  const subtitulo = [p.class_name, p.species, p.background, p.alignment].filter(Boolean).join(" · ");

  return (
    <section className="section zz-bit">
      <div className="container">
        <Link to="/bitacora" className="zz-bit__nota">← Bitácora</Link>

        <header className="zz-bit__ficha-header">
          <div className="zz-bit__retrato">
            {p.portrait_url ? <img src={p.portrait_url} alt={p.name} /> : <Sigil size={90} />}
          </div>
          <div className="zz-bit__ficha-datos">
            <p className="eyebrow">Nivel {ficha.nivel}{!p.published && " · borrador"}</p>
            <h1>{p.name}</h1>
            {subtitulo && <p className="zz-bit__sub">{subtitulo}</p>}
            <XpBar xp={xp} />
            {puedeEditar && (
              <div className="zz-bit__acciones">
                <Link to={`/bitacora/editar/personaje/${p.id}`} className="btn btn-ghost">Editar hoja</Link>
              </div>
            )}
          </div>
        </header>

        <div className="zz-bit__cajas">
          <div className="zz-bit__caja"><span>Clase de armadura</span><strong>{p.ac}</strong></div>
          <div className="zz-bit__caja"><span>Iniciativa</span><strong>{conSigno(ficha.iniciativa)}</strong></div>
          <div className="zz-bit__caja">
            <span>Puntos de vida</span><strong>{p.hp_current} / {p.hp_max}</strong>
          </div>
          <div className="zz-bit__caja"><span>Dado de golpe</span><strong>{p.hit_die || "—"}</strong></div>
          <div className="zz-bit__caja"><span>Competencia</span><strong>{conSigno(ficha.prof)}</strong></div>
          <div className="zz-bit__caja"><span>Percepción pasiva</span><strong>{ficha.percepcionPasiva}</strong></div>
          <div className="zz-bit__caja"><span>Velocidad</span><strong style={{ fontSize: "1rem" }}>{p.speed || "—"}</strong></div>
          <div className="zz-bit__caja"><span>Talla</span><strong style={{ fontSize: "1rem" }}>{p.size || "—"}</strong></div>
        </div>

        <div className="zz-bit__habilidades">
          {ABILITIES.map((a) => (
            <div className="zz-bit__habilidad" key={a.key}>
              <span>{a.label}</span>
              <strong>{conSigno(ficha.mods[a.key])}</strong>
              <small>{p[a.col]}</small>
            </div>
          ))}
        </div>

        <div className="zz-bit__dos-col">
          <div>
            <div className="zz-bit__panel">
              <h2>Tiradas de salvación</h2>
              <ul className="zz-bit__lista-simple">
                {ficha.salvaciones.map((s) => (
                  <li key={s.key}>
                    <span className="zz-bit__marca">{s.competente ? "●" : "○"}</span>
                    <span className="zz-bit__bonus">{conSigno(s.bonus)}</span>
                    {s.label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="zz-bit__panel zz-bit__datos-texto">
              <h2>Competencias</h2>
              {p.languages && <p><strong>Idiomas:</strong> {p.languages}</p>}
              {p.armor_prof && <p><strong>Armaduras:</strong> {p.armor_prof}</p>}
              {p.weapon_prof && <p><strong>Armas:</strong> {p.weapon_prof}</p>}
              {p.tool_prof && <p><strong>Herramientas:</strong> {p.tool_prof}</p>}
            </div>
          </div>

          <div className="zz-bit__panel">
            <h2>Habilidades</h2>
            <ul className="zz-bit__lista-simple">
              {ficha.habilidades.map((h) => (
                <li key={h.key}>
                  <span className="zz-bit__marca">{MARCAS_COMPETENCIA[h.nivelComp]}</span>
                  <span className="zz-bit__bonus">{conSigno(h.bonus)}</span>
                  {h.label} <small>({h.abbr})</small>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {p.attacks?.length > 0 && (
          <div className="zz-bit__panel">
            <h2>Armas y ataques</h2>
            <div className="zz-admin__tabla-wrap">
              <table className="zz-bit__tabla">
                <thead>
                  <tr><th>Arma</th><th>Alcance</th><th>Golpear</th><th>Daño</th><th>Notas</th></tr>
                </thead>
                <tbody>
                  {p.attacks.map((a, i) => (
                    <tr key={i}>
                      <td>{a.name}</td>
                      <td>{a.range || "—"}</td>
                      <td>{a.bonus || "—"}</td>
                      <td>{a.damage || "—"}</td>
                      <td>{a.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {p.features?.length > 0 && (
          <div className="zz-bit__panel">
            <h2>Rasgos y habilidades de clase</h2>
            {p.features.map((r, i) => (
              <div className="zz-bit__rasgo" key={i}>
                <h3>{r.name}</h3>
                {r.text && <p>{r.text}</p>}
              </div>
            ))}
          </div>
        )}

        <div className="zz-bit__panel">
          <h2>Equipo</h2>
          {p.equipment?.length > 0 ? (
            <ul className="zz-bit__lista-simple">
              {p.equipment.map((e, i) => (
                <li key={i}>
                  <span className="zz-bit__bonus">×{e.qty || 1}</span>
                  {e.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="zz-bit__nota">Sin equipo registrado.</p>
          )}
          <div className="zz-bit__monedas">
            <span>{p.gp} po</span>
            <span>{p.sp} pp</span>
            <span>{p.cp} pc</span>
          </div>
        </div>

        {p.notes && (
          <div className="zz-bit__panel">
            <h2>Historia y notas</h2>
            <div className="zz-bit__cuerpo"><p>{p.notes}</p></div>
          </div>
        )}

        <div className="zz-bit__panel">
          <h2>Historial de experiencia</h2>
          {p.dnd_xp_log.length === 0 ? (
            <p className="zz-bit__nota">Todavía no ganó experiencia.</p>
          ) : (
            <ul className="zz-bit__lista-simple zz-bit__xplog">
              {p.dnd_xp_log.map((e) => (
                <li key={e.id}>
                  <span className="zz-bit__xp-cantidad">{e.amount > 0 ? `+${e.amount}` : e.amount} XP</span>
                  <span>{e.reason || "Sin motivo"}</span>
                  <small>{fechaCorta(e.created_at)}</small>
                  {e.dnd_posts && (
                    <Link to={`/bitacora/cronica/${e.dnd_posts.slug}`} className="zz-bit__etiqueta">
                      {e.dnd_posts.title}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {cronicas.length > 0 && (
          <div className="zz-bit__seccion">
            <p className="eyebrow">Su historia</p>
            <h2>Crónicas de {p.name}</h2>
            <div className="zz-bit__posts">
              {cronicas.map((c) => (
                <Link to={`/bitacora/cronica/${c.slug}`} className="zz-bit__post zz-bit__post--sin-portada" key={c.id}>
                  <div className="zz-bit__post-cuerpo">
                    <p className="zz-bit__sub">{fechaCorta(c.created_at)}</p>
                    <h3>{c.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}