import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import "./adminBar.css";

const SECCIONES = [
  { to: "/admin/pedidos", label: "Pedidos" },
  { to: "/admin/productos", label: "Productos" },
  { to: "/admin/cupones", label: "Cupones" },
  { to: "/admin/visitas", label: "Visitas" },
  { to: "/admin/festines", label: "Festines" },
  { to: "/bitacora/editar", label: "Bitácora" },
  { to: "/admin/editores", label: "Editores" },
];

// Barra de navegación del panel de administración. Aparece sola en todas las
// páginas /admin (menos el login) cuando la sesión es de admin.
export default function AdminBar() {
  const { pathname } = useLocation();
  const { esAdmin, logout } = useAuth();

  const enAdmin = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
  if (!esAdmin || !enAdmin) return null;

  return (
    <nav className="zz-adminbar" aria-label="Administración">
      <div className="container zz-adminbar__inner">
        {SECCIONES.map((s) => (
          <NavLink
            key={s.to}
            to={s.to}
            className={({ isActive }) =>
              `btn btn-ghost zz-adminbar__link ${isActive ? "zz-adminbar__link--activo" : ""}`
            }
          >
            {s.label}
          </NavLink>
        ))}
        <button className="btn btn-ghost zz-adminbar__salir" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}