import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import Modal from "../../components/Modal";
import "./admin.css";

const ESTADOS = [
  { value: "pendiente_verificacion", label: "Pendiente de verificación" },
  { value: "pagado", label: "Pagado" },
  { value: "cancelado", label: "Cancelado" },
];

const ETIQUETAS_ENVIO = {
  delivery: "Delivery a domicilio",
  recojo_tienda: "Recojo en tienda",
  otros: "Por coordinar",
};

const ESTADO_MENSAJE = {
  pendiente_verificacion: "seguimos verificando tu pago",
  pagado: "confirmamos tu pago, ¡ya estamos preparando tu pedido!",
  cancelado: "tu pedido fue cancelado",
};

export default function AdminPedidoDetalle() {
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);
  const [estadoCarga, setEstadoCarga] = useState("cargando");
  const [productoModal, setProductoModal] = useState(null);
  const [cargandoProducto, setCargandoProducto] = useState(false);

  const cargar = () => {
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setEstadoCarga("error");
          return;
        }
        setPedido(data);
        setEstadoCarga("listo");
      });
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const cambiarEstado = async (nuevoEstado) => {
    const estadoAnterior = pedido.status;
    const { error } = await supabase.from("orders").update({ status: nuevoEstado }).eq("id", id);
    if (error) return;

    setPedido({ ...pedido, status: nuevoEstado });

    // Solo restauramos stock la primera vez que se cancela (evita sumarlo
    // dos veces si alguien cambia el estado varias veces por error).
    if (nuevoEstado === "cancelado" && estadoAnterior !== "cancelado") {
      const { error: errorStock } = await supabase.rpc("restaurar_stock_pedido", {
        p_order_id: id,
      });
      if (errorStock) {
        console.error("[Zazu] No se pudo restaurar el stock:", errorStock.message);
      }
    }
  };

  const verProducto = async (productId) => {
    if (!productId) return;
    setCargandoProducto(true);
    const { data } = await supabase.from("products").select("*").eq("id", productId).single();
    setProductoModal(data || null);
    setCargandoProducto(false);
  };

  if (estadoCarga === "cargando") {
    return (
      <section className="section container">
        <p className="zz-bazar__status">Cargando pedido…</p>
      </section>
    );
  }

  if (estadoCarga === "error" || !pedido) {
    return (
      <section className="section container">
        <p className="zz-bazar__status">No se encontró ese pedido.</p>
        <Link to="/admin/pedidos" className="btn btn-ghost">← Volver a pedidos</Link>
      </section>
    );
  }

  const necesitaCoordinarEnvio = pedido.shipping_method === "otros";

  const mensaje = encodeURIComponent(
    `Hola ${pedido.customer_name}, te escribimos de Zazu Shop sobre tu pedido ${pedido.order_number}: ${ESTADO_MENSAJE[pedido.status]}.` +
      (necesitaCoordinarEnvio
        ? " Nos falta coordinar contigo la forma de entrega, ¿nos confirmas dirección y horario?"
        : "")
  );

  return (
    <section className="section container">
      <Link to="/admin/pedidos" className="zz-panel__back" style={{ textAlign: "left", marginBottom: "1rem" }}>
        ← Volver a pedidos
      </Link>

      <div className="zz-admin__header">
        <div>
          <p className="eyebrow">Pedido</p>
          <h1>{pedido.order_number}</h1>
        </div>
        <span className={`zz-admin__badge zz-admin__badge--${pedido.status}`}>
          {ESTADOS.find((e) => e.value === pedido.status)?.label}
        </span>
      </div>

      <div className="zz-admin__detalle-grid">
        <div className="zz-panel">
          <h2>Cliente</h2>
          <p><strong>Nombre:</strong> {pedido.customer_name}</p>
          <p><strong>Correo:</strong> {pedido.customer_email}</p>
          <p><strong>Celular:</strong> {pedido.customer_phone || "—"}</p>

          <h2 style={{ marginTop: "1.5rem" }}>Envío</h2>
          <p><strong>Método:</strong> {ETIQUETAS_ENVIO[pedido.shipping_method] || pedido.shipping_method}</p>
          {pedido.shipping_method === "delivery" && (
            <>
              <p><strong>DNI:</strong> {pedido.shipping_dni || "—"}</p>
              <p><strong>Dirección:</strong> {pedido.shipping_address || "—"}</p>
              <p><strong>Referencia:</strong> {pedido.shipping_reference || "—"}</p>
              <p><strong>Horario deseado:</strong> {pedido.shipping_time_range || "—"}</p>
            </>
          )}

          <a
            className="btn zz-admin__whatsapp"
            href={`https://wa.me/${(pedido.customer_phone || "").replace(/\D/g, "")}?text=${mensaje}`}
            target="_blank"
            rel="noreferrer"
          >
            Escribir por WhatsApp
          </a>
        </div>

        <div className="zz-panel">
          <h2>Items</h2>
          <table className="zz-admin__tabla">
            <thead>
              <tr><th>Producto</th><th>Cant.</th><th>Subtotal</th></tr>
            </thead>
            <tbody>
              {pedido.order_items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <button className="zz-admin__item-link" onClick={() => verProducto(item.product_id)}>
                      {item.name}
                    </button>
                  </td>
                  <td>{item.qty}</td>
                  <td>S/ {(item.price * item.qty).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {pedido.shipping_cost > 0 && (
            <p className="zz-admin__envio-costo">Envío: S/ {Number(pedido.shipping_cost).toFixed(2)}</p>
          )}
          <p className="zz-admin__envio-costo zz-admin__total-final">
            Total: S/ {Number(pedido.total).toFixed(2)}
          </p>

          <label className="zz-admin__estado-selector">
            Cambiar estado
            <select value={pedido.status} onChange={(e) => cambiarEstado(e.target.value)}>
              {ESTADOS.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {(cargandoProducto || productoModal !== null) && (
        <Modal onClose={() => setProductoModal(null)}>
          {cargandoProducto ? (
            <p className="zz-bazar__status">Cargando producto…</p>
          ) : productoModal ? (
            <>
              {productoModal.image_url ? (
                <img src={productoModal.image_url} alt={productoModal.name} className="zz-admin__modal-imagen" />
              ) : (
                <div className="zz-admin__modal-imagen zz-admin__producto-placeholder" />
              )}
              <p className="eyebrow">{productoModal.category || "General"}</p>
              <h2>{productoModal.name}</h2>
              <p className="zz-admin__modal-precio">S/ {productoModal.price}</p>
              <p>{productoModal.description}</p>
              <p className="zz-admin__envio-costo">Stock actual: {productoModal.stock}</p>
            </>
          ) : (
            <p className="zz-bazar__status">Este producto ya no existe en el catálogo.</p>
          )}
        </Modal>
      )}
    </section>
  );
}