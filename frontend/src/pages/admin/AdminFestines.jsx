import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../lib/AuthContext";
import "./admin.css";
import "./adminFestines.css";

const FESTIN_VACIO = {
  id: null,
  title: "",
  slug: "",
  description: "",
  event_date: "",
  pickup_info: "",
  meme_urls: "",
  active: true,
};

const ITEM_VACIO = { name: "", price: "", stock: "" };

function slugify(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminFestines() {
  const { logout } = useAuth();
  const [festines, setFestines] = useState([]);
  const [estado, setEstado] = useState("cargando");
  const [form, setForm] = useState(FESTIN_VACIO);
  const [slugTocado, setSlugTocado] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [copiadoId, setCopiadoId] = useState(null);

  const [festinAbierto, setFestinAbierto] = useState(null); // festín cuyos platos se gestionan
  const [items, setItems] = useState([]);
  const [nuevoItem, setNuevoItem] = useState(ITEM_VACIO);
  const [errorItems, setErrorItems] = useState(null);

  const cargar = () => {
    setEstado("cargando");
    supabase
      .from("feasts")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setEstado("error");
          return;
        }
        setFestines(data);
        setEstado("listo");
      });
  };

  useEffect(cargar, []);

  const handleTitulo = (e) => {
    const title = e.target.value;
    setForm((f) => ({ ...f, title, slug: slugTocado || f.id ? f.slug : slugify(title) }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "slug") setSlugTocado(true);
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const nuevo = () => {
    setForm(FESTIN_VACIO);
    setSlugTocado(false);
    setError(null);
    setMostrarFormulario(true);
  };

  const editar = (festin) => {
    setForm({ ...festin, event_date: festin.event_date || "", pickup_info: festin.pickup_info || "", meme_urls: festin.meme_urls || "", description: festin.description || "" });
    setSlugTocado(true);
    setError(null);
    setMostrarFormulario(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    const payload = {
      title: form.title.trim(),
      slug: slugify(form.slug || form.title),
      description: form.description,
      event_date: form.event_date || null,
      pickup_info: form.pickup_info,
      meme_urls: form.meme_urls,
      active: form.active,
    };

    const { error } = form.id
      ? await supabase.from("feasts").update(payload).eq("id", form.id)
      : await supabase.from("feasts").insert([payload]);

    setGuardando(false);

    if (error) {
      setError(
        error.message.includes("duplicate")
          ? "Ya existe un festín con ese enlace. Cambia el campo «Enlace»."
          : error.message
      );
      return;
    }

    setForm(FESTIN_VACIO);
    setMostrarFormulario(false);
    cargar();
  };

  const alternarActivo = async (festin) => {
    const { error } = await supabase.from("feasts").update({ active: !festin.active }).eq("id", festin.id);
    if (!error) {
      setFestines((prev) => prev.map((f) => (f.id === festin.id ? { ...f, active: !f.active } : f)));
    }
  };

  const eliminar = async (festin) => {
    if (
      !confirm(
        `¿Eliminar «${festin.title}»? También se borrarán sus platos y TODOS sus pedidos. Si solo quieres cerrarlo, usa «Ocultar».`
      )
    )
      return;
    const { error } = await supabase.from("feasts").delete().eq("id", festin.id);
    if (error) {
      alert("No se pudo eliminar: " + error.message);
      return;
    }
    if (festinAbierto?.id === festin.id) setFestinAbierto(null);
    setFestines((prev) => prev.filter((f) => f.id !== festin.id));
  };

  const copiarEnlace = (festin) => {
    navigator.clipboard.writeText(`${window.location.origin}/festin/${festin.slug}`).then(() => {
      setCopiadoId(festin.id);
      setTimeout(() => setCopiadoId(null), 2000);
    });
  };

  // ---- Platos ----
  const cargarItems = (festinId) => {
    supabase
      .from("feast_items")
      .select("*")
      .eq("feast_id", festinId)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true })
      .then(({ data }) => setItems(data || []));
  };

  const abrirPlatos = (festin) => {
    setFestinAbierto(festin);
    setNuevoItem(ITEM_VACIO);
    setErrorItems(null);
    cargarItems(festin.id);
  };

  const agregarItem = async (e) => {
    e.preventDefault();
    setErrorItems(null);
    const posicion = items.reduce((max, i) => Math.max(max, i.position || 0), 0) + 1;
    const { error } = await supabase.from("feast_items").insert([
      {
        feast_id: festinAbierto.id,
        name: nuevoItem.name.trim(),
        price: Number(nuevoItem.price),
        stock: parseInt(nuevoItem.stock, 10) || 0,
        position: posicion,
      },
    ]);
    if (error) {
      setErrorItems(error.message);
      return;
    }
    setNuevoItem(ITEM_VACIO);
    cargarItems(festinAbierto.id);
  };

  const editarItemLocal = (id, campo, valor) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [campo]: valor } : i)));
  };

  const guardarItem = async (item) => {
    setErrorItems(null);
    const { error } = await supabase
      .from("feast_items")
      .update({
        name: item.name.trim(),
        price: Number(item.price),
        stock: parseInt(item.stock, 10) || 0,
      })
      .eq("id", item.id);
    if (error) setErrorItems(error.message);
    else cargarItems(festinAbierto.id);
  };

  const eliminarItem = async (item) => {
    if (!confirm(`¿Quitar «${item.name}»? Los pedidos que ya lo incluyen conservan su registro.`)) return;
    const { error } = await supabase.from("feast_items").delete().eq("id", item.id);
    if (error) setErrorItems(error.message);
    else cargarItems(festinAbierto.id);
  };

  return (
    <section className="section container">
      <div className="zz-admin__header">
        <div>
          <p className="eyebrow">Panel de administración</p>
          <h1>Festines</h1>
        </div>
        <div className="zz-admin__header-acciones">
          <Link to="/admin/pedidos" className="btn btn-ghost">Pedidos</Link>
          <Link to="/admin/productos" className="btn btn-ghost">Productos</Link>
          <button className="btn btn-ghost" onClick={logout}>Cerrar sesión</button>
        </div>
      </div>

      {!mostrarFormulario && (
        <button className="btn" onClick={nuevo} style={{ marginBottom: "1.5rem" }}>
          + Nuevo festín
        </button>
      )}

      {mostrarFormulario && (
        <div className="zz-panel">
          <h2>{form.id ? "Editar festín" : "Nuevo festín"}</h2>
          <form className="zz-form zz-admin__form-producto" onSubmit={guardar}>
            <label>
              Título del evento
              <input type="text" name="title" value={form.title} onChange={handleTitulo} placeholder="Ej. Pollada del Aquelarre" required />
            </label>
            <label>
              Enlace (así se verá: /festin/…)
              <input type="text" name="slug" value={form.slug} onChange={handleChange} placeholder="pollada-del-aquelarre" required />
            </label>
            <label>
              Descripción
              <textarea name="description" rows="2" value={form.description} onChange={handleChange} placeholder="Para qué es el evento, qué incluye cada plato…" />
            </label>
            <div className="zz-admin__form-fila">
              <label>
                Fecha del evento
                <input type="date" name="event_date" value={form.event_date} onChange={handleChange} />
              </label>
              <label style={{ gridColumn: "span 2" }}>
                Recojo / lugar y horario
                <input type="text" name="pickup_info" value={form.pickup_info} onChange={handleChange} placeholder="Ej. Recojo de 12 a 3 pm en Pueblo Libre" />
              </label>
            </div>
            <label>
              Memes (una URL o ruta por línea, ej. /memes/pollo1.jpg)
              <textarea name="meme_urls" rows="3" value={form.meme_urls} onChange={handleChange} placeholder={"/memes/pollo1.jpg\n/memes/pollo2.jpg"} />
            </label>
            <label className="zz-admin__checkbox">
              <input type="checkbox" name="active" checked={form.active} onChange={handleChange} />
              Publicado (visible para quien tenga el enlace)
            </label>

            <div className="zz-admin__form-acciones">
              <button className="btn" type="submit" disabled={guardando}>
                {guardando ? "Guardando…" : form.id ? "Guardar cambios" : "Crear festín"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => { setForm(FESTIN_VACIO); setMostrarFormulario(false); }}>
                Cancelar
              </button>
            </div>

            {error && <p className="zz-form__status zz-form__status--error">{error}</p>}
          </form>
        </div>
      )}

      <h2 style={{ marginTop: "2.5rem", marginBottom: "1rem" }}>Tus festines</h2>

      {estado === "cargando" && <p className="zz-bazar__status">Cargando…</p>}
      {estado === "error" && <p className="zz-bazar__status">No se pudieron cargar los festines.</p>}
      {estado === "listo" && festines.length === 0 && (
        <p className="zz-bazar__status">Aún no creaste ningún festín.</p>
      )}

      {estado === "listo" && festines.length > 0 && (
        <div className="zz-admin__tabla-wrap">
          <table className="zz-admin__tabla-productos">
            <thead>
              <tr>
                <th>Evento</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {festines.map((f) => (
                <tr key={f.id} className={!f.active ? "zz-admin__fila--inactiva" : ""}>
                  <td>
                    {f.title}
                    <div className="zz-admin__tabla-dim" style={{ fontSize: "0.72rem" }}>/festin/{f.slug}</div>
                  </td>
                  <td className="zz-admin__tabla-dim">
                    {f.event_date ? new Date(f.event_date + "T00:00:00").toLocaleDateString("es-PE") : "—"}
                  </td>
                  <td>
                    {f.active ? (
                      <span className="zz-admin__badge zz-admin__badge--activo">Publicado</span>
                    ) : (
                      <span className="zz-admin__badge zz-admin__badge--cancelado">Oculto</span>
                    )}
                  </td>
                  <td>
                    <div className="zz-admin__tabla-acciones" style={{ flexWrap: "wrap" }}>
                      <button className="btn btn-ghost" onClick={() => abrirPlatos(f)}>Platos</button>
                      <Link to={`/admin/festines/${f.id}/pedidos`} className="btn btn-ghost">Pedidos</Link>
                      <button className="btn btn-ghost" onClick={() => copiarEnlace(f)}>
                        {copiadoId === f.id ? "¡Copiado!" : "Copiar enlace"}
                      </button>
                      <button className="btn btn-ghost" onClick={() => editar(f)}>Editar</button>
                      <button className="btn btn-ghost" onClick={() => alternarActivo(f)}>
                        {f.active ? "Ocultar" : "Publicar"}
                      </button>
                      <button className="zz-admin__eliminar" onClick={() => eliminar(f)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {festinAbierto && (
        <div className="zz-panel zz-admin__panel-platos">
          <div className="zz-admin__header" style={{ marginBottom: "var(--space-sm)" }}>
            <h2>Platos de «{festinAbierto.title}»</h2>
            <button className="btn btn-ghost" onClick={() => setFestinAbierto(null)}>Cerrar</button>
          </div>
          <p className="zz-admin__tabla-dim" style={{ fontSize: "0.82rem", marginBottom: "var(--space-sm)" }}>
            El stock baja solo con cada pedido y vuelve a subir si cancelas uno. Puedes corregirlo a mano aquí.
          </p>

          {items.length > 0 && (
            <div className="zz-admin__tabla-wrap">
              <table className="zz-admin__tabla-productos">
                <thead>
                  <tr>
                    <th>Plato</th>
                    <th>Precio (S/)</th>
                    <th>Stock</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <input
                          className="zz-admin__input-mini zz-admin__input-mini--ancho"
                          value={item.name}
                          onChange={(e) => editarItemLocal(item.id, "name", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          className="zz-admin__input-mini"
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => editarItemLocal(item.id, "price", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          className="zz-admin__input-mini"
                          type="number"
                          value={item.stock}
                          onChange={(e) => editarItemLocal(item.id, "stock", e.target.value)}
                        />
                      </td>
                      <td>
                        <div className="zz-admin__tabla-acciones">
                          <button className="btn btn-ghost" onClick={() => guardarItem(item)}>Guardar</button>
                          <button className="zz-admin__eliminar" onClick={() => eliminarItem(item)}>Quitar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <form className="zz-admin__nuevo-plato" onSubmit={agregarItem}>
            <label>
              Nuevo plato
              <input
                className="zz-admin__input-mini zz-admin__input-mini--ancho"
                value={nuevoItem.name}
                onChange={(e) => setNuevoItem({ ...nuevoItem, name: e.target.value })}
                placeholder="Ej. Pecho"
                required
              />
            </label>
            <label>
              Precio (S/)
              <input
                className="zz-admin__input-mini"
                type="number"
                step="0.01"
                value={nuevoItem.price}
                onChange={(e) => setNuevoItem({ ...nuevoItem, price: e.target.value })}
                required
              />
            </label>
            <label>
              Stock
              <input
                className="zz-admin__input-mini"
                type="number"
                min="0"
                value={nuevoItem.stock}
                onChange={(e) => setNuevoItem({ ...nuevoItem, stock: e.target.value })}
                required
              />
            </label>
            <button className="btn" type="submit">Agregar</button>
          </form>

          {errorItems && <p className="zz-form__status zz-form__status--error">{errorItems}</p>}
        </div>
      )}
    </section>
  );
}