import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { obtenerFestin, crearPedidoFestin, buscarPedidoFestin } from "../lib/festinService";
import { descargarResumenPedido } from "../lib/receiptGenerator";
import OrderTimeline from "../components/OrderTimeline";
import ImageLightbox from "../components/ImageLightbox";
import Sigil from "../components/Sigil";
import "./carrito.css";
import "./festin.css";

const WHATSAPP_NUMERO = import.meta.env.VITE_WHATSAPP_NUMERO || "";

const ESTADOS_LABEL = {
  pendiente_verificacion: "Pendiente de verificación",
  pagado: "Pagado",
  completado: "Entregado",
  cancelado: "Cancelado",
};

export default function Festin() {
  const { slug } = useParams();
  const [datos, setDatos] = useState(null); // { festin, items }
  const [estado, setEstado] = useState("cargando"); // cargando | listo | no-existe | error
  const [cantidades, setCantidades] = useState({});
  const [form, setForm] = useState({ name: "", phone: "" });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [pedido, setPedido] = useState(null);
  const [generandoResumen, setGenerandoResumen] = useState(false);
  const [memeAbierto, setMemeAbierto] = useState(null);

  const [seg, setSeg] = useState({ orderNumber: "", phone: "" });
  const [segEstado, setSegEstado] = useState("idle"); // idle | buscando | encontrado | no-encontrado | error
  const [segPedido, setSegPedido] = useState(null);

  const cargar = async () => {
    try {
      const resultado = await obtenerFestin(slug);
      if (!resultado) {
        setEstado("no-existe");
        return;
      }
      setDatos(resultado);
      setEstado("listo");
    } catch (err) {
      console.error("[Zazu] Error al cargar el festín:", err.message);
      setEstado("error");
    }
  };

  useEffect(() => {
    setEstado("cargando");
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Los hooks van antes de cualquier return para no romper el orden de hooks.
  const festin = datos?.festin;
  const items = datos?.items || [];

  const memes = useMemo(
    () => (festin?.meme_urls || "").split("\n").map((u) => u.trim()).filter(Boolean),
    [festin]
  );

  const lineas = useMemo(
    () =>
      items
        .filter((i) => (cantidades[i.id] || 0) > 0)
        .map((i) => ({ item: i, qty: cantidades[i.id] })),
    [items, cantidades]
  );

  const total = lineas.reduce((suma, l) => suma + Number(l.item.price) * l.qty, 0);

  const cambiarCantidad = (item, delta) => {
    setCantidades((prev) => {
      const actual = prev[item.id] || 0;
      const nueva = Math.max(0, Math.min(item.stock, actual + delta));
      return { ...prev, [item.id]: nueva };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lineas.length === 0) return;
    setEnviando(true);
    setError(null);

    try {
      const r = await crearPedidoFestin({
        feastId: festin.id,
        name: form.name,
        phone: form.phone,
        items: lineas.map((l) => ({ itemId: l.item.id, qty: l.qty })),
      });
      setPedido({
        orderNumber: r.order_number,
        name: form.name,
        phone: form.phone,
        items: r.lines,
        total: Number(r.total),
      });
      setCantidades({});
      cargar(); // refresca el stock restante
    } catch (err) {
      setError(err.message || "No se pudo registrar el pedido. Intenta de nuevo.");
      cargar(); // el stock pudo cambiar mientras elegías
    } finally {
      setEnviando(false);
    }
  };

  const descargarResumen = async () => {
    setGenerandoResumen(true);
    try {
      await descargarResumenPedido(pedido);
    } catch (err) {
      console.error("[Zazu] Error al generar el resumen:", err);
    } finally {
      setGenerandoResumen(false);
    }
  };

  const buscarSeguimiento = async (e) => {
    e.preventDefault();
    setSegEstado("buscando");
    try {
      const data = await buscarPedidoFestin(seg.orderNumber.trim(), seg.phone.trim());
      if (!data) {
        setSegEstado("no-encontrado");
        return;
      }
      setSegPedido(data);
      setSegEstado("encontrado");
    } catch {
      setSegEstado("error");
    }
  };

  if (estado === "cargando") {
    return (
      <section className="section container">
        <p className="zz-bazar__status">Preparando el festín…</p>
      </section>
    );
  }

  if (estado === "no-existe" || estado === "error") {
    return (
      <section className="section container zz-festin__vacio">
        <Sigil size={80} />
        <p className="eyebrow">Festín</p>
        <h1>{estado === "error" ? "No pudimos abrir el festín" : "Este festín no está disponible"}</h1>
        <p className="lead">
          {estado === "error"
            ? "Intenta de nuevo en unos minutos."
            : "Puede que ya haya terminado o que el enlace no sea el correcto."}
        </p>
      </section>
    );
  }

  const fechaTexto = festin.event_date
    ? new Date(festin.event_date + "T00:00:00").toLocaleDateString("es-PE", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : null;

  const mensajeWhatsapp = pedido
    ? encodeURIComponent(
        `Hola, soy ${pedido.name}. Ya yapeé mi pedido ${pedido.orderNumber} por S/ ${pedido.total.toFixed(2)} (${festin.title}). Adjunto la captura del pago.`
      )
    : "";

  return (
    <section className="section zz-festin">
      <div className="container">
        <header className="zz-festin__hero">
          <Sigil size={64} />
          <p className="eyebrow">Festín</p>
          <h1>{festin.title}</h1>
          {festin.description && <p className="lead">{festin.description}</p>}
          <ul className="zz-festin__datos">
            {fechaTexto && <li>📅 {fechaTexto}</li>}
            {festin.pickup_info && <li>📍 {festin.pickup_info}</li>}
          </ul>
        </header>

        <div className="zz-festin__layout">
          {/* ---- Columna izquierda: piezas disponibles + memes ---- */}
          <div>
            <h2>Elige tus piezas</h2>

            {items.length === 0 && (
              <p className="zz-bazar__status">Aún no hay piezas cargadas para este festín.</p>
            )}

            <div className="zz-festin__items">
              {items.map((item) => {
                const agotado = item.stock <= 0;
                const qty = cantidades[item.id] || 0;
                return (
                  <article
                    className={`zz-festin__item ${agotado ? "zz-festin__item--agotado" : ""}`}
                    key={item.id}
                  >
                    <div>
                      <h3>{item.name}</h3>
                      {item.description && <p>{item.description}</p>}
                      <p className="zz-festin__precio">S/ {Number(item.price).toFixed(2)}</p>
                      <p className={`zz-festin__stock ${item.stock > 0 && item.stock <= 3 ? "zz-festin__stock--poco" : ""}`}>
                        {agotado ? "Agotado" : `Quedan ${item.stock}`}
                      </p>
                    </div>

                    {!agotado && (
                      <div className="zz-festin__stepper">
                        <button type="button" onClick={() => cambiarCantidad(item, -1)} disabled={qty === 0} aria-label="Quitar una">
                          −
                        </button>
                        <span>{qty}</span>
                        <button type="button" onClick={() => cambiarCantidad(item, 1)} disabled={qty >= item.stock} aria-label="Agregar una">
                          +
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            {memes.length > 0 && (
              <div className="zz-festin__memes-bloque">
                <p className="eyebrow">Mientras esperas</p>
                <h2>El rincón de los memes</h2>
                <div className="zz-festin__memes">
                  {memes.map((url, i) => (
                    <button
                      key={url + i}
                      className="zz-festin__meme"
                      style={{ "--giro": ["-1.2deg", "0.9deg", "-0.5deg"][i % 3] }}
                      onClick={() => setMemeAbierto(i)}
                      aria-label="Ver meme en grande"
                    >
                      <img src={url} alt="" loading="lazy" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ---- Columna derecha: pedido / confirmación ---- */}
          <aside className="zz-festin__panel-col">
            {pedido ? (
              <div className="zz-panel zz-panel--confirmado">
                <p className="eyebrow">Pedido registrado</p>
                <h2>{pedido.orderNumber}</h2>
                <p className="zz-festin__guardalo">Guarda este número: lo necesitas para consultar tu pedido.</p>

                <img src="/pago/yape-qr.png" alt="Código QR de Yape" className="zz-checkout__qr" />
                <p className="zz-panel__monto">S/ {pedido.total.toFixed(2)}</p>

                <p className="zz-panel__instrucciones">
                  1. Escanea el QR y paga el monto exacto.<br />
                  2. Toma una captura del pago.<br />
                  3. Envíanosla por WhatsApp con tu número de pedido{" "}
                  <strong>{pedido.orderNumber}</strong>.
                </p>

                {festin.pickup_info && (
                  <p className="zz-festin__recojo">📍 {festin.pickup_info}</p>
                )}

                <div className="zz-panel__acciones">
                  {WHATSAPP_NUMERO && (
                    <a
                      className="btn"
                      href={`https://wa.me/${WHATSAPP_NUMERO}?text=${mensajeWhatsapp}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Enviar captura por WhatsApp
                    </a>
                  )}
                  <button className="btn btn-ghost" onClick={descargarResumen} disabled={generandoResumen}>
                    {generandoResumen ? "Generando…" : "Descargar resumen del pedido"}
                  </button>
                </div>

                <button className="zz-panel__back" onClick={() => setPedido(null)}>
                  Hacer otro pedido
                </button>
              </div>
            ) : (
              <div className="zz-panel">
                <h2>Tu pedido</h2>

                {lineas.length === 0 ? (
                  <p className="zz-bazar__status" style={{ padding: "0.5rem 0" }}>
                    Aún no elegiste ninguna pieza.
                  </p>
                ) : (
                  <>
                    {lineas.map((l) => (
                      <div className="zz-checkout__linea" key={l.item.id}>
                        <span>{l.item.name} × {l.qty}</span>
                        <span>S/ {(Number(l.item.price) * l.qty).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="zz-checkout__linea zz-checkout__total">
                      <span>Total</span>
                      <span>S/ {total.toFixed(2)}</span>
                    </div>
                  </>
                )}

                <form className="zz-form zz-festin__form" onSubmit={handleSubmit}>
                  <label>
                    Tu nombre
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Celular (WhatsApp)
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                    />
                  </label>

                  <button className="btn" type="submit" disabled={enviando || lineas.length === 0}>
                    {enviando ? "Reservando…" : "Reservar y pagar"}
                  </button>

                  {error && <p className="zz-form__status zz-form__status--error">{error}</p>}
                </form>
              </div>
            )}
          </aside>
        </div>

        {/* ---- Seguimiento ---- */}
        <section className="zz-festin__seg">
          <p className="eyebrow">¿Ya pediste?</p>
          <h2>Consulta tu pedido</h2>

          <form className="zz-form zz-festin__seg-form" onSubmit={buscarSeguimiento}>
            <label>
              Número de pedido
              <input
                type="text"
                placeholder="FE-XXXXXX"
                value={seg.orderNumber}
                onChange={(e) => setSeg({ ...seg, orderNumber: e.target.value })}
                required
              />
            </label>
            <label>
              Celular con el que pediste
              <input
                type="tel"
                value={seg.phone}
                onChange={(e) => setSeg({ ...seg, phone: e.target.value })}
                required
              />
            </label>
            <button className="btn btn-ghost" type="submit" disabled={segEstado === "buscando"}>
              {segEstado === "buscando" ? "Buscando…" : "Consultar"}
            </button>
          </form>

          {segEstado === "no-encontrado" && (
            <p className="zz-form__status zz-form__status--error">
              No encontramos un pedido con esos datos. Revisa el número y el celular.
            </p>
          )}
          {segEstado === "error" && (
            <p className="zz-form__status zz-form__status--error">No se pudo consultar ahora. Intenta de nuevo.</p>
          )}

          {segEstado === "encontrado" && segPedido && (
            <div className="zz-panel zz-festin__seg-resultado">
              <div className="zz-seguimiento__header">
                <div>
                  <p className="eyebrow">{segPedido.feast_title}</p>
                  <h2>{segPedido.order_number}</h2>
                </div>
                <span className={`zz-admin__badge zz-admin__badge--${segPedido.status}`}>
                  {ESTADOS_LABEL[segPedido.status] || segPedido.status}
                </span>
              </div>

              <OrderTimeline status={segPedido.status} />

              {segPedido.items?.map((it, i) => (
                <div className="zz-checkout__linea" key={i}>
                  <span>{it.name} × {it.qty}</span>
                  <span>S/ {(Number(it.price) * it.qty).toFixed(2)}</span>
                </div>
              ))}
              <div className="zz-checkout__linea zz-checkout__total">
                <span>Total</span>
                <span>S/ {Number(segPedido.total).toFixed(2)}</span>
              </div>

              {segPedido.pickup_info && (
                <p className="zz-festin__recojo">📍 {segPedido.pickup_info}</p>
              )}
            </div>
          )}
        </section>
      </div>

      {memeAbierto !== null && (
        <ImageLightbox imagenes={memes} indiceInicial={memeAbierto} onClose={() => setMemeAbierto(null)} />
      )}
    </section>
  );
}