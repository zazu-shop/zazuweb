import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import MiniCarrito from "./MiniCarrito";
import { useWishlist } from "../lib/WishlistContext";
import "./navbar.css";

const LINKS = [
  { to: "/", label: "Inicio" },
  { to: "/grimorio", label: "El Grimorio" },
  { to: "/bazar", label: "Bazar" },
  { to: "/seguimiento", label: "Mi pedido" },
  { to: "/cuenta", label: "Mi cuenta" },
  { to: "/contacto", label: "Contacto" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [conScroll, setConScroll] = useState(false);
  const { ids } = useWishlist();

  useEffect(() => {
    const handleScroll = () => setConScroll(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`zz-nav ${conScroll ? "zz-nav--scrolled" : ""}`}>
      <div className="container zz-nav__inner">
        <NavLink to="/" className="zz-nav__brand" onClick={() => setOpen(false)}>
          <img src="/logo/icon-white.png" alt="" className="zz-nav__mark" />
          <span>ZAZU</span>
        </NavLink>

        <button
          className="zz-nav__toggle"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Abrir menú"
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`zz-nav__links ${open ? "zz-nav__links--open" : ""}`}>
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => (isActive ? "is-active" : "")}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
          <NavLink
            to="/favoritos"
            className={({ isActive }) => `zz-nav__cart ${isActive ? "is-active" : ""}`}
            onClick={() => setOpen(false)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 20.5s-7.5-4.6-10-9.2C.4 8.1 2 4.5 5.6 4c2-.3 3.8.6 4.9 2.2l1.5 2 1.5-2C14.6 4.6 16.4 3.7 18.4 4c3.6.5 5.2 4.1 3.6 7.3-2.5 4.6-10 9.2-10 9.2Z"
                stroke="currentColor"
                strokeWidth="1.6"
              />
            </svg>
            <span className="zz-nav__cart-label">Favoritos</span>
            {ids.length > 0 && <span className="zz-nav__cart-count">{ids.length}</span>}
          </NavLink>
          <MiniCarrito />
        </nav>
      </div>
    </header>
  );
}