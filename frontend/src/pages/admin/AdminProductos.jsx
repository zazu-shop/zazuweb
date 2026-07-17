import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../lib/AuthContext";
import "./admin.css";

const PRODUCTO_VACIO = {
  id: null,
  name: "",
  description: "",
  price: "",
  compare_at_price: "",
  category: "General",
  image_url: "",
  stock: 10,
  featured: false,
};

export default function AdminProductos() {
  const { logout } = useAuth();
  const [productos, setProductos] = useState([]);
  const [estado, setEstado] = useState("cargando");
  const [form, setForm] = useState(PRODUCTO_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleEditar = (producto) => {
    setForm(producto);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNuevo = () => setForm(PRODUCTO_VACIO);

  const handleEliminar = async (id) => {
    if (!confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) setProductos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      category: form.category,
      image_url: form.image_url,
      stock: Number(form.stock),
      featured: form.featured,
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
          <button className="btn btn-ghost" onClick={logout}>Cerrar sesión</button>
        </div>
      </div>

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
              <input type="text" name="category" value={form.category} onChange={handleChange} />
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

          <div className="zz-admin__form-acciones">
            <button className="btn" type="submit" disabled={guardando}>
              {guardando ? "Guardando…" : form.id ? "Guardar cambios" : "Crear producto"}
            </button>
            {form.id && (
              <button type="button" className="btn btn-ghost" onClick={handleNuevo}>
                Cancelar edición
              </button>
            )}
          </div>

          {error && <p className="zz-form__status zz-form__status--error">{error}</p>}
        </form>
      </div>

      <h2 style={{ marginTop: "2.5rem", marginBottom: "1rem" }}>Catálogo actual</h2>

      {estado === "cargando" && <p className="zz-bazar__status">Cargando productos…</p>}
      {estado === "error" && <p className="zz-bazar__status">No se pudieron cargar los productos.</p>}

      {estado === "listo" && (
        <div className="zz-admin__lista">
          {productos.map((producto) => (
            <div className="zz-admin__producto-fila" key={producto.id}>
              {producto.image_url ? (
                <img src={producto.image_url} alt={producto.name} />
              ) : (
                <div className="zz-admin__producto-placeholder" />
              )}
              <div className="zz-admin__producto-info">
                <p className="zz-admin__producto-nombre">
                  {producto.featured && <span title="Destacado en inicio">⭐ </span>}
                  {producto.name}
                </p>
                <p className="zz-admin__producto-meta">
                  {producto.category} · S/ {producto.price} · Stock: {producto.stock}
                </p>
              </div>
              <button className="btn btn-ghost" onClick={() => handleEditar(producto)}>Editar</button>
              <button className="zz-admin__eliminar" onClick={() => handleEliminar(producto.id)}>Eliminar</button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}