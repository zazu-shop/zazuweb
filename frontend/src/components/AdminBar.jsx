import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import "./adminBar.css";

const SECCIONES = [
  { to: "/admin/pedidos", label: "Pedidos" },
  { to: "/admin/productos", label: "Productos" },
  { to: "/admin/cupones", label: "Cupones" },
  { to: "/admin/visitas", label: "Visitas" },
  { to: "/admin/festines", label: "Festines" },
  { to: "/bitacora/editar", label: "Bitácora" }, // Nota: esta ruta no empieza con /admin
  { to: "/admin/editores", label: "Editores" },
];

export default function AdminBar() {
  const { pathname } = useLocation();
  const { esAdmin, logout } = useAuth();

  // Ampliamos la condición para que incluya las rutas de bitácora
  const enAreaPrivada = (pathname.startsWith("/admin") || pathname.startsWith("/bitacora")) 
                        && !pathname.startsWith("/admin/login");

  // Si no es admin, o no está en el área privada, no renderiza nada
  if (!esAdmin || !enAreaPrivada) return null;

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
          Salir
        </button>
      </div>
    </nav>
  );
}