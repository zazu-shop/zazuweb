import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../lib/AuthContext";
import "./admin.css";
import "./adminFestines.css";

const ESTADOS = [
  { value: "pendiente_verificacion", label: "Pendiente de verificación" },
  { value: "pagado", label: "Pagado" },
  { value: "completado", label: "Entregado" },
  { value: "cancelado", label: "Cancelado" },
];

function telefonoWhatsapp(telefono) {
  let digitos = (telefono || "").replace(/\D/g, "");
  if (digitos.length === 9) digitos = "51" + digitos; // celular peruano sin código de país
  return digitos;
}

function fechaCorta(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" });
}

export default function AdminFestinPedidos() {
  const { id } = useParams();
  const { logout } = useAuth();
  const [festin, setFestin] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [estado, setEstado] = useState("cargando");
  const [busqueda, setBusqueda] = useState("");
  const hoyLima = new Date().toLocaleDateString("en-CA", { timeZone: "America/Lima" });

  const cargar = async () => {
    const { data: f } = await supabase.from("feasts").select("*").eq("id", id).maybeSingle();
    setFestin(f);

    const { data, error } = await supabase
      .from("feast_orders")
      .select("*, feast_order_items(*)")
      .eq("feast_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      setEstado("error");
      return;
    }
    setPedidos(data);
    setEstado("listo");
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const resumen = useMemo(() => {
    const vigentes = pedidos.filter((p) => p.status !== "cancelado");
    const suma = (lista) => lista.reduce((s, p) => s + Number(p.total), 0);
    const porPieza = {};
    vigentes.forEach((p) =>
      p.feast_order_items.forEach((it) => {
        porPieza[it.name] = (porPieza[it.name] || 0) + it.qty;
      })
    );
    return {
      cantidad: vigentes.length,
      cobrado: suma(pedidos.filter((p) => p.status === "pagado" || p.status === "completado")),
      pendiente: suma(pedidos.filter((p) => p.status === "pendiente_verificacion")),
      vencidos: pedidos.filter(
        (p) =>
          p.pay_later &&
          p.status === "pendiente_verificacion" &&
          p.commitment_date &&
          p.commitment_date < hoyLima
      ).length,
      porPieza,
    };
  }, [pedidos, hoyLima]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return pedidos;
    return pedidos.filter(
      (p) =>
        p.order_number.toLowerCase().includes(q) ||
        p.customer_name.toLowerCase().includes(q) ||
        p.customer_phone.includes(q)
    );
  }, [pedidos, busqueda]);

  const cambiarEstado = async (pedido, nuevo) => {
    if (nuevo === pedido.status) return;
    if (
      nuevo === "cancelado" &&
      !confirm("Al cancelar, las piezas vuelven al stock y no se puede deshacer. ¿Continuar?")
    )
      return;

    const { error } = await supabase.rpc("cambiar_estado_pedido_festin", {
      p_order_id: pedido.id,
      p_status: nuevo,
    });
    if (error) {
      alert(error.message);
      return;
    }
    setPedidos((prev) => prev.map((p) => (p.id === pedido.id ? { ...p, status: nuevo } : p)));
  };

  return (
    <section className="section container">
      <div className="zz-admin__header">
        <div>
          <p className="eyebrow">Pedidos del festín</p>
          <h1>{festin ? festin.title : "Festín"}</h1>
        </div>
        <div className="zz-admin__header-acciones">
          <Link to="/admin/festines" className="btn btn-ghost">← Festines</Link>
          <button className="btn btn-ghost" onClick={logout}>Cerrar sesión</button>
        </div>
      </div>

      {estado === "cargando" && <p className="zz-bazar__status">Cargando pedidos…</p>}
      {estado === "error" && <p className="zz-bazar__status">No se pudieron cargar los pedidos.</p>}

      {estado === "listo" && (
        <>
          <div className="zz-admin__stats">
            <div className="zz-admin__stat">
              <span>Pedidos vigentes</span>
              <strong>{resumen.cantidad}</strong>
            </div>
            <div className="zz-admin__stat zz-admin__stat--pagado">
              <span>Cobrado</span>
              <strong>S/ {resumen.cobrado.toFixed(2)}</strong>
            </div>
            <div className="zz-admin__stat zz-admin__stat--pendiente">
              <span>Por verificar</span>
              <strong>S/ {resumen.pendiente.toFixed(2)}</strong>
            </div>
            <div className="zz-admin__stat zz-admin__stat--cancelado">
              <span>Compromisos vencidos</span>
              <strong>{resumen.vencidos}</strong>
            </div>
          </div>

          {Object.keys(resumen.porPieza).length > 0 && (
            <div className="zz-admin__resumen-piezas">
              {Object.entries(resumen.porPieza).map(([nombre, cantidad]) => (
                <span className="zz-admin__pieza-chip" key={nombre}>
                  {cantidad} × {nombre}
                </span>
              ))}
            </div>
          )}

          <div className="zz-admin__filtros">
            <input
              type="text"
              placeholder="Buscar por número, nombre o celular…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {filtrados.length === 0 ? (
            <p className="zz-bazar__status">
              {pedidos.length === 0 ? "Aún no hay pedidos." : "Ningún pedido coincide con la búsqueda."}
            </p>
          ) : (
            <div className="zz-admin__tabla-wrap">
              <table className="zz-admin__tabla-productos">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th>Piezas</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((p) => (
                    <tr key={p.id} className={p.status === "cancelado" ? "zz-admin__fila--inactiva" : ""}>
                      <td>
                        <span className="zz-admin__tabla-codigo">{p.order_number}</span>
                        {p.pay_later && p.status === "pendiente_verificacion" && p.commitment_date && (
                          <div
                            className={`zz-admin__compromiso ${
                              p.commitment_date < hoyLima ? "zz-admin__compromiso--vencido" : ""
                            }`}
                          >
                            Paga el {fechaCorta(p.commitment_date)}
                            {p.commitment_date < hoyLima ? " · VENCIDO" : ""}
                          </div>
                        )}
                      </td>
                      <td>
                        {p.customer_name}
                        <div className="zz-admin__tabla-dim" style={{ fontSize: "0.72rem" }}>{p.customer_phone}</div>
                      </td>
                      <td className="zz-admin__tabla-dim">
                        {p.feast_order_items.map((it) => `${it.qty} × ${it.name}`).join(", ")}
                      </td>
                      <td>S/ {Number(p.total).toFixed(2)}</td>
                      <td>
                        <select
                          className="zz-admin__select-mini"
                          value={p.status}
                          disabled={p.status === "cancelado"}
                          onChange={(e) => cambiarEstado(p, e.target.value)}
                        >
                          {ESTADOS.map((e) => (
                            <option key={e.value} value={e.value}>{e.label}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <a
                          className="btn btn-ghost"
                          style={{ padding: "0.4rem 0.7rem", fontSize: "0.7rem" }}
                          href={`https://wa.me/${telefonoWhatsapp(p.customer_phone)}?text=${encodeURIComponent(
                            `Hola ${p.customer_name}, te escribimos por tu pedido ${p.order_number} de «${festin?.title || "el festín"}».` +
                              (p.pay_later && p.status === "pendiente_verificacion" && p.commitment_date
                                ? ` Te recordamos tu compromiso de pago para el ${fechaCorta(p.commitment_date)}.`
                                : "")
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          WhatsApp
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}