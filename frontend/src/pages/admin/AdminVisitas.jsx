import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../lib/AuthContext";
import "./admin.css";

const POR_PAGINA = 20;

export default function AdminVisitas() {
  const { logout } = useAuth();
  const [visitas, setVisitas] = useState([]);
  const [estado, setEstado] = useState("cargando");
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    supabase
      .from("site_visits")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500)
      .then(({ data, error }) => {
        if (error) {
          setEstado("error");
          return;
        }
        setVisitas(data);
        setEstado("listo");
      });
  }, []);

  const resumen = useMemo(() => {
    const hoy = new Date().toDateString();
    const visitasHoy = visitas.filter((v) => new Date(v.created_at).toDateString() === hoy).length;
    const paises = new Set(visitas.map((v) => v.country).filter(Boolean));
    const conCuenta = visitas.filter((v) => v.user_id).length;
    return { total: visitas.length, hoy: visitasHoy, paises: paises.size, conCuenta };
  }, [visitas]);

  const totalPaginas = Math.max(1, Math.ceil(visitas.length / POR_PAGINA));
  const visitasPagina = visitas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  return (
    <section className="section container">
      <div className="zz-admin__header">
        <div>
          <p className="eyebrow">Panel de administración</p>
          <h1>Visitas recientes</h1>
        </div>
        <div className="zz-admin__header-acciones">
          <Link to="/admin/pedidos" className="btn btn-ghost">Pedidos</Link>
          <Link to="/admin/productos" className="btn btn-ghost">Productos</Link>
          <button className="btn btn-ghost" onClick={logout}>Cerrar sesión</button>
        </div>
      </div>

      {estado === "cargando" && <p className="zz-bazar__status">Cargando visitas…</p>}
      {estado === "error" && <p className="zz-bazar__status">No se pudieron cargar las visitas.</p>}

      {estado === "listo" && (
        <>
          <div className="zz-admin__stats">
            <div className="zz-admin__stat">
              <span>Visitas hoy</span>
              <strong>{resumen.hoy}</strong>
            </div>
            <div className="zz-admin__stat">
              <span>Últimas 500 registradas</span>
              <strong>{resumen.total}</strong>
            </div>
            <div className="zz-admin__stat">
              <span>Países distintos</span>
              <strong>{resumen.paises}</strong>
            </div>
            <div className="zz-admin__stat">
              <span>Con cuenta iniciada</span>
              <strong>{resumen.conCuenta}</strong>
            </div>
          </div>

          {visitas.length === 0 ? (
            <p className="zz-bazar__status">Aún no hay visitas registradas.</p>
          ) : (
            <>
              <div className="zz-admin__tabla-wrap">
                <table className="zz-admin__tabla-productos">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Página</th>
                      <th>Ubicación</th>
                      <th>Dispositivo</th>
                      <th>Navegador</th>
                      <th>Cuenta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitasPagina.map((v) => (
                      <tr key={v.id}>
                        <td className="zz-admin__tabla-dim">
                          {new Date(v.created_at).toLocaleString("es-PE", {
                            day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                          })}
                        </td>
                        <td>{v.page || "—"}</td>
                        <td className="zz-admin__tabla-dim">
                          {v.city || v.country ? `${v.city ? v.city + ", " : ""}${v.country || ""}` : "—"}
                        </td>
                        <td className="zz-admin__tabla-dim">{v.device || "—"} · {v.os || "—"}</td>
                        <td className="zz-admin__tabla-dim">{v.browser || "—"}</td>
                        <td>{v.user_id ? <span className="zz-admin__badge zz-admin__badge--activo">Sí</span> : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPaginas > 1 && (
                <div className="zz-admin__paginacion">
                  <button className="btn btn-ghost" onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={pagina === 1}>
                    ← Anterior
                  </button>
                  <span>Página {pagina} de {totalPaginas}</span>
                  <button className="btn btn-ghost" onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas}>
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}