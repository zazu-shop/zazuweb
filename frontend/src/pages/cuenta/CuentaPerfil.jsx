import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../lib/AuthContext";
import { obtenerMiCodigoReferido, contarSellos, reclamarRecompensaTarjeta } from "../../lib/loyaltyService";
import OrderTimeline from "../../components/OrderTimeline";
import StampCard from "../../components/StampCard";
import "./cuenta.css";

const ESTADOS_LABEL = {
  pendiente_verificacion: "Pendiente de verificación",
  pagado: "Pagado",
  completado: "Entregado",
  cancelado: "Cancelado",
};

const PEDIDOS_POR_PAGINA = 5;

export default function CuentaPerfil() {
  const { session, cargando: cargandoAuth, logout } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [estado, setEstado] = useState("cargando");
  const [codigoReferido, setCodigoReferido] = useState(null);
  const [totalSellos, setTotalSellos] = useState(0);
  const [copiado, setCopiado] = useState(false);
  const [cupones, setCupones] = useState([]);
  const [pagina, setPagina] = useState(1);

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

    obtenerMiCodigoReferido().then(setCodigoReferido).catch(() => {});
    contarSellos(session.user.id).then(setTotalSellos).catch(() => {});
  }, [session]);

  // Cuando hay tarjetas completadas, reclama (o recupera) el cupón de cada
  // una — es idempotente, no genera duplicados si ya se reclamó antes.
  useEffect(() => {
    const tarjetasCompletas = Math.floor(totalSellos / 10);
    if (tarjetasCompletas === 0) return;

    let activo = true;
    Promise.all(
      Array.from({ length: tarjetasCompletas }, (_, i) => reclamarRecompensaTarjeta(i + 1))
    )
      .then((codigos) => {
        if (activo) setCupones(codigos);
      })
      .catch(() => {});

    return () => {
      activo = false;
    };
  }, [totalSellos]);

  if (cargandoAuth) return null;
  if (!session) return <Navigate to="/cuenta/login" replace />;

  const enlaceReferido = codigoReferido
    ? `${window.location.origin}/bazar?ref=${codigoReferido}`
    : "";

  const copiarEnlace = () => {
    navigator.clipboard.writeText(enlaceReferido).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  const totalPaginas = Math.max(1, Math.ceil(pedidos.length / PEDIDOS_POR_PAGINA));
  const pedidosPagina = pedidos.slice(
    (pagina - 1) * PEDIDOS_POR_PAGINA,
    pagina * PEDIDOS_POR_PAGINA
  );

  return (
    <section className="section container zz-cuenta">
      <div className="zz-cuenta__header">
        <div>
          <p className="eyebrow">Mi cuenta</p>
          <h1>{session.user.email}</h1>
        </div>
        <button className="btn btn-ghost" onClick={logout}>Cerrar sesión</button>
      </div>

      <div className="zz-cuenta__grid-superior">
        <StampCard total={totalSellos} />

        <div className="zz-cuenta__referidos">
          <p className="eyebrow">Invita y gana</p>
          <h2>Tu código de referido</h2>
          <p className="lead" style={{ marginBottom: "1rem" }}>
            Compártelo — cuando un amigo lo use en su compra, él obtiene 10% de descuento y tú
            ganas un sello extra en tu tarjeta.
          </p>

          {codigoReferido ? (
            <div className="zz-cuenta__codigo-fila">
              <span className="zz-cuenta__codigo">{codigoReferido}</span>
              <button className="btn btn-ghost" onClick={copiarEnlace}>
                {copiado ? "¡Copiado!" : "Copiar enlace"}
              </button>
            </div>
          ) : (
            <p className="zz-bazar__status">Generando tu código…</p>
          )}
        </div>
      </div>

      {cupones.length > 0 && (
        <div className="zz-cuenta__cupones">
          <p className="eyebrow">🎉 Cupones desbloqueados por tarjetas completadas</p>
          <div className="zz-cuenta__cupones-lista">
            {cupones.map((code, i) => (
              <div className="zz-cuenta__cupon" key={code}>
                <span className="zz-cuenta__cupon-codigo">{code}</span>
                <span className="zz-cuenta__cupon-desc">15% de descuento — tarjeta {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 style={{ marginTop: "2.5rem", marginBottom: "1rem" }}>Mis pedidos</h2>

      {estado === "cargando" && <p className="zz-bazar__status">Cargando tus pedidos…</p>}
      {estado === "error" && <p className="zz-bazar__status">No se pudieron cargar tus pedidos.</p>}

      {estado === "listo" && pedidos.length === 0 && (
        <p className="zz-bazar__status">
          Aún no tienes pedidos con esta cuenta. Si compraste antes de crearla, puedes
          consultarlo igual desde <a href="/seguimiento">Seguimiento de pedido</a>.
        </p>
      )}

      {estado === "listo" && pedidos.length > 0 && (
        <>
          <div className="zz-cuenta__pedidos">
            {pedidosPagina.map((pedido) => (
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
    </section>
  );
}