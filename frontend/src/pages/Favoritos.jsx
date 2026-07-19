import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useWishlist } from "../lib/WishlistContext";
import { useCart } from "../lib/CartContext";
import HeartButton from "../components/HeartButton";
import { SkeletonGrid } from "../components/Skeleton";
import "./favoritos.css";

export default function Favoritos() {
  const { ids } = useWishlist();
  const { addItem } = useCart();
  const [piezas, setPiezas] = useState([]);
  const [estado, setEstado] = useState("cargando");

  useEffect(() => {
    if (!supabase) {
      setEstado("error");
      return;
    }
    if (ids.length === 0) {
      setPiezas([]);
      setEstado("listo");
      return;
    }

    setEstado("cargando");
    supabase
      .from("products")
      .select("id, name, description, price, image_url, stock, active")
      .in("id", ids)
      .then(({ data, error }) => {
        if (error) {
          setEstado("error");
          return;
        }
        setPiezas(data);
        setEstado("listo");
      });
  }, [ids]);

  return (
    <section className="section container zz-favoritos">
      <p className="eyebrow">Tu lista</p>
      <h1>Favoritos</h1>
      <p className="lead zz-favoritos__intro">
        Las piezas que marcaste para no perderlas de vista. Se guardan en este navegador.
      </p>

      {estado === "cargando" && <SkeletonGrid cantidad={3} />}

      {estado === "error" && (
        <p className="zz-bazar__status">No se pudieron cargar tus favoritos.</p>
      )}

      {estado === "listo" && ids.length === 0 && (
        <p className="zz-bazar__status">
          Aún no tienes piezas guardadas. Marca el corazón en cualquier producto del{" "}
          <Link to="/bazar">Bazar</Link> para agregarlo aquí.
        </p>
      )}

      {estado === "listo" && piezas.length > 0 && (
        <div className="grid grid-3">
          {piezas.map((pieza) => (
            <article className="card zz-bazar__item" key={pieza.id}>
              <div className="zz-bazar__imagelink" style={{ position: "relative" }}>
                <Link to={`/bazar/${pieza.id}`}>
                  {pieza.image_url ? (
                    <img src={pieza.image_url} alt={pieza.name} className="zz-bazar__image" loading="lazy" />
                  ) : (
                    <div className="zz-bazar__image zz-bazar__image--placeholder" />
                  )}
                </Link>
                <HeartButton productId={pieza.id} className="zz-favoritos__corazon" />
              </div>

              <Link to={`/bazar/${pieza.id}`}>
                <h3>{pieza.name}</h3>
              </Link>
              <p>{pieza.description}</p>

              <div className="zz-bazar__footer">
                <p className="zz-bazar__price">S/ {pieza.price}</p>
                <button
                  className="btn btn-ghost zz-bazar__addbtn"
                  onClick={() => addItem(pieza)}
                  disabled={pieza.stock === 0 || !pieza.active}
                >
                  {!pieza.active ? "No disponible" : pieza.stock === 0 ? "Agotado" : "Agregar"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}