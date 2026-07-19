import "./orderTimeline.css";

const PASOS = [
  { key: "pendiente_verificacion", label: "Pedido registrado" },
  { key: "pagado", label: "Pago verificado" },
  { key: "completado", label: "Entregado" },
];

export default function OrderTimeline({ status }) {
  if (status === "cancelado") {
    return (
      <div className="zz-timeline zz-timeline--cancelado">
        <span className="zz-timeline__icono">✕</span>
        <span>Este pedido fue cancelado</span>
      </div>
    );
  }

  const indiceActual = PASOS.findIndex((p) => p.key === status);
  const actual = indiceActual === -1 ? 0 : indiceActual;

  return (
    <div className="zz-timeline">
      {PASOS.map((paso, i) => {
        const completado = i < actual;
        const enCurso = i === actual;
        return (
          <div className="zz-timeline__paso" key={paso.key}>
            <div className="zz-timeline__linea-wrap">
              {i > 0 && (
                <span className={`zz-timeline__linea ${i <= actual ? "zz-timeline__linea--activa" : ""}`} />
              )}
              <span
                className={`zz-timeline__punto ${completado ? "zz-timeline__punto--hecho" : ""} ${
                  enCurso ? "zz-timeline__punto--actual" : ""
                }`}
              >
                {completado ? "✓" : i + 1}
              </span>
            </div>
            <span className={`zz-timeline__label ${enCurso ? "zz-timeline__label--actual" : ""}`}>
              {paso.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}