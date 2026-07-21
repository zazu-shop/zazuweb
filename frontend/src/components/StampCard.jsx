import "./stampCard.css";

const SELLOS_POR_TARJETA = 10;

export default function StampCard({ total }) {
  const tarjetasCompletas = Math.floor(total / SELLOS_POR_TARJETA);
  const enTarjetaActual = total % SELLOS_POR_TARJETA;

  return (
    <div className="zz-stampcard">
      <div className="zz-stampcard__header">
        <p className="eyebrow">Tarjeta de sellos</p>
        {tarjetasCompletas > 0 && (
          <span className="zz-stampcard__completas">
            {tarjetasCompletas} tarjeta{tarjetasCompletas > 1 ? "s" : ""} completada{tarjetasCompletas > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="zz-stampcard__grid">
        {Array.from({ length: SELLOS_POR_TARJETA }).map((_, i) => (
          <div key={i} className={`zz-stampcard__slot ${i < enTarjetaActual ? "zz-stampcard__slot--lleno" : ""}`}>
            {i < enTarjetaActual && <img src="/logo/sello-gato-gold.png" alt="" />}
          </div>
        ))}
      </div>

      <p className="zz-stampcard__nota">
        Ganas un sello por cada compra, y otro extra cuando alguien usa tu código de referido.
        Cada {SELLOS_POR_TARJETA} sellos completa una tarjeta.
      </p>
    </div>
  );
}