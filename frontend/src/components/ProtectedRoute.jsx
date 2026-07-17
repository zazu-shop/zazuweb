import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

export default function ProtectedRoute({ children }) {
  const { session, cargando } = useAuth();

  if (cargando) {
    return (
      <section className="section container">
        <p className="zz-bazar__status">Verificando acceso…</p>
      </section>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}