/**
 * Divisor "rasgado": en vez de un <hr> recto, dibuja una línea irregular
 * como si estuviera trazada a pluma sobre pergamino. Se usa entre cada
 * capítulo/sección de la página para reforzar la identidad de grimorio.
 */
export default function RoughDivider({ label }) {
  return (
    <div className="zz-divider" role="separator">
      <svg
        viewBox="0 0 1200 24"
        preserveAspectRatio="none"
        filter="url(#zz-roughen)"
        aria-hidden="true"
      >
        <path
          d="M0 12 C 200 4, 400 20, 600 12 S 1000 4, 1200 12"
          stroke="var(--zz-line)"
          strokeWidth="1.2"
          fill="none"
        />
      </svg>
      {label && <span className="zz-divider__label">{label}</span>}
    </div>
  );
}
