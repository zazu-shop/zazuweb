import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useCart } from "../lib/CartContext";
import { SkeletonDetalle } from "../components/Skeleton";
import HeartButton from "../components/HeartButton";
import Modal from "../components/Modal";
import "./productoDetalle.css";
import "./baul.css";

export default function ProductoDetalle() {
  const { id } = useParams();
  const { addItem } = useCart();

  const [producto, setProducto] = useState(null);
  const [estado, setEstado] = useState("cargando"); // cargando | listo | error
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const [imagenActiva, setImagenActiva] = useState(0);
  const [lightboxAbierto, setLightboxAbierto] = useState(false);

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
      <section className="section">
        <SkeletonDetalle />
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

  const agotado = producto.stock === 0 || producto.active === false;

  const imagenes = useMemo(() => {
    const lista = [];
    if (producto.image_url) lista.push(producto.image_url);
    if (producto.gallery_urls) {
      producto.gallery_urls
        .split("\n")
        .map((u) => u.trim())
        .filter(Boolean)
        .forEach((u) => lista.push(u));
    }
    return lista;
  }, [producto]);

  return (
    <section className="section">
      <div className="container zz-detalle">
        <div className="zz-detalle__media">
          {imagenes.length > 0 ? (
            <button
              className="zz-detalle__media-boton"
              onClick={() => setLightboxAbierto(true)}
              aria-label="Ver imagen en tamaño completo"
            >
              <img src={imagenes[imagenActiva]} alt={producto.name} />
              <span className="zz-detalle__zoom-hint">🔍 Ver en tamaño completo</span>
            </button>
          ) : (
            <div className="zz-detalle__media--placeholder" />
          )}
          <HeartButton productId={producto.id} className="zz-detalle__corazon" />

          {imagenes.length > 1 && (
            <div className="zz-detalle__miniaturas">
              {imagenes.map((url, i) => (
                <button
                  key={url + i}
                  className={`zz-detalle__miniatura ${i === imagenActiva ? "zz-detalle__miniatura--activa" : ""}`}
                  onClick={() => setImagenActiva(i)}
                >
                  <img src={url} alt={`${producto.name} — vista ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="zz-detalle__info">
          <p className="eyebrow">{producto.category || "General"}</p>
          <h1>{producto.name}</h1>
          {producto.compare_at_price > producto.price && (
            <p className="zz-detalle__price-old">S/ {producto.compare_at_price}</p>
          )}
          <p className="zz-detalle__price">S/ {producto.price}</p>

          <p className="lead" style={{ margin: "var(--space-sm) 0" }}>{producto.description}</p>

          {producto.is_baul && producto.baul_note && (
            <p className="zz-baul zz-baul__nota" style={{ maxWidth: "none" }}>
              <strong>Pieza del Baúl — Detalle:</strong> {producto.baul_note}
            </p>
          )}

          {producto.lore && (
            <blockquote className="zz-detalle__lore">
              <p>{producto.lore}</p>
            </blockquote>
          )}

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
            {producto.active === false
              ? "Esta pieza ya no está disponible"
              : agotado
              ? "Sin stock por ahora"
              : `${producto.stock} disponibles`}
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

      {lightboxAbierto && (
        <Modal onClose={() => setLightboxAbierto(false)}>
          <div className="zz-lightbox">
            <img src={imagenes[imagenActiva]} alt={producto.name} className="zz-lightbox__imagen" />
            {imagenes.length > 1 && (
              <div className="zz-lightbox__nav">
                <button
                  onClick={() => setImagenActiva((i) => (i - 1 + imagenes.length) % imagenes.length)}
                  aria-label="Imagen anterior"
                >
                  ←
                </button>
                <span>{imagenActiva + 1} / {imagenes.length}</span>
                <button
                  onClick={() => setImagenActiva((i) => (i + 1) % imagenes.length)}
                  aria-label="Imagen siguiente"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </section>
  );
}