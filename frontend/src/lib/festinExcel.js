// Arma el Excel con el resumen de pedidos de un festín.
// Hojas: "Resumen" (totales y piezas vendidas), "Pedidos" (uno por fila) y "Detalle" (una fila por pieza pedida).

import { crearXlsx, descargarArchivo, serialFecha, serialFechaHora } from "./xlsxExport";

const ESTADOS = {
  pendiente_verificacion: "Pendiente de verificación",
  pagado: "Pagado",
  completado: "Entregado",
  cancelado: "Cancelado",
};

const dinero = (v) => ({ v: Number(v) || 0, e: "dinero" });
const encabezados = (lista) => lista.map((t) => ({ v: t, e: "encabezado" }));

export function construirHojasFestin(festin, pedidos, ahora = new Date()) {
  const ordenados = [...pedidos].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const vigentes = ordenados.filter((p) => p.status !== "cancelado");
  const suma = (lista) => lista.reduce((s, p) => s + Number(p.total), 0);
  const deEstado = (estado) => ordenados.filter((p) => p.status === estado);
  const hoyLima = ahora.toLocaleDateString("en-CA", { timeZone: "America/Lima" });
  const vencidos = ordenados.filter(
    (p) => p.pay_later && p.status === "pendiente_verificacion" && p.commitment_date && p.commitment_date < hoyLima
  ).length;

  // Piezas vendidas (sin contar cancelados)
  const porPieza = new Map();
  vigentes.forEach((p) =>
    (p.feast_order_items || []).forEach((it) => {
      const actual = porPieza.get(it.name) || { qty: 0, monto: 0 };
      actual.qty += it.qty;
      actual.monto += Number(it.price) * it.qty;
      porPieza.set(it.name, actual);
    })
  );

  /* ---- Hoja 1: Resumen ---- */
  const resumen = [
    [{ v: festin?.title || "Festín", e: "titulo" }],
    [{ v: "Fecha del evento", e: "negrita" }, festin?.event_date ? { v: serialFecha(festin.event_date), e: "fecha" } : "—"],
    [{ v: "Recojo / lugar", e: "negrita" }, festin?.pickup_info || "—"],
    [{ v: "Exportado el", e: "negrita" }, { v: serialFechaHora(ahora), e: "fechaHora" }],
    [],
    encabezados(["Estado de los pedidos", "Pedidos", "Monto"]),
  ];
  ["pagado", "completado", "pendiente_verificacion"].forEach((estado) => {
    const lista = deEstado(estado);
    resumen.push([ESTADOS[estado], { v: lista.length, e: "entero" }, dinero(suma(lista))]);
  });
  resumen.push(
    [
      { v: "Total vigente (sin cancelados)", e: "negrita" },
      { v: vigentes.length, e: "entero" },
      { v: suma(vigentes), e: "dineroNegrita" },
    ],
    [
      { v: "Cobrado (pagado + entregado)", e: "negrita" },
      { v: deEstado("pagado").length + deEstado("completado").length, e: "entero" },
      { v: suma([...deEstado("pagado"), ...deEstado("completado")]), e: "dineroNegrita" },
    ],
    ["Cancelados (no suman en los totales)", { v: deEstado("cancelado").length, e: "entero" }, dinero(suma(deEstado("cancelado")))],
    ["Compromisos de pago vencidos", { v: vencidos, e: "entero" }, null],
    [],
    encabezados(["Pieza", "Cantidad", "Monto"])
  );
  if (porPieza.size === 0) resumen.push(["Aún no hay piezas pedidas"]);
  let totalPiezas = 0;
  let montoPiezas = 0;
  porPieza.forEach((d, nombre) => {
    totalPiezas += d.qty;
    montoPiezas += d.monto;
    resumen.push([nombre, { v: d.qty, e: "entero" }, dinero(d.monto)]);
  });
  if (porPieza.size > 0) {
    resumen.push([
      { v: "Total", e: "negrita" },
      { v: totalPiezas, e: "entero" },
      { v: montoPiezas, e: "dineroNegrita" },
    ]);
  }

  /* ---- Hoja 2: Pedidos (una columna por pieza) ---- */
  const nombresPiezas = [];
  ordenados.forEach((p) =>
    (p.feast_order_items || []).forEach((it) => {
      if (!nombresPiezas.includes(it.name)) nombresPiezas.push(it.name);
    })
  );

  const hojaPedidos = [
    encabezados([
      "N.º de pedido", "Fecha", "Cliente", "Celular", "Estado", "Forma de pago", "Compromiso de pago",
      ...nombresPiezas, "Total", "Actualizado",
    ]),
  ];
  ordenados.forEach((p) => {
    const cantidades = nombresPiezas.map((nombre) => {
      const n = (p.feast_order_items || []).filter((it) => it.name === nombre).reduce((s, it) => s + it.qty, 0);
      return n > 0 ? { v: n, e: "entero" } : null;
    });
    hojaPedidos.push([
      p.order_number,
      { v: serialFechaHora(p.created_at), e: "fechaHora" },
      p.customer_name,
      String(p.customer_phone || ""),
      ESTADOS[p.status] || p.status,
      p.pay_later ? "Pagar después" : "Pagar ahora",
      p.pay_later && p.commitment_date ? { v: serialFecha(p.commitment_date), e: "fecha" } : null,
      ...cantidades,
      dinero(p.total),
      p.updated_at ? { v: serialFechaHora(p.updated_at), e: "fechaHora" } : null,
    ]);
  });

  /* ---- Hoja 3: Detalle (una fila por pieza pedida) ---- */
  const hojaDetalle = [
    encabezados(["N.º de pedido", "Cliente", "Celular", "Estado", "Pieza", "Cantidad", "Precio unitario", "Subtotal"]),
  ];
  ordenados.forEach((p) =>
    (p.feast_order_items || []).forEach((it) => {
      hojaDetalle.push([
        p.order_number,
        p.customer_name,
        String(p.customer_phone || ""),
        ESTADOS[p.status] || p.status,
        it.name,
        { v: it.qty, e: "entero" },
        dinero(it.price),
        dinero(Number(it.price) * it.qty),
      ]);
    })
  );

  return [
    { nombre: "Resumen", filas: resumen, anchos: [38, 14, 16, 16] },
    {
      nombre: "Pedidos",
      filas: hojaPedidos,
      anchos: [16, 17, 26, 15, 24, 16, 19, ...nombresPiezas.map(() => 12), 13, 17],
      congelarEncabezado: true,
      filtro: true,
    },
    {
      nombre: "Detalle",
      filas: hojaDetalle,
      anchos: [16, 26, 15, 24, 26, 10, 16, 14],
      congelarEncabezado: true,
      filtro: true,
    },
  ];
}

const slug = (t) =>
  String(t || "festin")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "festin";

export function exportarPedidosFestinExcel(festin, pedidos) {
  const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Lima" });
  const blob = crearXlsx(construirHojasFestin(festin, pedidos));
  descargarArchivo(blob, `pedidos-${slug(festin?.slug || festin?.title)}-${hoy}.xlsx`);
}