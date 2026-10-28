import { Link, Navigate } from "react-router-dom";
import { useEditor } from "../lib/useEditor";

// Protege las pantallas de edición de la bitácora: solo cuentas con permiso de editor.
export default function EditorRoute({ children }) {
  const { esEditor, cargando, session } = useEditor();

  if (cargando) {
    return (
      <section className="section container">
        <p className="zz-bazar__status">Verificando permisos…</p>
      </section>
    );
  }

  if (!session) return <Navigate to="/cuenta/login" replace />;

  if (!esEditor) {
    return (
      <section className="section container" style={{ textAlign: "center" }}>
        <p className="eyebrow">Bitácora</p>
        <h1>Tu cuenta aún no puede editar</h1>
        <p className="lead" style={{ margin: "1rem 0 2rem" }}>
          Para escribir en la bitácora necesitas que el administrador te dé permiso de editor.
        </p>
        <Link to="/bitacora" className="btn">Volver a la bitácora</Link>
      </section>
    );
  }

  return children;
}