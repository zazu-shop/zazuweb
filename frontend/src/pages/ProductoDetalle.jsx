import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useCart } from "../lib/CartContext";
import "./productoDetalle.css";

export default function ProductoDetalle() {
  const { id } = useParams();
  const { addItem } = useCart();

  const [producto, setProducto] = useState(null);
  const [estado, setEstado] = useState("cargando"); // cargando | listo | error
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    let activo = true;
    if (!supabase) {
      setEstado("error");
      return;
    }

    supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (!activo) return;
        if (error || !data) {
          setEstado("error");
          return;
        }
        setProducto(data);
        setEstado("listo");
      });

    return () => {
      activo = false;
    };
  }, [id]);

  const handleAgregar = () => {
    addItem(producto, cantidad);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  if (estado === "cargando") {
    return (
      <section className="section container">
        <p className="zz-bazar__status">Invocando la pieza…</p>
      </section>
    );
  }

  if (estado === "error" || !producto) {
    return (
      <section className="section container zz-detalle__notfound">
        <p className="eyebrow">Pieza no encontrada</p>
        <h1>Este objeto no está en el bazar</h1>
        <Link to="/bazar" className="btn">Volver al Bazar</Link>
      </section>
    );
  }

  const agotado = producto.stock === 0;

  return (
    <section className="section">
      <div className="container zz-detalle">
        <div className="zz-detalle__media">
          {producto.image_url ? (
            <img src={producto.image_url} alt={producto.name} />
          ) : (
            <div className="zz-detalle__media--placeholder" />
          )}
        </div>

        <div className="zz-detalle__info">
          <p className="eyebrow">{producto.category || "General"}</p>
          <h1>{producto.name}</h1>
          {producto.compare_at_price > producto.price && (
            <p className="zz-detalle__price-old">S/ {producto.compare_at_price}</p>
          )}
          <p className="zz-detalle__price">S/ {producto.price}</p>

          <div className="zz-detalle__descripcion">
            <p className="eyebrow">Descripción</p>
            <p className="lead">{producto.description}</p>
          </div>

          {producto.features && (
            <div className="zz-detalle__caracteristicas">
              <p className="eyebrow">Características</p>
              <ul>
                {producto.features
                  .split("\n")
                  .map((f) => f.trim())
                  .filter(Boolean)
                  .map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
              </ul>
            </div>
          )}

          <p className="zz-detalle__stock">
            {agotado ? "Sin stock por ahora" : `${producto.stock} disponibles`}
          </p>

          {!agotado && (
            <div className="zz-detalle__actions">
              <div className="zz-detalle__qty">
                <button onClick={() => setCantidad((q) => Math.max(1, q - 1))}>−</button>
                <span>{cantidad}</span>
                <button onClick={() => setCantidad((q) => Math.min(producto.stock, q + 1))}>+</button>
              </div>

              <button className={`btn ${agregado ? "zz-bazar__addbtn--ok" : ""}`} onClick={handleAgregar}>
                {agregado ? "✓ ¡Agregado!" : "Agregar al carrito"}
              </button>
            </div>
          )}

          <Link to="/bazar" className="btn btn-ghost zz-detalle__back">
            ← Volver al Bazar
          </Link>
        </div>
      </div>
    </section>
  );
}