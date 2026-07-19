import { useState, useRef, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { useWishlist } from "../lib/WishlistContext";
import "./navDropdown.css";

const OPCIONES = [
  { to: "/seguimiento", label: "Mi pedido" },
  { to: "/cuenta", label: "Mi cuenta" },
  { to: "/favoritos", label: "Favoritos" },
];

export default function NavDropdown({ onNavegar }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);
  const { ids } = useWishlist();

  useEffect(() => {
    const handleClickFuera = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  return (
    <div className="zz-navdrop" ref={ref}>
      <button className="zz-navdrop__toggle" onClick={() => setAbierto((v) => !v)} aria-expanded={abierto}>
        Cuenta
        {ids.length > 0 && <span className="zz-nav__cart-count">{ids.length}</span>}
        <span className="zz-navdrop__flecha">{abierto ? "▲" : "▼"}</span>
      </button>

      {abierto && (
        <div className="zz-navdrop__panel">
          {OPCIONES.map((op) => (
            <NavLink
              key={op.to}
              to={op.to}
              className={({ isActive }) => `zz-navdrop__item ${isActive ? "is-active" : ""}`}
              onClick={() => {
                setAbierto(false);
                onNavegar?.();
              }}
            >
              {op.label}
              {op.to === "/favoritos" && ids.length > 0 && (
                <span className="zz-nav__cart-count">{ids.length}</span>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}