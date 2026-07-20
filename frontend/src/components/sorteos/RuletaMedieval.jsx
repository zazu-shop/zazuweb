import { useRef, useState } from "react";
import { sonidos8bit } from "../../lib/sonidos8bit";
import ChispasDoradas from "../ChispasDoradas";
import "./ruleta.css";

const COLORES = ["#1d1428", "#2a1b3d", "#150f1e", "#3b1f5c"];

export default function RuletaMedieval({ opciones }) {
  const [rotacion, setRotacion] = useState(0);
  const [girando, setGirando] = useState(false);
  const [ganador, setGanador] = useState(null);
  const rotacionRef = useRef(0);

  const n = opciones.length;
  const anguloPorItem = n > 0 ? 360 / n : 0;

  const gradiente = n > 0
    ? opciones
        .map((_, i) => {
          const color = COLORES[i % COLORES.length];
          const desde = (i * anguloPorItem).toFixed(2);
          const hasta = ((i + 1) * anguloPorItem).toFixed(2);
          return `${color} ${desde}deg ${hasta}deg`;
        })
        .join(", ")
    : "var(--zz-void-2)";

  const girar = () => {
    if (girando || n === 0) return;
    setGirando(true);
    setGanador(null);

    const indiceGanador = Math.floor(Math.random() * n);
    const anguloCentro = indiceGanador * anguloPorItem + anguloPorItem / 2;
    const base = rotacionRef.current - (rotacionRef.current % 360);
    const nuevaRotacion = base + 5 * 360 + (360 - anguloCentro);

    rotacionRef.current = nuevaRotacion;
    setRotacion(nuevaRotacion);

    setTimeout(() => {
      setGirando(false);
      setGanador(opciones[indiceGanador].value);
      sonidos8bit.atrapar();
    }, 4200);
  };

  return (
    <div className="zz-ruleta">
      {n === 0 && (
        <p className="zz-bazar__status">
          Agrega al menos dos opciones en la lista de la ruleta para poder girar.
        </p>
      )}

      <div className="zz-ruleta__contenedor">
        <div className="zz-ruleta__puntero" />
        <div
          className="zz-ruleta__rueda"
          style={{
            background: `conic-gradient(${gradiente})`,
            transform: `rotate(${rotacion}deg)`,
          }}
        >
          {opciones.map((op, i) => {
            const angulo = i * anguloPorItem + anguloPorItem / 2;
            return (
              <div
                key={op.id}
                className="zz-ruleta__etiqueta"
                style={{ transform: `rotate(${angulo - 90}deg)` }}
              >
                <span style={{ transform: `rotate(${-(angulo - 90)}deg)` }}>{op.value}</span>
              </div>
            );
          })}
        </div>
      </div>

      <button className="btn zz-ruleta__boton" onClick={girar} disabled={girando || n < 2}>
        {girando ? "Girando…" : "Girar la ruleta"}
      </button>

      {ganador && (
        <>
          <ChispasDoradas />
          <div className="zz-ruleta__ganador">
            <p className="eyebrow">El destino eligió</p>
            <p className="zz-ruleta__ganador-texto">{ganador}</p>
          </div>
        </>
      )}
    </div>
  );
}