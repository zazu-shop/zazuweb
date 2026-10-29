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

  // Cálculo de peso acumulado de equipamiento
  const pesoTotalEquipment = useMemo(() => {
    if (!p?.equipment) return 0;
    return p.equipment.reduce(
      (acc, item) => acc + (Number(item.weight || 0) * Number(item.qty || 1)),
      0
    );
  }, [p]);

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
  const limiteCargaLbs = (p.str_score || 10) * 15;

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

        {/* CAJAS PRINCIPALES DE ESTADÍSTICAS */}
        <div className="zz-bit__cajas">
          <div className="zz-bit__caja"><span>Clase de armadura</span><strong>{p.ac ?? 10}</strong></div>
          <div className="zz-bit__caja"><span>Iniciativa</span><strong>{conSigno(ficha.iniciativa)}</strong></div>
          <div className={`zz-bit__caja ${p.hp_current <= 0 ? 'zz-bit__caja--muerto' : ''}`}>
            <span>Puntos de vida</span>
            <strong>{p.hp_current} / {p.hp_max}</strong>
            {p.hp_current <= 0 ? (
              <small style={{ color: '#ff4d4d', fontWeight: 'bold', display: 'block', marginTop: '0.2rem' }}>
                💀 CAÍDO / MUERTO
              </small>
            ) : (
              <small style={{ color: 'var(--zz-gold-bright)', display: 'block', marginTop: '0.2rem' }}>
                💚 CONSCIENTE
              </small>
            )}
          </div>
          <div className="zz-bit__caja"><span>Dado de golpe</span><strong>{p.hit_die || "—"}</strong></div>
          <div className="zz-bit__caja"><span>Competencia</span><strong>{conSigno(ficha.prof)}</strong></div>
          <div className="zz-bit__caja"><span>Velocidad</span><strong style={{ fontSize: "1rem" }}>{p.speed || "30 pies"}</strong></div>
          <div className="zz-bit__caja"><span>Talla</span><strong style={{ fontSize: "1rem" }}>{p.size || "Mediano"}</strong></div>
        </div>

        {/* PUNTUACIONES PASIVAS (D&D 2024 / SHARD TABLETOP) */}
        <div className="zz-bit__pasivas-bar">
          <span>👁️ Percepción Pasiva: <strong>{ficha.percepcionPasiva}</strong></span>
          <span>🧠 Perspicacia Pasiva: <strong>{ficha.perspicaciaPasiva}</strong></span>
          <span>🔍 Investigación Pasiva: <strong>{ficha.investigacionPasiva}</strong></span>
        </div>

        {/* ATRIBUTOS Y MODIFICADORES */}
        <div className="zz-bit__habilidades">
          {ABILITIES.map((a) => (
            <div className="zz-bit__habilidad" key={a.key}>
              <span>{a.label}</span>
              <strong>{conSigno(ficha.mods[a.key])}</strong>
              <small>{p[a.col]}</small>
            </div>
          ))}
        </div>

        {/* GUÍA RÁPIDA DE LEYENDA */}
        <div 
          className="zz-bit__panel" 
          style={{ 
            borderLeft: "3px solid var(--zz-gold)", 
            background: "rgba(255, 255, 255, 0.02)",
            padding: "1rem 1.2rem" 
          }}
        >
          <h2 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--zz-gold-bright)", marginBottom: "0.5rem" }}>
            📖 ¿Cómo leer esta ficha?
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.6rem 1.2rem", fontSize: "0.82rem", color: "var(--zz-parchment-dim)" }}>
            <div><strong style={{ color: "var(--zz-gold)" }}>●</strong> <strong>Competente:</strong> Entrenado en esta tirada (suma +{ficha.prof} de competencia al d20).</div>
            <div><strong style={{ color: "var(--zz-gold)" }}>◆</strong> <strong>Experiencia:</strong> Pericia total (duplica el bono de competencia a +{ficha.prof * 2}).</div>
            <div><strong style={{ color: "var(--zz-parchment-dim)" }}>○</strong> <strong>Sin competencia:</strong> Solo suma/resta el modificador natural del atributo.</div>
            <div><strong style={{ color: "var(--zz-gold-bright)" }}>+X / -X</strong> <strong>Modificador:</strong> Número final a sumar o restar a tu tirada de dado d20.</div>
          </div>
        </div>

        {/* SALVACIONES, COMPETENCIAS Y HABILIDADES */}
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
              <h2>Competencias y Dominios</h2>
              {p.languages && <p><strong>Idiomas:</strong> {p.languages}</p>}
              {p.armor_prof && <p><strong>Armaduras:</strong> {p.armor_prof}</p>}
              {p.weapon_prof && <p><strong>Armas:</strong> {p.weapon_prof}</p>}
              {p.weapon_mastery && (
                <p>
                  <strong>Maestría de Armas:</strong>{" "}
                  <span style={{ color: "var(--zz-gold-bright)" }}>{p.weapon_mastery}</span>
                </p>
              )}
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

        {/* ATAQUES Y ARMAS */}
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

        {/* RASGOS DE CLASE, ESPECIE Y TRASFONDO */}
        {p.features?.length > 0 && (
          <div className="zz-bit__panel">
            <h2>Rasgos y habilidades</h2>
            {p.features.map((r, i) => (
              <div className="zz-bit__rasgo" key={i}>
                <h3>{r.name}</h3>
                {r.text && <p>{r.text}</p>}
              </div>
            ))}
          </div>
        )}

        {/* EQUIPO Y REGISTRO DE CARGA */}
        <div className="zz-bit__panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", marginBottom: "0.5rem" }}>
            <h2>Equipo e Inventario</h2>
            {pesoTotalEquipment > 0 && (
              <span className="zz-bit__nota">
                Peso acumulado: <strong>{pesoTotalEquipment} lbs</strong> / {limiteCargaLbs} lbs máx
              </span>
            )}
          </div>

          {p.equipment?.length > 0 ? (
            <ul className="zz-bit__lista-simple">
              {p.equipment.map((e, i) => (
                <li key={i}>
                  <span className="zz-bit__bonus">×{e.qty || 1}</span>
                  <span>{e.name}</span>
                  {e.weight && <small>({e.weight * (e.qty || 1)} lbs)</small>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="zz-bit__nota">Sin equipo registrado.</p>
          )}

          <div className="zz-bit__monedas">
            <span>{p.gp || 0} po</span>
            <span>{p.sp || 0} pp</span>
            <span>{p.cp || 0} pc</span>
          </div>
        </div>

        {/* HISTORIA Y NOTAS */}
        {p.notes && (
          <div className="zz-bit__panel">
            <h2>Historia y notas</h2>
            <div className="zz-bit__cuerpo"><p>{p.notes}</p></div>
          </div>
        )}

        {/* HISTORIAL DE EXPERIENCIA */}
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

        {/* CRÓNICAS VINCULADAS */}
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