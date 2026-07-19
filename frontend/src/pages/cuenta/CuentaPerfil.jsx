import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../lib/AuthContext";
import OrderTimeline from "../../components/OrderTimeline";
import "./cuenta.css";

const ESTADOS_LABEL = {
  pendiente_verificacion: "Pendiente de verificación",
  pagado: "Pagado",
  completado: "Entregado",
  cancelado: "Cancelado",
};

export default function CuentaPerfil() {
  const { session, cargando: cargandoAuth, logout } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [estado, setEstado] = useState("cargando");

  useEffect(() => {
    if (!session) return;
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setEstado("error");
          return;
        }
        setPedidos(data);
        setEstado("listo");
      });
  }, [session]);

  if (cargandoAuth) return null;
  if (!session) return <Navigate to="/cuenta/login" replace />;

  return (
    <section className="section container zz-cuenta">
      <div className="zz-cuenta__header">
        <div>
          <p className="eyebrow">Mi cuenta</p>
          <h1>{session.user.email}</h1>
        </div>
        <button className="btn btn-ghost" onClick={logout}>Cerrar sesión</button>
      </div>

      <h2 style={{ marginTop: "2rem", marginBottom: "1rem" }}>Mis pedidos</h2>

      {estado === "cargando" && <p className="zz-bazar__status">Cargando tus pedidos…</p>}
      {estado === "error" && <p className="zz-bazar__status">No se pudieron cargar tus pedidos.</p>}

      {estado === "listo" && pedidos.length === 0 && (
        <p className="zz-bazar__status">
          Aún no tienes pedidos con esta cuenta. Si compraste antes de crearla, puedes
          consultarlo igual desde <a href="/seguimiento">Seguimiento de pedido</a>.
        </p>
      )}

      {estado === "listo" && pedidos.length > 0 && (
        <div className="zz-cuenta__pedidos">
          {pedidos.map((pedido) => (
            <div className="zz-panel zz-cuenta__pedido" key={pedido.id}>
              <div className="zz-seguimiento__header">
                <div>
                  <p className="eyebrow">{pedido.order_number}</p>
                  <p className="zz-seguimiento__fecha">
                    {new Date(pedido.created_at).toLocaleDateString("es-PE", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </p>
                </div>
                <span className={`zz-admin__badge zz-admin__badge--${pedido.status}`}>
                  {ESTADOS_LABEL[pedido.status] || pedido.status}
                </span>
              </div>

              <OrderTimeline status={pedido.status} />

              {pedido.order_items.map((item) => (
                <div className="zz-checkout__linea" key={item.id}>
                  <span>{item.name} × {item.qty}</span>
                  <span>S/ {(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
              <div className="zz-checkout__linea zz-checkout__total">
                <span>Total</span>
                <span>S/ {Number(pedido.total).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}