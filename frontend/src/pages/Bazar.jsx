import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useCart } from "../lib/CartContext";
import { SkeletonGrid } from "../components/Skeleton";
import Reveal from "../components/Reveal";
import HeartButton from "../components/HeartButton";
import QuickView from "../components/QuickView";
import "./bazar.css";

const ORDEN_OPCIONES = [
  { value: "recientes", label: "Más recientes" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "nombre", label: "Nombre A–Z" },
];

export default function Bazar() {
  const [searchParams] = useSearchParams();
  const [piezas, setPiezas] = useState([]);
  const [estado, setEstado] = useState("cargando"); // cargando | listo | error | sin-config
  const { addItem } = useCart();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) localStorage.setItem("zazu_ref_code", ref);
  }, [searchParams]);

  const [categoria, setCategoria] = useState("Todas");
  const [orden, setOrden] = useState("recientes");
  const [precioMax, setPrecioMax] = useState("");
  const [agregadoId, setAgregadoId] = useState(null);
  const [vistaRapida, setVistaRapida] = useState(null);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  const handleAgregar = (pieza) => {
    addItem(pieza);
    setAgregadoId(pieza.id);
    setTimeout(() => setAgregadoId(null), 900);
  };

  useEffect(() => {
    let activo = true;

    if (!supabase) {
      setEstado("sin-config");
      return;
    }

    supabase
      .from("products")
      .select("id, name, description, price, compare_at_price, category, image_url, stock, active, is_baul, created_at")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!activo) return;
        if (error) {
          console.error("[Zazu] Error al leer products:", error.message);
          setEstado("error");
          return;
        }
        setPiezas(data);
        setEstado("listo");
      });

    return () => {
      activo = false;
    };
  }, []);

  const categorias = useMemo(() => {
    const unicas = new Set(piezas.map((p) => p.category || "General"));
    return ["Todas", ...unicas];
  }, [piezas]);

  const piezasFiltradas = useMemo(() => {
    let resultado = [...piezas];

    if (categoria !== "Todas") {
      resultado = resultado.filter((p) => (p.category || "General") === categoria);
    }

    if (precioMax) {
      resultado = resultado.filter((p) => Number(p.price) <= Number(precioMax));
    }

    switch (orden) {
      case "precio-asc":
        resultado.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "precio-desc":
        resultado.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "nombre":
        resultado.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // "recientes" ya viene ordenado por created_at desde Supabase
        break;
    }

    return resultado;
  }, [piezas, categoria, orden, precioMax]);

  const filtrosActivos = categoria !== "Todas" || Boolean(precioMax);

  const limpiarFiltros = () => {
    setCategoria("Todas");
    setPrecioMax("");
  };

  return (
    <section className="section zz-bazar">
      <div className="container">
        <p className="eyebrow">El Bazar</p>
        <h1>Piezas disponibles</h1>
        <p className="lead zz-bazar__intro">
          Cada objeto es forjado en tiradas pequeñas. Cuando se agota, no
          vuelve a fabricarse igual.
        </p>

        {estado === "cargando" && <SkeletonGrid cantidad={6} />}

        {estado === "sin-config" && (
          <p className="zz-bazar__status">
            Falta conectar Supabase: crea <code>frontend/.env</code> con
            <code> VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code>
            , y reinicia <code>npm run dev</code>.
          </p>
        )}

        {estado === "error" && (
          <p className="zz-bazar__status">
            No pudimos conectar con el bazar en este momento. Revisa la
            consola del navegador para más detalle, o vuelve a intentarlo
            más tarde.
          </p>
        )}

        {estado === "listo" && (
          <div className="zz-bazar__layout">
            {/* ---- Barra lateral de filtros ---- */}
            <aside className={`zz-bazar__sidebar ${filtrosAbiertos ? "zz-bazar__sidebar--abierta" : ""}`}>
              <button
                className="zz-bazar__sidebar-toggle"
                onClick={() => setFiltrosAbiertos((v) => !v)}
              >
                Filtros {filtrosActivos && <span className="zz-nav__cart-count">●</span>}
                <span>{filtrosAbiertos ? "▲" : "▼"}</span>
              </button>

              <div className="zz-bazar__sidebar-contenido">
                <div className="zz-bazar__sidebar-seccion">
                  <p className="eyebrow">Categoría</p>
                  <div className="zz-bazar__categorias">
                    {categorias.map((cat) => (
                      <button
                        key={cat}
                        className={`zz-bazar__categoria-item ${categoria === cat ? "zz-bazar__categoria-item--activa" : ""}`}
                        onClick={() => setCategoria(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="zz-bazar__sidebar-seccion">
                  <label className="zz-bazar__control">
                    <span className="eyebrow">Precio máx.</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="S/ 200"
                      value={precioMax}
                      onChange={(e) => setPrecioMax(e.target.value)}
                    />
                  </label>
                </div>

                <div className="zz-bazar__sidebar-seccion">
                  <label className="zz-bazar__control">
                    <span className="eyebrow">Ordenar por</span>
                    <select value={orden} onChange={(e) => setOrden(e.target.value)}>
                      {ORDEN_OPCIONES.map((op) => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {filtrosActivos && (
                  <button className="btn btn-ghost zz-bazar__limpiar" onClick={limpiarFiltros}>
                    Limpiar filtros
                  </button>
                )}
              </div>
            </aside>

            {/* ---- Grilla de productos ---- */}
            <div className="zz-bazar__contenido">
              {piezasFiltradas.length === 0 && (
                <p className="zz-bazar__status">
                  Ninguna pieza coincide con esos filtros. Prueba ampliando el
                  precio máximo o eligiendo otra categoría.
                </p>
              )}

              <div className="grid grid-3">
                {piezasFiltradas.map((pieza, i) => (
                  <Reveal key={pieza.id} delay={(i % 3) * 100}>
                  <article className={`card zz-bazar__item ${!pieza.active ? "zz-bazar__item--no-disponible" : ""} ${pieza.is_baul ? "zz-baul zz-baul__item" : ""}`}>
                    <Link to={`/bazar/${pieza.id}`} className="zz-bazar__imagelink">
                      {pieza.image_url ? (
                        <img src={pieza.image_url} alt={pieza.name} className="zz-bazar__image" loading="lazy" />
                      ) : (
                        <div className="zz-bazar__image zz-bazar__image--placeholder" />
                      )}
                      <div className="zz-bazar__insignias">
                        {pieza.is_baul && <span className="zz-baul__badge">Del Baúl</span>}
                        {!pieza.active ? (
                          <span className="zz-bazar__discount zz-bazar__discount--gris">No disponible</span>
                        ) : (
                          pieza.compare_at_price > pieza.price && (
                            <span className="zz-bazar__discount">
                              -{Math.round(100 - (pieza.price / pieza.compare_at_price) * 100)}%
                            </span>
                          )
                        )}
                      </div>
                    </Link>
                    <HeartButton productId={pieza.id} className="zz-bazar__corazon" />
                    <button
                      className="zz-bazar__vista-rapida"
                      onClick={() => setVistaRapida(pieza)}
                      aria-label="Vista rápida"
                    >
                      👁
                    </button>

                    <p className="eyebrow zz-bazar__category">{pieza.category || "General"}</p>
                    <Link to={`/bazar/${pieza.id}`}>
                      <h3>{pieza.name}</h3>
                    </Link>
                    <p>{pieza.description}</p>

                    <div className="zz-bazar__footer">
                      <div className="zz-bazar__precios">
                        {pieza.compare_at_price > pieza.price && (
                          <span className="zz-bazar__price-old">S/ {pieza.compare_at_price}</span>
                        )}
                        {pieza.price != null && (
                          <p className="zz-bazar__price">S/ {pieza.price}</p>
                        )}
                      </div>
                      <button
                        className={`btn btn-ghost zz-bazar__addbtn ${agregadoId === pieza.id ? "zz-bazar__addbtn--ok" : ""}`}
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
            </div>
          </div>
        )}
      </div>

      {vistaRapida && (
        <QuickView
          producto={vistaRapida}
          onClose={() => setVistaRapida(null)}
          onAgregar={(p) => {
            handleAgregar(p);
            setVistaRapida(null);
          }}
        />
      )}
    </section>
  );
}