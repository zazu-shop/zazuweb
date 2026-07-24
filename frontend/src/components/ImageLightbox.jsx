import { useState } from "react";
import "./imageLightbox.css";

export default function ImageLightbox({ imagenes, indiceInicial = 0, onClose }) {
  const [indice, setIndice] = useState(indiceInicial);
  const [zoom, setZoom] = useState(false);

  const anterior = (e) => {
    e.stopPropagation();
    setZoom(false);
    setIndice((i) => (i - 1 + imagenes.length) % imagenes.length);
  };

  const siguiente = (e) => {
    e.stopPropagation();
    setZoom(false);
    setIndice((i) => (i + 1) % imagenes.length);
  };

  return (
    <div className="zz-lightbox-overlay" onClick={onClose}>
      <button className="zz-lightbox-overlay__cerrar" onClick={onClose} aria-label="Cerrar">✕</button>

      {imagenes.length > 1 && (
        <button className="zz-lightbox-overlay__flecha zz-lightbox-overlay__flecha--izq" onClick={anterior} aria-label="Anterior">
          ←
        </button>
      )}

      <div
        className={`zz-lightbox-overlay__marco ${zoom ? "zz-lightbox-overlay__marco--zoom" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imagenes[indice]}
          alt=""
          className={`zz-lightbox-overlay__img ${zoom ? "zz-lightbox-overlay__img--zoom" : ""}`}
          onClick={() => setZoom((z) => !z)}
        />
      </div>

      {imagenes.length > 1 && (
        <button className="zz-lightbox-overlay__flecha zz-lightbox-overlay__flecha--der" onClick={siguiente} aria-label="Siguiente">
          →
        </button>
      )}

      <div className="zz-lightbox-overlay__pie">
        {imagenes.length > 1 && <span>{indice + 1} / {imagenes.length} — </span>}
        <span>{zoom ? "Clic para alejar" : "Clic en la imagen para acercar"}</span>
      </div>
    </div>
  );
}