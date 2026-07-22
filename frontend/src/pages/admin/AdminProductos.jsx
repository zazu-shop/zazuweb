import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../lib/AuthContext";
import "./admin.css";

const PRODUCTO_VACIO = {
  id: null,
  name: "",
  description: "",
  features: "",
  lore: "",
  price: "",
  compare_at_price: "",
  category: "General",
  image_url: "",
  stock: 10,
  featured: false,
  is_baul: false,
  baul_note: "",
  active: true,
};

export default function AdminProductos() {
  const { logout } = useAuth();
  const [productos, setProductos] = useState([]);
  const [estado, setEstado] = useState("cargando");
  const [form, setForm] = useState(PRODUCTO_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const cargar = () => {
    setEstado("cargando");
    supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setEstado("error");
          return;
        }
        setProductos(data);
        setEstado("listo");
      });
  };

  useEffect(cargar, []);

  const productosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return productos;
    const q = busqueda.trim().toLowerCase();
    return productos.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.category || "").toLowerCase().includes(q)
    );
  }, [productos, busqueda]);

  const categoriasExistentes = useMemo(() => {
    const set = new Set(productos.map((p) => p.category).filter(Boolean));
    return Array.from(set).sort();
  }, [productos]);

  const stockBajo = useMemo(
    () => productos.filter((p) => p.active && p.stock > 0 && p.stock <= 2),
    [productos]
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleEditar = (producto) => {
    setForm(producto);
    setMostrarFormulario(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNuevo = () => {
    setForm(PRODUCTO_VACIO);
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Eliminar este producto permanentemente? Si prefieres solo ocultarlo del Bazar sin perder el historial de pedidos, usa \"Marcar no disponible\" en vez de esto.")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) setProductos((prev) => prev.filter((p) => p.id !== id));
    else alert("No se pudo eliminar: " + error.message);
  };

  const alternarDisponibilidad = async (producto) => {
    const { error } = await supabase
      .from("products")
      .update({ active: !producto.active })
      .eq("id", producto.id);
    if (!error) {
      setProductos((prev) =>
        prev.map((p) => (p.id === producto.id ? { ...p, active: !p.active } : p))
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    const payload = {
      name: form.name,
      description: form.description,
      features: form.features,
      lore: form.lore,
      price: Number(form.price),
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      category: form.category,
      image_url: form.image_url,
      stock: Number(form.stock),
      featured: form.featured,
      is_baul: form.is_baul,
      baul_note: form.is_baul ? form.baul_note : null,
      active: form.active,
    };

    try {
      if (form.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert([payload]);
        if (error) throw error;
      }
      setForm(PRODUCTO_VACIO);
      setMostrarFormulario(false);
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="section container">
      <div className="zz-admin__header">
        <div>
          <p className="eyebrow">Panel de administración</p>
          <h1>Productos</h1>
        </div>
        <div className="zz-admin__header-acciones">
          <Link to="/admin/pedidos" className="btn btn-ghost">Ver pedidos</Link>
          <Link to="/admin/cupones" className="btn btn-ghost">Cupones</Link>
          <button className="btn btn-ghost" onClick={logout}>Cerrar sesión</button>
        </div>
      </div>

      {stockBajo.length > 0 && (
        <div className="zz-admin__alerta-stock">
          <p className="eyebrow">⚠ Stock bajo</p>
          <p>
            {stockBajo.length} pieza{stockBajo.length > 1 ? "s" : ""} con 2 unidades o menos:{" "}
            {stockBajo.map((p, i) => (
              <span key={p.id}>
                {p.name} ({p.stock})
                {i < stockBajo.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        </div>
      )}

      {!mostrarFormulario && (
        <button className="btn" onClick={handleNuevo} style={{ marginBottom: "1.5rem" }}>
          + Nuevo producto
        </button>
      )}

      {mostrarFormulario && (
        <div className="zz-panel">
          <h2>{form.id ? "Editar producto" : "Nuevo producto"}</h2>
          <form className="zz-form zz-admin__form-producto" onSubmit={handleSubmit}>
            <label>
              Nombre
              <input type="text" name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>
              Descripción
              <textarea name="description" rows="2" value={form.description} onChange={handleChange} />
            </label>
            <label>
              Características (una por línea)
              <textarea
                name="features"
                rows="4"
                value={form.features}
                onChange={handleChange}
                placeholder={"Madera de roble ahumado\nLatón envejecido a mano\nMide 8cm de alto"}
              />
            </label>
            <label>
              Micro-historia (opcional, breve relato de la pieza)
              <textarea
                name="lore"
                rows="3"
                value={form.lore}
                onChange={handleChange}
                placeholder="Ej. Se dice que este amuleto perteneció a un vigía que nunca dormía..."
              />
            </label>
            <div className="zz-admin__form-fila">
              <label>
                Precio (S/)
                <input type="number" step="0.01" name="price" value={form.price} onChange={handleChange} required />
              </label>
              <label>
                Precio tachado (opcional)
                <input type="number" step="0.01" name="compare_at_price" value={form.compare_at_price} onChange={handleChange} />
              </label>
              <label>
                Stock
                <input type="number" name="stock" value={form.stock} onChange={handleChange} required />
              </label>
            </div>
            <div className="zz-admin__form-fila">
              <label>
                Categoría
                <input
                  type="text"
                  name="category"
                  list="zz-categorias-existentes"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Elige una existente o escribe una nueva"
                />
                <datalist id="zz-categorias-existentes">
                  {categoriasExistentes.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </label>
              <label>
                URL de imagen
                <input type="text" name="image_url" value={form.image_url} onChange={handleChange} />
              </label>
            </div>

            <label className="zz-admin__checkbox">
              <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
              Mostrar en "Piezas destacadas" del inicio
            </label>

            <label className="zz-admin__checkbox">
              <input type="checkbox" name="is_baul" checked={form.is_baul} onChange={handleChange} />
              Enviar al Baúl (piezas con detalle, prototipos o descontinuadas)
            </label>

            {form.is_baul && (
              <label>
                Detalle del Baúl (se muestra públicamente, sé honesto)
                <textarea
                  name="baul_note"
                  rows="2"
                  value={form.baul_note}
                  onChange={handleChange}
                  placeholder="Ej. Pequeña imperfección en el barniz de la base, casi imperceptible."
                  required
                />
              </label>
            )}

            <div className="zz-admin__form-acciones">
              <button className="btn" type="submit" disabled={guardando}>
                {guardando ? "Guardando…" : form.id ? "Guardar cambios" : "Crear producto"}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setForm(PRODUCTO_VACIO);
                  setMostrarFormulario(false);
                }}
              >
                Cancelar
              </button>
            </div>

            {error && <p className="zz-form__status zz-form__status--error">{error}</p>}
          </form>
        </div>
      )}

      <div className="zz-admin__lista-header">
        <h2>Catálogo actual</h2>
        <input
          type="text"
          className="zz-admin__buscador"
          placeholder="Buscar por nombre o categoría…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {estado === "cargando" && <p className="zz-bazar__status">Cargando productos…</p>}
      {estado === "error" && <p className="zz-bazar__status">No se pudieron cargar los productos.</p>}

      {estado === "listo" && productosFiltrados.length === 0 && (
        <p className="zz-bazar__status">No hay productos que coincidan con tu búsqueda.</p>
      )}

      {estado === "listo" && productosFiltrados.length > 0 && (
        <div className="zz-admin__tabla-wrap">
          <table className="zz-admin__tabla-productos">
            <thead>
              <tr>
                <th></th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((producto) => (
                <tr key={producto.id} className={!producto.active ? "zz-admin__fila--inactiva" : ""}>
                  <td>
                    {producto.image_url ? (
                      <img src={producto.image_url} alt={producto.name} className="zz-admin__tabla-img" />
                    ) : (
                      <div className="zz-admin__producto-placeholder zz-admin__tabla-img" />
                    )}
                  </td>
                  <td>
                    {producto.featured && <span title="Destacado en inicio">⭐ </span>}
                    {producto.is_baul && <span title="En el Baúl">🗝️ </span>}
                    {producto.name}
                  </td>
                  <td className="zz-admin__tabla-dim">{producto.category}</td>
                  <td className="zz-admin__tabla-dim">S/ {producto.price}</td>
                  <td className="zz-admin__tabla-dim">{producto.stock}</td>
                  <td>
                    {producto.active ? (
                      <span className="zz-admin__badge zz-admin__badge--activo">Disponible</span>
                    ) : (
                      <span className="zz-admin__badge zz-admin__badge--cancelado">No disponible</span>
                    )}
                  </td>
                  <td>
                    <div className="zz-admin__tabla-acciones">
                      <button className="btn btn-ghost" onClick={() => alternarDisponibilidad(producto)}>
                        {producto.active ? "Ocultar" : "Reactivar"}
                      </button>
                      <button className="btn btn-ghost" onClick={() => handleEditar(producto)}>Editar</button>
                      <button className="zz-admin__eliminar" onClick={() => handleEliminar(producto.id)}>Eliminar</button>
                    </div>
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