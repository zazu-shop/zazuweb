import { Link } from "react-router-dom";
import Modal from "./Modal";
import HeartButton from "./HeartButton";
import "./quickView.css";

export default function QuickView({ producto, onClose, onAgregar }) {
  if (!producto) return null;

  const agotado = producto.stock === 0 || producto.active === false;

  return (
    <Modal onClose={onClose}>
      <div className="zz-quickview">
        <div className="zz-quickview__media">
          {producto.image_url ? (
            <img src={producto.image_url} alt={producto.name} />
          ) : (
            <div className="zz-quickview__media--placeholder" />
          )}
          <HeartButton productId={producto.id} className="zz-quickview__corazon" />
        </div>

        <div className="zz-quickview__info">
          <p className="eyebrow">{producto.category || "General"}</p>
          <h2>{producto.name}</h2>

          <div className="zz-quickview__precios">
            {producto.compare_at_price > producto.price && (
              <span className="zz-detalle__price-old">S/ {producto.compare_at_price}</span>
            )}
            <p className="zz-detalle__price">S/ {producto.price}</p>
          </div>

          <p className="zz-quickview__descripcion">{producto.description}</p>

          <p className="zz-quickview__stock">
            {producto.active === false
              ? "Ya no está disponible"
              : producto.stock === 0
              ? "Sin stock por ahora"
              : `${producto.stock} disponibles`}
          </p>

          <div className="zz-quickview__acciones">
            <button className="btn" onClick={() => onAgregar(producto)} disabled={agotado}>
              {agotado ? "No disponible" : "Agregar al carrito"}
            </button>
            <Link to={`/bazar/${producto.id}`} className="btn btn-ghost" onClick={onClose}>
              Ver detalle completo
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}