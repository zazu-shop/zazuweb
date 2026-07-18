import "./skeleton.css";

export function SkeletonCard() {
  return (
    <div className="card zz-skeleton-card">
      <div className="zz-skeleton zz-skeleton-card__img" />
      <div className="zz-skeleton zz-skeleton-card__linea" style={{ width: "40%" }} />
      <div className="zz-skeleton zz-skeleton-card__linea" style={{ width: "80%", height: "1.1rem" }} />
      <div className="zz-skeleton zz-skeleton-card__linea" style={{ width: "60%" }} />
    </div>
  );
}

export function SkeletonGrid({ cantidad = 3 }) {
  return (
    <div className="grid grid-3">
      {Array.from({ length: cantidad }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonDetalle() {
  return (
    <div className="zz-skeleton-detalle">
      <div className="zz-skeleton zz-skeleton-detalle__img" />
      <div className="zz-skeleton-detalle__info">
        <div className="zz-skeleton" style={{ width: "30%", height: "0.8rem" }} />
        <div className="zz-skeleton" style={{ width: "70%", height: "2rem", marginTop: "0.8rem" }} />
        <div className="zz-skeleton" style={{ width: "25%", height: "1.4rem", marginTop: "1rem" }} />
        <div className="zz-skeleton" style={{ width: "90%", height: "0.9rem", marginTop: "1.5rem" }} />
        <div className="zz-skeleton" style={{ width: "80%", height: "0.9rem", marginTop: "0.6rem" }} />
        <div className="zz-skeleton" style={{ width: "60%", height: "0.9rem", marginTop: "0.6rem" }} />
        <div className="zz-skeleton" style={{ width: "40%", height: "2.8rem", marginTop: "2rem" }} />
      </div>
    </div>
  );
}