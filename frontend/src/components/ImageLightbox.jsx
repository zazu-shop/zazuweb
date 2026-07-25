import { useRef, useState } from "react";
import "./imageLightbox.css";

const ESCALA_MIN = 1;
const ESCALA_MAX = 4;
const PASO_RUEDA = 0.35;
const PASO_CLIC = 1;

export default function ImageLightbox({ imagenes, indiceInicial = 0, onClose }) {
  const [indice, setIndice] = useState(indiceInicial);
  const [escala, setEscala] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const arrastrando = useRef(false);
  const ultimoPuntero = useRef({ x: 0, y: 0 });

  const reiniciarZoom = () => {
    setEscala(1);
    setPos({ x: 0, y: 0 });
  };

  const anterior = (e) => {
    e.stopPropagation();
    reiniciarZoom();
    setIndice((i) => (i - 1 + imagenes.length) % imagenes.length);
  };

  const siguiente = (e) => {
    e.stopPropagation();
    reiniciarZoom();
    setIndice((i) => (i + 1) % imagenes.length);
  };

  // Rueda del mouse: zoom + / zoom -.
  const handleWheel = (e) => {
    e.preventDefault();
    const direccion = e.deltaY > 0 ? -1 : 1;
    setEscala((prev) => {
      const nueva = Math.min(ESCALA_MAX, Math.max(ESCALA_MIN, prev + direccion * PASO_RUEDA));
      if (nueva === ESCALA_MIN) setPos({ x: 0, y: 0 });
      return nueva;
    });
  };

  // Clic simple (sin arrastrar): alterna entre acercado y tamaño normal.
  const handleClickImagen = () => {
    if (arrastrando.current === "movio") {
      arrastrando.current = false;
      return;
    }
    setEscala((prev) => {
      if (prev > ESCALA_MIN) {
        setPos({ x: 0, y: 0 });
        return ESCALA_MIN;
      }
      return ESCALA_MIN + PASO_CLIC;
    });
  };

  const handlePointerDown = (e) => {
    if (escala <= ESCALA_MIN) return;
    arrastrando.current = true;
    ultimoPuntero.current = { x: e.clientX, y: e.clientY };
    e.target.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!arrastrando.current || escala <= ESCALA_MIN) return;
    const dx = e.clientX - ultimoPuntero.current.x;
    const dy = e.clientY - ultimoPuntero.current.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) arrastrando.current = "movio";
    ultimoPuntero.current = { x: e.clientX, y: e.clientY };
    setPos((p) => ({ x: p.x + dx, y: p.y + dy }));
  };

  const handlePointerUp = () => {
    if (arrastrando.current !== "movio") arrastrando.current = false;
  };

  return (
    <div className="zz-lightbox-overlay" onClick={onClose}>
      <button className="zz-lightbox-overlay__cerrar" onClick={onClose} aria-label="Cerrar">✕</button>

      {imagenes.length > 1 && (
        <button className="zz-lightbox-overlay__flecha zz-lightbox-overlay__flecha--izq" onClick={anterior} aria-label="Anterior">
          ←
        </button>
      )}

      <div className="zz-lightbox-overlay__marco" onClick={(e) => e.stopPropagation()} onWheel={handleWheel}>
        <img
          src={imagenes[indice]}
          alt=""
          className="zz-lightbox-overlay__img"
          draggable={false}
          onClick={handleClickImagen}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${escala})`,
            cursor: escala > ESCALA_MIN ? "grab" : "zoom-in",
          }}
        />
      </div>

      {imagenes.length > 1 && (
        <button className="zz-lightbox-overlay__flecha zz-lightbox-overlay__flecha--der" onClick={siguiente} aria-label="Siguiente">
          →
        </button>
      )}

      <div className="zz-lightbox-overlay__pie">
        {imagenes.length > 1 && <span>{indice + 1} / {imagenes.length} — </span>}
        <span>
          {escala > ESCALA_MIN
            ? "Arrastra para mover · rueda del mouse para acercar/alejar"
            : "Rueda del mouse o clic para acercar"}
        </span>
      </div>
    </div>
  );
}