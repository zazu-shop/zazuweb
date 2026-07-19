import { useWishlist } from "../lib/WishlistContext";
import "./heartButton.css";

export default function HeartButton({ productId, className = "" }) {
  const { estaEnFavoritos, alternarFavorito } = useWishlist();
  const activo = estaEnFavoritos(productId);

  return (
    <button
      className={`zz-heart ${activo ? "zz-heart--activo" : ""} ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        alternarFavorito(productId);
      }}
      aria-label={activo ? "Quitar de favoritos" : "Agregar a favoritos"}
      aria-pressed={activo}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
          d="M12 20.5s-7.5-4.6-10-9.2C.4 8.1 2 4.5 5.6 4c2-.3 3.8.6 4.9 2.2l1.5 2 1.5-2C14.6 4.6 16.4 3.7 18.4 4c3.6.5 5.2 4.1 3.6 7.3-2.5 4.6-10 9.2-10 9.2Z"
          fill={activo ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
    </button>
  );
}