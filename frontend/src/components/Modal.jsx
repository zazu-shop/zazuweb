import "./modal.css";

export default function Modal({ children, onClose }) {
  return (
    <div className="zz-modal__overlay" onClick={onClose}>
      <div className="zz-modal__contenido" onClick={(e) => e.stopPropagation()}>
        <button className="zz-modal__cerrar" onClick={onClose} aria-label="Cerrar">✕</button>
        {children}
      </div>
    </div>
  );
}