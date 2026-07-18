import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../lib/AuthContext";
import "./admin.css";

const ESTADOS = [
  { value: "pendiente_verificacion", label: "Pendiente de verificación" },
  { value: "pagado", label: "Pagado" },
  { value: "cancelado", label: "Cancelado" },
];

export default function AdminPedidos() {
  const { logout } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [estado, setEstado] = useState("cargando"); // cargando | listo | error

  const [busqueda, setBusqueda] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [pagina, setPagina] = useState(1);
  const TAMANO_PAGINA = 15;

  useEffect(() => {
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("[Zazu] Error al leer pedidos:", error.message);
          setEstado("error");
          return;
        }
        setPedidos(data);
        setEstado("listo");
      });
  }, []);

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((p) => {
      if (busqueda && !p.order_number.toLowerCase().includes(busqueda.toLowerCase())) {
        return false;
      }
      const fecha = new Date(p.created_at);
      if (desde && fecha < new Date(desde)) return false;
      if (hasta && fecha > new Date(hasta + "T23:59:59")) return false;
      return true;
    });
  }, [pedidos, busqueda, desde, hasta]);

  useEffect(() => {
    setPagina(1);
  }, [busqueda, desde, hasta]);

  const totalPaginas = Math.max(1, Math.ceil(pedidosFiltrados.length / TAMANO_PAGINA));
  const pedidosPagina = pedidosFiltrados.slice(
    (pagina - 1) * TAMANO_PAGINA,
    pagina * TAMANO_PAGINA
  );

  const totales = useMemo(() => {
    const pagado = pedidosFiltrados
      .filter((p) => p.status === "pagado")
      .reduce((sum, p) => sum + Number(p.total), 0);
    const cancelado = pedidosFiltrados
      .filter((p) => p.status === "cancelado")
      .reduce((sum, p) => sum + Number(p.total), 0);
    const pendiente = pedidosFiltrados
      .filter((p) => p.status === "pendiente_verificacion")
      .reduce((sum, p) => sum + Number(p.total), 0);
    return { pagado, cancelado, pendiente, cantidad: pedidosFiltrados.length };
  }, [pedidosFiltrados]);

  return (
    <section className="section container">
      <div className="zz-admin__header">
        <div>
          <p className="eyebrow">Panel de administración</p>
          <h1>Pedidos</h1>
        </div>
        <div className="zz-admin__header-acciones">
          <Link to="/admin/productos" className="btn btn-ghost">Gestionar productos</Link>
          <Link to="/admin/cupones" className="btn btn-ghost">Cupones</Link>
          <button className="btn btn-ghost" onClick={logout}>Cerrar sesión</button>
        </div>
      </div>

      {estado === "cargando" && <p className="zz-bazar__status">Cargando pedidos…</p>}
      {estado === "error" && <p className="zz-bazar__status">No se pudieron cargar los pedidos.</p>}

      {estado === "listo" && (
        <>
          <div className="zz-admin__stats">
            <div className="zz-admin__stat">
              <span>Pedidos en el período</span>
              <strong>{totales.cantidad}</strong>
            </div>
            <div className="zz-admin__stat zz-admin__stat--pagado">
              <span>Total cobrado</span>
              <strong>S/ {totales.pagado.toFixed(2)}</strong>
            </div>
            <div className="zz-admin__stat zz-admin__stat--pendiente">
              <span>Total pendiente</span>
              <strong>S/ {totales.pendiente.toFixed(2)}</strong>
            </div>
            <div className="zz-admin__stat zz-admin__stat--cancelado">
              <span>Total cancelado</span>
              <strong>S/ {totales.cancelado.toFixed(2)}</strong>
            </div>
          </div>

          <div className="zz-admin__filtros">
            <input
              type="text"
              placeholder="Buscar por número de pedido…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <label>
              Desde
              <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
            </label>
            <label>
              Hasta
              <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
            </label>
          </div>

          {pedidosFiltrados.length === 0 && (
            <p className="zz-bazar__status">No hay pedidos que coincidan con esos filtros.</p>
          )}

          {pedidosFiltrados.length > 0 && (
            <>
              <div className="zz-admin__lista">
                {pedidosPagina.map((pedido) => (
                  <Link to={`/admin/pedidos/${pedido.id}`} className="zz-admin__pedido-header" key={pedido.id}>
                    <span className="zz-admin__numero">{pedido.order_number}</span>
                    <span>{pedido.customer_name}</span>
                    <span className="zz-admin__fecha">
                      {new Date(pedido.created_at).toLocaleDateString("es-PE")}
                    </span>
                    <span className={`zz-admin__badge zz-admin__badge--${pedido.status}`}>
                      {ESTADOS.find((e) => e.value === pedido.status)?.label || pedido.status}
                    </span>
                    <span className="zz-admin__total">S/ {Number(pedido.total).toFixed(2)}</span>
                  </Link>
                ))}
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