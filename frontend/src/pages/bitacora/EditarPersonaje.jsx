import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { obtenerPersonajePorId, guardarPersonaje, eliminarPersonaje, sumarXp } from "../../lib/bitacoraService";
import { useAuth } from "../../lib/AuthContext";
import {
  ABILITIES,
  SKILLS,
  NIVELES_COMPETENCIA,
  PERSONAJE_VACIO,
  calcularFicha,
  conSigno,
  modificador,
} from "../../lib/dndRules";
import ImageUpload from "../../components/ImageUpload";
import "./bitacora.css";

// Lista de filas editables (rasgos, ataques, equipo).
function ListaEditable({ titulo, items, onChange, campos, vacio, textoAgregar }) {
  const cambiar = (i, campo, valor) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, [campo]: valor } : it)));
  const quitar = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="zz-bit__lista">
      <h3>{titulo}</h3>
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
  const esNuevo = id === "nuevo";

  const [f, setF] = useState(PERSONAJE_VACIO);
  const [xp, setXp] = useState(0);
  const [cargando, setCargando] = useState(!esNuevo);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (esNuevo) return;
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

  // Los hooks van antes de cualquier return.
  const ficha = useMemo(() => calcularFicha(f, xp), [f, xp]);

  const set = (campo, valor) => setF((prev) => ({ ...prev, [campo]: valor }));
  const alternarSalvacion = (key) =>
    set("saves", f.saves.includes(key) ? f.saves.filter((k) => k !== key) : [...f.saves, key]);
  const setHabilidad = (key, nivel) => set("skills", { ...f.skills, [key]: Number(nivel) });

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

  return (
    <section className="section zz-bit">
      <div className="container" style={{ maxWidth: 900 }}>
        <Link to="/bitacora/editar" className="zz-bit__nota">← Mi bitácora</Link>
        <p className="eyebrow" style={{ marginTop: "1rem" }}>
          {esNuevo ? "Nuevo personaje" : "Editar personaje"}
        </p>
        <h1>{f.name || "Sin nombre"}</h1>
        <p className="zz-bit__nota" style={{ margin: "0.5rem 0 var(--space-md)" }}>
          Nivel {ficha.nivel} (lo decide la experiencia) · Competencia {conSigno(ficha.prof)}. La experiencia
          se suma desde «Mi bitácora → Repartir experiencia».
        </p>

        <form className="zz-form" onSubmit={guardar}>
          <fieldset className="zz-bit__bloque">
            <legend>Retrato</legend>
            <ImageUpload
              value={f.portrait_url}
              onChange={(url) => set("portrait_url", url)}
              userId={session.user.id}
              etiqueta="Foto"
            />
          </fieldset>

          <fieldset className="zz-bit__bloque">
            <legend>Identidad</legend>
            <div className="zz-bit__fila-campos">
              <label>Nombre<input value={f.name} onChange={(e) => set("name", e.target.value)} required /></label>
              <label>Clase<input value={f.class_name || ""} onChange={(e) => set("class_name", e.target.value)} placeholder="Pícaro" /></label>
              <label>Especie<input value={f.species || ""} onChange={(e) => set("species", e.target.value)} placeholder="Mediano" /></label>
              <label>Trasfondo<input value={f.background || ""} onChange={(e) => set("background", e.target.value)} placeholder="Criminal" /></label>
              <label>Alineamiento<input value={f.alignment || ""} onChange={(e) => set("alignment", e.target.value)} /></label>
              <label>Talla<input value={f.size || ""} onChange={(e) => set("size", e.target.value)} /></label>
              <label>Velocidad<input value={f.speed || ""} onChange={(e) => set("speed", e.target.value)} /></label>
            </div>
          </fieldset>

          <fieldset className="zz-bit__bloque">
            <legend>Combate</legend>
            <div className="zz-bit__fila-campos">
              <label>Clase de armadura<input type="number" value={f.ac} onChange={(e) => set("ac", e.target.value)} /></label>
              <label>Vida máxima<input type="number" value={f.hp_max} onChange={(e) => set("hp_max", e.target.value)} /></label>
              <label>Vida actual<input type="number" value={f.hp_current} onChange={(e) => set("hp_current", e.target.value)} /></label>
              <label>Dado de golpe<input value={f.hit_die || ""} onChange={(e) => set("hit_die", e.target.value)} placeholder="1d8" /></label>
              <label>
                Extra de iniciativa
                <input type="number" value={f.initiative_bonus} onChange={(e) => set("initiative_bonus", e.target.value)} />
                <small className="zz-bit__nota">Iniciativa total: {conSigno(ficha.iniciativa)}</small>
              </label>
            </div>
          </fieldset>

          <fieldset className="zz-bit__bloque">
            <legend>Puntuaciones de característica</legend>
            <div className="zz-bit__puntajes">
              {ABILITIES.map((a) => (
                <label key={a.key}>
                  {a.label}
                  <input type="number" min="1" max="30" value={f[a.col]} onChange={(e) => set(a.col, e.target.value)} />
                  <small>Mod. {conSigno(modificador(f[a.col]))}</small>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="zz-bit__bloque">
            <legend>Tiradas de salvación competentes</legend>
            <div className="zz-bit__fila-campos">
              {ficha.salvaciones.map((s) => (
                <label className="zz-bit__check" key={s.key}>
                  <input type="checkbox" checked={s.competente} onChange={() => alternarSalvacion(s.key)} />
                  {s.label} ({conSigno(s.bonus)})
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="zz-bit__bloque">
            <legend>Habilidades</legend>
            {ficha.habilidades.map((h) => (
              <div className="zz-bit__habilidad-fila" key={h.key}>
                <span>{h.label} <small className="zz-bit__nota">({h.abbr})</small></span>
                <select value={h.nivelComp} onChange={(e) => setHabilidad(h.key, e.target.value)}>
                  {NIVELES_COMPETENCIA.map((n, i) => (
                    <option key={n} value={i}>{n}</option>
                  ))}
                </select>
                <span className="zz-bit__bonus">{conSigno(h.bonus)}</span>
              </div>
            ))}
          </fieldset>

          <fieldset className="zz-bit__bloque">
            <legend>Idiomas y competencias</legend>
            <div className="zz-bit__fila-campos">
              <label>Idiomas<input value={f.languages || ""} onChange={(e) => set("languages", e.target.value)} placeholder="Común, Élfico…" /></label>
              <label>Armaduras<input value={f.armor_prof || ""} onChange={(e) => set("armor_prof", e.target.value)} placeholder="Ligera" /></label>
              <label>Armas<input value={f.weapon_prof || ""} onChange={(e) => set("weapon_prof", e.target.value)} placeholder="Espada corta, estoque…" /></label>
              <label>Herramientas<input value={f.tool_prof || ""} onChange={(e) => set("tool_prof", e.target.value)} placeholder="Herramientas de ladrón" /></label>
            </div>
          </fieldset>

          <fieldset className="zz-bit__bloque">
            <legend>Rasgos</legend>
            <ListaEditable
              titulo=""
              items={f.features}
              onChange={(v) => set("features", v)}
              vacio={{ name: "", text: "" }}
              textoAgregar="+ Agregar rasgo"
              campos={[
                { key: "name", placeholder: "Nombre del rasgo (ej. Ataque furtivo)" },
                { key: "text", placeholder: "Qué hace…", tipo: "textarea" },
              ]}
            />
          </fieldset>

          <fieldset className="zz-bit__bloque">
            <legend>Armas y ataques</legend>
            <ListaEditable
              titulo=""
              items={f.attacks}
              onChange={(v) => set("attacks", v)}
              vacio={{ name: "", range: "", bonus: "", damage: "", notes: "" }}
              textoAgregar="+ Agregar arma"
              campos={[
                { key: "name", placeholder: "Arma (ej. Daga)" },
                { key: "range", placeholder: "Alcance (20/60)" },
                { key: "bonus", placeholder: "Golpear (+5)" },
                { key: "damage", placeholder: "Daño (1d4+3)" },
                { key: "notes", placeholder: "Notas" },
              ]}
            />
          </fieldset>

          <fieldset className="zz-bit__bloque">
            <legend>Equipo y monedas</legend>
            <ListaEditable
              titulo=""
              items={f.equipment}
              onChange={(v) => set("equipment", v)}
              vacio={{ name: "", qty: 1 }}
              textoAgregar="+ Agregar objeto"
              campos={[
                { key: "qty", placeholder: "Cant.", tipo: "number", ancho: "90px" },
                { key: "name", placeholder: "Objeto" },
              ]}
            />
            <div className="zz-bit__fila-campos" style={{ marginTop: "var(--space-sm)" }}>
              <label>Oro (po)<input type="number" min="0" value={f.gp} onChange={(e) => set("gp", e.target.value)} /></label>
              <label>Plata (pp)<input type="number" min="0" value={f.sp} onChange={(e) => set("sp", e.target.value)} /></label>
              <label>Cobre (pc)<input type="number" min="0" value={f.cp} onChange={(e) => set("cp", e.target.value)} /></label>
            </div>
          </fieldset>

          <fieldset className="zz-bit__bloque">
            <legend>Historia y notas</legend>
            <textarea rows="5" value={f.notes || ""} onChange={(e) => set("notes", e.target.value)} />
          </fieldset>

          <label className="zz-bit__check">
            <input type="checkbox" checked={f.published} onChange={(e) => set("published", e.target.checked)} />
            Publicado (visible para todos en la bitácora)
          </label>

          <div className="zz-bit__acciones">
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