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