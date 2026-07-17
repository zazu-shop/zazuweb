import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../lib/CartContext";
import "./miniCarrito.css";

export default function MiniCarrito() {
  const { items, totalItems, totalPrice } = useCart();
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickFuera = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  return (
    <div className="zz-minicart" ref={ref}>
      <button
        className="zz-nav__cart"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 8h12l-1 12H7L6 8Z" stroke="currentColor" strokeWidth="1.6" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        <span className="zz-nav__cart-label">Carrito</span>
        {totalItems > 0 && <span className="zz-nav__cart-count">{totalItems}</span>}
      </button>

      {abierto && (
        <div className="zz-minicart__panel">
          {items.length === 0 ? (
            <p className="zz-minicart__vacio">Tu carrito está vacío.</p>
          ) : (
            <>
              <div className="zz-minicart__lista">
                {items.map((item) => (
                  <div className="zz-minicart__item" key={item.id}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} />
                    ) : (
                      <div className="zz-minicart__item-placeholder" />
                    )}
                    <div>
                      <p className="zz-minicart__item-name">{item.name}</p>
                      <p className="zz-minicart__item-qty">× {item.qty} — S/ {(item.price * item.qty).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="zz-minicart__total">
                <span>Total</span>
                <span>S/ {totalPrice.toFixed(2)}</span>
              </div>
              <Link to="/carrito" className="btn zz-minicart__ver" onClick={() => setAbierto(false)}>
                Ver carrito
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}