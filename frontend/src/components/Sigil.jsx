import "./sigil.css";

/**
 * Aura arcana: círculo + estrella de ocho puntas trazados a pulso.
 * Ya no lleva la marca (eso lo hace el logo real de Zazu Shop); se usa
 * como motivo ambiental detrás del logo en el hero y como sello decorativo
 * en tarjetas de producto.
 */
export default function Sigil({ size = 64, animated = false, className = "" }) {
  return (
    <svg
      className={`zz-sigil ${animated ? "zz-sigil--animated" : ""} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      filter="url(#zz-roughen)"
      role="img"
      aria-label="Sello arcano de Zazu"
    >
      <circle cx="60" cy="60" r="52" stroke="var(--zz-gold)" strokeWidth="1.4" />
      <circle cx="60" cy="60" r="40" stroke="var(--zz-purple-2)" strokeWidth="1" opacity="0.7" />
      <circle cx="60" cy="60" r="58" stroke="var(--zz-line)" strokeWidth="0.6" />
    </svg>
  );
}