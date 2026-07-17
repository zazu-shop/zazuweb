import { useState } from "react";
import { NavLink } from "react-router-dom";
import MiniCarrito from "./MiniCarrito";
import "./navbar.css";

const LINKS = [
  { to: "/", label: "Inicio" },
  { to: "/grimorio", label: "El Grimorio" },
  { to: "/bazar", label: "Bazar" },
  { to: "/contacto", label: "Contacto" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="zz-nav">
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
          <MiniCarrito />
        </nav>
      </div>
    </header>
  );
}