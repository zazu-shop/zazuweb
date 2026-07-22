import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useCart } from "../lib/CartContext";
import { SkeletonGrid } from "../components/Skeleton";
import Reveal from "../components/Reveal";
import HeartButton from "../components/HeartButton";
import "./baul.css";

export default function Baul() {
  const { addItem } = useCart();
  const [piezas, setPiezas] = useState([]);
  const [estado, setEstado] = useState("cargando");
  const [agregadoId, setAgregadoId] = useState(null);

  useEffect(() => {
    if (!supabase) {
      setEstado("error");
      return;
    }

    supabase
      .from("products")
      .select("id, name, description, price, compare_at_price, category, image_url, stock, active, baul_note")
      .eq("is_baul", true)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setEstado("error");
          return;
        }
        setPiezas(data);
        setEstado("listo");
      });
  }, []);

  const handleAgregar = (pieza) => {
    addItem(pieza);
    setAgregadoId(pieza.id);
    setTimeout(() => setAgregadoId(null), 900);
  };

  return (
    <section className="section zz-baul">
      <div className="container">
        <p className="eyebrow zz-baul__eyebrow">El fondo del taller</p>
        <h1>El Baúl</h1>
        <p className="lead zz-baul__intro">
          Piezas con un pequeño detalle, prototipos que no volverán a repetirse, o diseños que
          ya no forman parte del catálogo regular. Cada una es única — cuando se acaba, se acaba
          de verdad.
        </p>

        {estado === "cargando" && <SkeletonGrid cantidad={6} />}

        {estado === "error" && (
          <p className="zz-bazar__status">No pudimos abrir el Baúl en este momento.</p>
        )}

        {estado === "listo" && piezas.length === 0 && (
          <p className="zz-bazar__status">
            El Baúl está vacío por ahora. Vuelve pronto — nunca sabes qué va a aparecer.
          </p>
        )}

        {estado === "listo" && piezas.length > 0 && (
          <div className="grid grid-3">
            {piezas.map((pieza, i) => (
              <Reveal key={pieza.id} delay={(i % 3) * 100}>
                <article className={`card zz-baul__item ${!pieza.active ? "zz-bazar__item--no-disponible" : ""}`}>
                  <div className="zz-bazar__imagelink">
                    <Link to={`/bazar/${pieza.id}`}>
                      {pieza.image_url ? (
                        <img src={pieza.image_url} alt={pieza.name} className="zz-bazar__image" loading="lazy" />
                      ) : (
                        <div className="zz-bazar__image zz-bazar__image--placeholder" />
                      )}
                    </Link>
                    <span className="zz-baul__badge">Pieza del Baúl</span>
                    <HeartButton productId={pieza.id} className="zz-bazar__corazon" />
                  </div>

                  <p className="eyebrow zz-bazar__category">{pieza.category || "General"}</p>
                  <Link to={`/bazar/${pieza.id}`}>
                    <h3>{pieza.name}</h3>
                  </Link>
                  <p>{pieza.description}</p>

                  {pieza.baul_note && (
                    <p className="zz-baul__nota">
                      <strong>Detalle:</strong> {pieza.baul_note}
                    </p>
                  )}

                  <div className="zz-bazar__footer">
                    <div className="zz-bazar__precios">
                      {pieza.compare_at_price > pieza.price && (
                        <span className="zz-bazar__price-old">S/ {pieza.compare_at_price}</span>
                      )}
                      <p className="zz-baul__price">S/ {pieza.price}</p>
                    </div>
                    <button
                      className={`btn btn-ghost zz-bazar__addbtn zz-baul__addbtn ${agregadoId === pieza.id ? "zz-bazar__addbtn--ok" : ""}`}
                      onClick={() => handleAgregar(pieza)}
                      disabled={pieza.stock === 0 || !pieza.active}
                    >
                      {!pieza.active ? "No disponible" : pieza.stock === 0 ? "Agotado" : agregadoId === pieza.id ? "✓ Agregado" : "Agregar"}
                    </button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}