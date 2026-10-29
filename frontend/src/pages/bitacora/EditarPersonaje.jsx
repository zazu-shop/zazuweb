import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  obtenerPersonajePorId,
  guardarPersonaje,
  eliminarPersonaje,
  sumarXp,
} from "../../lib/bitacoraService";
import { useAuth } from "../../lib/AuthContext";
import {
  ABILITIES,
  SKILLS,
  NIVELES_COMPETENCIA,
  PERSONAJE_VACIO,
  CLASES_OPCIONES_2024,
  ESPECIES_OPCIONES_2024,
  TRASFONDOS_OPCIONES_2024,
  CONJUNTO_ESTANDAR,
  aplicarPlantilla2024,
  calcularFicha,
  conSigno,
  modificador,
  calcularPuntosPointBuy
} from "../../lib/dndRules";
import ImageUpload from "../../components/ImageUpload";
import "./bitacora.css";
import "./editarPersonaje.css";

const AYUDA_ATRIBUTOS = {
  str: "Afecta: Ataques cuerpo a cuerpo, Atletismo y Capacidad de carga.",
  dex: "Afecta: Clase de Armadura, Iniciativa, Sigilo, Acrobacias y Juego de manos.",
  con: "Afecta: Puntos de Vida Máximos y Salvaciones de Concentración.",
  int: "Afecta: Arcanos, Historia, Investigación, Naturaleza, Religión y Magia de Mago.",
  wis: "Afecta: Percepción Pasiva, Perspicacia, Medicina, Supervivencia y Magia de Clérigo.",
  cha: "Afecta: Persuasión, Engaño, Intimidación, Rendimiento y Magia de Bardo/Brujo.",
};

function ListaEditable({ items, onChange, campos, vacio, textoAgregar, ayuda }) {
  const cambiar = (i, campo, valor) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, [campo]: valor } : it)));
  const quitar = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="zz-bit__lista">
      {ayuda && <p className="zz-edper__explicacion">{ayuda}</p>}
      {items.map((it, i) => (
        <div className="zz-bit__fila" key={i}>
          {campos.map((c) =>
            c.tipo === "textarea" ? (
              <textarea
                key={c.key}
                rows="2"
                placeholder={c.placeholder}
                value={it[c.key] || ""}
                onChange={(e) => cambiar(i, c.key, e.target.value)}
                style={{ flexBasis: "100%" }}
              />
            ) : (
              <input
                key={c.key}
                type={c.tipo || "text"}
                placeholder={c.placeholder}
                value={it[c.key] ?? ""}
                onChange={(e) => cambiar(i, c.key, e.target.value)}
                style={c.ancho ? { flex: "0 0 " + c.ancho } : undefined}
              />
            )
          )}
          <button type="button" className="zz-admin__eliminar" onClick={() => quitar(i)}>
            Quitar
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-ghost" onClick={() => onChange([...items, { ...vacio }])}>
        {textoAgregar}
      </button>
    </div>
  );
}

export default function EditarPersonaje() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();

  const esNuevo = !id || id === "nuevo";

  const [f, setF] = useState(PERSONAJE_VACIO);
  const [xp, setXp] = useState(0);
  const [cargando, setCargando] = useState(!esNuevo);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const modificarMonedas = (tipo, cantidad) => {
    setF((prev) => ({
      ...prev,
      [tipo]: Math.max(0, (Number(prev[tipo]) || 0) + cantidad),
    }));
  };

  useEffect(() => {
    if (esNuevo) {
      setCargando(false);
      return;
    }

    obtenerPersonajePorId(id)
      .then((p) => {
        if (!p) {
          setError("No se encontró este personaje.");
        } else {
          setF({
            ...PERSONAJE_VACIO,
            ...p,
            saves: p.saves || [],
            skills: p.skills || {},
            features: p.features || [],
            attacks: p.attacks || [],
            equipment: p.equipment || [],
          });
          setXp(sumarXp(p.dnd_xp_log));
        }
        setCargando(false);
      })
      .catch((err) => {
        setError(err.message);
        setCargando(false);
      });
  }, [id, esNuevo]);

  const ficha = useMemo(() => calcularFicha(f, xp), [f, xp]);

  const set = (campo, valor) => setF((prev) => ({ ...prev, [campo]: valor }));

  const alternarSalvacion = (key) =>
    set("saves", f.saves.includes(key) ? f.saves.filter((k) => k !== key) : [...f.saves, key]);

  const setHabilidad = (key, nivel) =>
    set("skills", { ...f.skills, [key]: Number(nivel) });

  const seleccionarClase = (nombre) => {
    setF((prev) => aplicarPlantilla2024(prev, { claseNombre: nombre }));
  };

  const seleccionarEspecie = (nombre) => {
    setF((prev) => aplicarPlantilla2024(prev, { especieNombre: nombre }));
  };

  const seleccionarTrasfondo = (nombre) => {
    setF((prev) => aplicarPlantilla2024(prev, { trasfondoNombre: nombre }));
  };

  const cargarConjuntoEstandar = () => {
    setF((prev) => ({
      ...prev,
      str_score: CONJUNTO_ESTANDAR[0],
      dex_score: CONJUNTO_ESTANDAR[1],
      con_score: CONJUNTO_ESTANDAR[2],
      int_score: CONJUNTO_ESTANDAR[3],
      wis_score: CONJUNTO_ESTANDAR[4],
      cha_score: CONJUNTO_ESTANDAR[5],
    }));
  };

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    try {
      const limpio = {
        ...f,
        features: f.features.filter((x) => x.name?.trim()),
        attacks: f.attacks.filter((x) => x.name?.trim()),
        equipment: f.equipment.filter((x) => x.name?.trim()),
      };

      if (esNuevo || !limpio.id || limpio.id === "nuevo") {
        delete limpio.id;
      }

      delete limpio.dnd_xp_log;

      const guardado = await guardarPersonaje(limpio, session.user.id);
      navigate(`/bitacora/personaje/${guardado.slug}`);
    } catch (err) {
      setError(err.message);
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    if (!confirm("¿Eliminar este personaje y su historial de XP? Las crónicas que lo mencionan se conservan.")) return;
    try {
      await eliminarPersonaje(id);
      navigate("/bitacora/editar");
    } catch (err) {
      setError(err.message);
    }
  };

  if (cargando) {
    return (
      <section className="section container">
        <p className="zz-bazar__status">Cargando hoja…</p>
      </section>
    );
  }

  const puntosGastados = calcularPuntosPointBuy(f);

  return (
    <section className="section zz-bit">
      <div className="zz-edper-container">
        <Link to="/bitacora/editar" className="zz-bit__nota">← Mi bitácora</Link>

        <header className="zz-edper__header">
          <div>
            <p className="eyebrow">{esNuevo ? "Nuevo personaje" : "Editar personaje"}</p>
            <h1>{f.name || "Sin nombre"}</h1>
          </div>
          <div className="zz-edper__badge-nivel">
            <span>Nivel <strong>{ficha.nivel}</strong></span>
            <small>Proficiencia {conSigno(ficha.prof)}</small>
          </div>
        </header>

        <form className="zz-form" onSubmit={guardar}>

          {/* MÓDULO 1: IDENTIDAD */}
          <div className="zz-edper__card">
            <div className="zz-edper__card-title">1. Identidad y Plantilla (D&D 2024)</div>
            <div className="zz-edper__grid-identidad">

              <div className="zz-edper__field zz-edper__field--span2">
                <label>Nombre del aventurero *</label>
                <input
                  value={f.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Ej. Bruenor"
                  required
                />
              </div>

              <div className="zz-edper__field">
                <label>Clase</label>
                <select value={f.class_name || ""} onChange={(e) => seleccionarClase(e.target.value)}>
                  <option value="">— Seleccionar Clase —</option>
                  {CLASES_OPCIONES_2024.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="zz-edper__field">
                <label>Especie</label>
                <select value={f.species || ""} onChange={(e) => seleccionarEspecie(e.target.value)}>
                  <option value="">— Seleccionar Especie —</option>
                  {ESPECIES_OPCIONES_2024.map((e) => (
                    <option key={e.name} value={e.name}>{e.name}</option>
                  ))}
                </select>
              </div>

              <div className="zz-edper__field">
                <label>Trasfondo</label>
                <select value={f.background || ""} onChange={(e) => seleccionarTrasfondo(e.target.value)}>
                  <option value="">— Seleccionar Trasfondo —</option>
                  {TRASFONDOS_OPCIONES_2024.map((t) => (
                    <option key={t.name} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="zz-edper__field">
                <label>Alineamiento <span className="zz-edper__tag-opt">(Opcional)</span></label>
                <input
                  value={f.alignment || ""}
                  onChange={(e) => set("alignment", e.target.value)}
                  placeholder="Ej. Neutral"
                />
              </div>

              <div className="zz-edper__field">
                <label>Talla</label>
                <input value={f.size || ""} onChange={(e) => set("size", e.target.value)} placeholder="Mediano" />
              </div>

              <div className="zz-edper__field">
                <label>Velocidad</label>
                <input value={f.speed || ""} onChange={(e) => set("speed", e.target.value)} placeholder="30 pies" />
              </div>

            </div>
          </div>

          {/* MÓDULO 2: ATRIBUTOS DE CARACTERÍSTICA */}
          <div className="zz-edper__card">
            <div className="zz-edper__card-title">
              <span>2. Puntuaciones de Característica</span>
              <span className={`zz-edper__badge-puntos ${puntosGastados > 27 ? 'zz-edper__badge-puntos--excedido' : ''}`}>
                Puntos Point Buy: <strong>{puntosGastados} / 27</strong>
              </span>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={cargarConjuntoEstandar}
                style={{ fontSize: "0.75rem" }}
              >
                ⚡ Valores Estándar (15, 14, 13, 12, 10, 8)
              </button>
            </div>

            <div className="zz-edper__grid-atributos">
              {ABILITIES.map((a) => (
                <div className="zz-edper__stat-card" key={a.key} title={AYUDA_ATRIBUTOS[a.key]}>
                  <div className="zz-edper__stat-head">
                    <span>{a.label} ({a.abbr})</span>
                    <span className="zz-edper__info-icon">ⓘ</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={f[a.col]}
                    onChange={(e) => set(a.col, e.target.value)}
                  />
                  <div className="zz-edper__mod-badge">
                    Mod. <strong>{conSigno(modificador(f[a.col]))}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MÓDULO 3: COMBATE */}
          <div className="zz-edper__card">
            <div className="zz-edper__card-title">3. Estadísticas de Combate y Protección</div>
            
            <div className="zz-edper__grid-combate">

              {/* Selector de Armadura Equipada */}
              <div className="zz-edper__field">
                <label>Armadura Equipada</label>
                <select 
                  value={f.armor_type || "ninguna"} 
                  onChange={(e) => {
                    const tipo = e.target.value;
                    const nuevaCA = calcularCAAutomatico(tipo, ficha.mods.dex, f.has_shield);
                    setF((prev) => ({ ...prev, armor_type: tipo, ac: nuevaCA }));
                  }}
                >
                  <option value="ninguna">Sin Armadura (10 + DES)</option>
                  <option value="cuero">Cuero (11 + DES)</option>
                  <option value="cuero_tachonado">Cuero Tachonado (12 + DES)</option>
                  <option value="cota_escamas">Cota de Escamas (14 + DES máx +2)</option>
                  <option value="coraza">Coraza (15 + DES máx +2)</option>
                  <option value="cota_malla">Cota de Malla (16 Fijo)</option>
                  <option value="placas">Placas (18 Fijo)</option>
                </select>
                <span className="zz-edper__subtext">Afecta cálculo de CA</span>
              </div>

              {/* Checkbox de Escudo */}
              <div className="zz-edper__field" style={{ justifyContent: "center" }}>
                <label className="zz-bit__check" style={{ marginTop: "1.2rem" }}>
                  <input 
                    type="checkbox" 
                    checked={Boolean(f.has_shield)} 
                    onChange={(e) => {
                      const tieneEscudo = e.target.checked;
                      const nuevaCA = calcularCAAutomatico(f.armor_type || "ninguna", ficha.mods.dex, tieneEscudo);
                      setF((prev) => ({ ...prev, has_shield: tieneEscudo, ac: nuevaCA }));
                    }} 
                  />
                  Lleva Escudo (+2 CA)
                </label>
                <span className="zz-edper__subtext"></span>
              </div>

              {/* CA Resultante (Editable por si hay objetos mágicos) */}
              <div className="zz-edper__field">
                <label>Clase de Armadura (CA)</label>
                <input type="number" value={f.ac} onChange={(e) => set("ac", e.target.value)} />
                <span className="zz-edper__subtext">Calculada: <strong>{f.ac}</strong></span>
              </div>

              <div className="zz-edper__field">
                <label>Vida Máxima (PG)</label>
                <input type="number" value={f.hp_max} onChange={(e) => set("hp_max", e.target.value)} />
                <span className="zz-edper__subtext"></span>
              </div>

              {/* VIDA ACTUAL (NUEVO CAMPO) */}
              <div className="zz-edper__field">
                <label>Vida Actual (HP Current)</label>
                <input
                  type="number"
                  min="0"
                  max={f.hp_max ?? 999}
                  value={f.hp_current ?? 0}
                  onChange={(e) => set("hp_current", Number(e.target.value) ?? 0)}
                  style={{
                    color: (f.hp_current ?? 0) === 0 ? "#ff4d4d" : "var(--zz-gold-bright)",
                    fontWeight: "bold"
                  }}
                />
                <span className="zz-edper__subtext">
                  {(f.hp_current ?? 0) === 0 ? "💀 Caído / Inconsciente" : "💚 Consciente"}
                </span>
              </div>

              <div className="zz-edper__field">
                <label>Dado de Golpe</label>
                <input value={f.hit_die || ""} onChange={(e) => set("hit_die", e.target.value)} placeholder="1d8" />
                <span className="zz-edper__subtext"></span>
              </div>

            </div>
          </div>

          {/* MÓDULO 4: SALVACIONES Y HABILIDADES */}
          <details className="zz-edper__details" open>
            <summary className="zz-edper__summary">
              4. Competencias: Tiradas de Salvación y Habilidades
            </summary>
            <div className="zz-edper__details-body">
              {/* LEYENDA CON ESTRUCTURA LIMPIA */}
              <div className="zz-edper__leyenda-box">
                <p className="zz-edper__leyenda-titulo">💡 Guía rápida de símbolos y modificadores:</p>
                <div className="zz-edper__leyenda-items">
                  <div className="zz-edper__leyenda-item">
                    <code>●</code> <strong>Competente:</strong> Suma tu bono de proficiencia (+{ficha.prof}) al d20.
                  </div>
                  <div className="zz-edper__leyenda-item">
                    <code>◆</code> <strong>Experto:</strong> Duplica tu bono de proficiencia en la habilidad.
                  </div>
                  <div className="zz-edper__leyenda-item">
                    <code>○</code> <strong>Sin competencia:</strong> Solo aplica tu modificador base de atributo.
                  </div>
                  <div className="zz-edper__leyenda-item">
                    <code>+X / -X</code> <strong>Modificador final:</strong> Cantidad exacta a sumar o restar al d20.
                  </div>
                </div>
              </div>

              <div className="zz-bit__subseccion">
                <h3>Salvaciones Competentes</h3>
                <div className="zz-edper__grid-salvaciones">
                  {ficha.salvaciones.map((s) => (
                    <label className="zz-bit__check" key={s.key}>
                      <input type="checkbox" checked={s.competente} onChange={() => alternarSalvacion(s.key)} />
                      <span>{s.label} (<strong>{conSigno(s.bonus)}</strong>)</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="zz-bit__subseccion" style={{ marginTop: "1.5rem" }}>
                <h3>Habilidades</h3>
                <div className="zz-edper__grid-habilidades">
                  {ficha.habilidades.map((h) => (
                    <div className="zz-edper__skill-item" key={h.key}>
                      <span className="zz-edper__skill-name">
                        {h.label} <small>({h.abbr})</small>
                      </span>
                      <select value={h.nivelComp} onChange={(e) => setHabilidad(h.key, e.target.value)}>
                        {NIVELES_COMPETENCIA.map((n, i) => (
                          <option key={n} value={i}>{n}</option>
                        ))}
                      </select>
                      <span className="zz-edper__skill-bonus">{conSigno(h.bonus)}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </details>

          {/* MÓDULO 5: DOMINIOS Y COMPETENCIAS ADICIONALES */}
          <details className="zz-edper__details">
          <summary className="zz-edper__summary">
            5. Idiomas y Competencias de Equipo <span className="zz-edper__tag-opt">(Autocompletado según Plantilla)</span>
          </summary>
          <div className="zz-edper__details-body">
            <p className="zz-edper__explicacion">
              Estos dominios se configuran automáticamente al elegir tu Clase, Especie y Trasfondo.
            </p>

            <div className="zz-edper__grid-identidad">
              
              <div className="zz-edper__field">
                <label>Idiomas Conocidos</label>
                <input 
                  value={f.languages || ""} 
                  onChange={(e) => set("languages", e.target.value)} 
                  placeholder="Ej. Común, Élfico, Jerga de ladrones" 
                />
                <span className="zz-edper__subtext">Otorgado por Especie y Trasfondo</span>
              </div>

              <div className="zz-edper__field">
                <label>Competencia en Armaduras</label>
                <input 
                  value={f.armor_prof || ""} 
                  onChange={(e) => set("armor_prof", e.target.value)} 
                  placeholder="Ej. Armadura Ligera" 
                />
                <span className="zz-edper__subtext">Otorgado por tu Clase</span>
              </div>

              <div className="zz-edper__field">
                <label>Armas Permitidas</label>
                <input 
                  value={f.weapon_prof || ""} 
                  onChange={(e) => set("weapon_prof", e.target.value)} 
                  placeholder="Ej. Simples, Marciales, Sutiles" 
                />
                <span className="zz-edper__subtext">Otorgado por tu Clase</span>
              </div>

              <div className="zz-edper__field">
                <label>Dominio de Armas (Weapon Mastery)</label>
                <input 
                  value={f.weapon_mastery || ""} 
                  onChange={(e) => set("weapon_mastery", e.target.value)} 
                  placeholder="Ej. Daga (Nick), Estoque (Vex)" 
                />
                <span className="zz-edper__subtext">Propiedades tácticas D&D 2024</span>
              </div>

              <div className="zz-edper__field">
                <label>Herramientas y Juegos</label>
                <input 
                  value={f.tool_prof || ""} 
                  onChange={(e) => set("tool_prof", e.target.value)} 
                  placeholder="Ej. Herramientas de Ladrón" 
                />
                <span className="zz-edper__subtext">Otorgado por Clase y Trasfondo</span>
              </div>

            </div>
          </div>
        </details>
          

          {/* MÓDULO 6: RASGOS Y ATAQUES */}
          <details className="zz-edper__details">
            <summary className="zz-edper__summary">
              6. Rasgos, Ataques e Inventario
            </summary>
            <div className="zz-edper__details-body">

              <ListaEditable
                ayuda="Habilidades especiales, talentos de origen y capacidades de clase."
                items={f.features}
                onChange={(v) => set("features", v)}
                vacio={{ name: "", text: "" }}
                textoAgregar="+ Agregar rasgo"
                campos={[
                  { key: "name", placeholder: "Nombre del rasgo (ej. Segundo Aliento)" },
                  { key: "text", placeholder: "Descripción o efecto…", tipo: "textarea" },
                ]}
              />

              <hr className="zz-bit__separador" />

              <ListaEditable
                ayuda="Ataques con armas y hechizos."
                items={f.attacks}
                onChange={(v) => set("attacks", v)}
                vacio={{ name: "", range: "", bonus: "", damage: "", notes: "" }}
                textoAgregar="+ Agregar arma"
                campos={[
                  { key: "name", placeholder: "Arma (ej. Espada Larga)" },
                  { key: "range", placeholder: "Alcance (ej. Cuerpo a cuerpo)" },
                  { key: "bonus", placeholder: "Golpear (+5)" },
                  { key: "damage", placeholder: "Daño (1d8+3)" },
                  { key: "notes", placeholder: "Propiedades" },
                ]}
              />

              <hr className="zz-bit__separador" />

              <ListaEditable
                ayuda="Mochila y objetos."
                items={f.equipment}
                onChange={(v) => set("equipment", v)}
                vacio={{ name: "", qty: 1 }}
                textoAgregar="+ Agregar objeto"
                campos={[
                  { key: "qty", placeholder: "Cant.", tipo: "number", ancho: "80px" },
                  { key: "name", placeholder: "Objeto" },
                ]}
              />

              <div className="zz-edper__grid-monedas">
                <div className="zz-edper__field">
                  <label>Oro (po)</label>
                  <input type="number" min="0" value={f.gp} onChange={(e) => set("gp", e.target.value)} />
                </div>
                <div className="zz-edper__field">
                  <label>Plata (pp)</label>
                  <input type="number" min="0" value={f.sp} onChange={(e) => set("sp", e.target.value)} />
                </div>
                <div className="zz-edper__field">
                  <label>Cobre (pc)</label>
                  <input type="number" min="0" value={f.cp} onChange={(e) => set("cp", e.target.value)} />
                </div>
              </div>

            </div>
          </details>
          

          {/* MÓDULO 7: HISTORIA Y PUBLICACIÓN */}
          <details className="zz-edper__details">
            <summary className="zz-edper__summary">
              7. Retrato, Historia y Visibilidad
            </summary>
            <div className="zz-edper__details-body">

              <div className="zz-edper__field">
                <label>Foto de Retrato</label>
                <ImageUpload
                  value={f.portrait_url}
                  onChange={(url) => set("portrait_url", url)}
                  userId={session.user.id}
                  etiqueta="Foto"
                />
              </div>

              <div className="zz-edper__field" style={{ marginTop: "1rem" }}>
                <label>Historia del personaje y notas</label>
                <textarea
                  rows="4"
                  value={f.notes || ""}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Historia personal, metas o aliados…"
                />
              </div>

              <label className="zz-bit__check" style={{ marginTop: "1rem" }}>
                <input
                  type="checkbox"
                  checked={f.published}
                  onChange={(e) => set("published", e.target.checked)}
                />
                Publicado (visible para todos en la bitácora)
              </label>

            </div>
          </details>

          {/* ACCIONES */}
          <div className="zz-bit__acciones" style={{ marginTop: "var(--space-lg)" }}>
            <button className="btn" type="submit" disabled={guardando}>
              {guardando ? "Guardando…" : "Guardar personaje"}
            </button>
            <Link to="/bitacora/editar" className="btn btn-ghost">Cancelar</Link>
            {!esNuevo && (
              <button type="button" className="zz-admin__eliminar" onClick={eliminar}>
                Eliminar personaje
              </button>
            )}
          </div>

          {error && <p className="zz-form__status zz-form__status--error">{error}</p>}
        </form>
      </div>
    </section>
  );
}