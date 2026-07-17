import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sigil from "../components/Sigil";
import RoughDivider from "../components/RoughDivider";
import { supabase } from "../lib/supabaseClient";
import "./home.css";

export default function Home() {
  const [piezas, setPiezas] = useState([]);
  const [estado, setEstado] = useState("cargando"); // cargando | listo | error

  useEffect(() => {
    if (!supabase) {
      setEstado("error");
      return;
    }

    supabase
      .from("products")
      .select("id, name, description, image_url")
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data, error }) => {
        if (error) {
          setEstado("error");
          return;
        }
        setPiezas(data);
        setEstado("listo");
      });
  }, []);

  return (
    <>
      {/* ---- Hero: el sigilo como tesis visual ---- */}
      <section className="zz-hero">
        <div className="container zz-hero__inner">
          <div className="zz-hero__text">
            <p className="eyebrow">Taller de objetos arcanos — est. Lima</p>
            <h1 className="zz-hero__title">
              Zazu talla lo <em>invisible</em><br /> en materia.
            </h1>
            <p className="lead">
              Piezas hechas a mano donde el esoterismo, el mito medieval
              y el oficio artesanal conviven en un mismo objeto.
            </p>
            <div className="zz-hero__actions">
              <Link to="/bazar" className="btn">Entrar al Bazar</Link>
              <Link to="/grimorio" className="btn btn-ghost">Leer el Grimorio</Link>
            </div>
          </div>

          <div className="zz-hero__sigil" aria-hidden="true">
            <img
              src="/logo/logo-white.png"
              alt="Zazu Shop — sombrero de bruja y gato negro"
              className="zz-hero__logo"
            />
          </div>
        </div>
      </section>

      <div className="container">
        <RoughDivider label="Capítulo I · La Casa" />
      </div>

      {/* ---- Teaser de marca ---- */}
      <section className="section">
        <div className="container zz-story">
          <div>
            <p className="eyebrow">Quiénes somos</p>
            <h2>Un oficio nacido en los márgenes del mapa</h2>
          </div>
          <p className="lead">
            Zazu nace de la creencia de que cada objeto forjado a mano
            guarda una intención. Trabajamos con madera, metal y cera para
            crear piezas que parecen rescatadas de una biblioteca olvidada:
            ásperas al tacto, precisas en su forma.
          </p>
        </div>
      </section>

      <div className="container">
        <RoughDivider label="Capítulo II · Piezas Destacadas" />
      </div>

      {/* ---- Piezas destacadas (desde Supabase, marcadas en el admin) ---- */}
      <section className="section">
        <div className="container">
          <p className="eyebrow">Del bazar</p>
          <h2 className="zz-section-title">Piezas destacadas</h2>

          {estado === "cargando" && <p className="zz-bazar__status">Invocando piezas…</p>}

          {estado === "error" && (
            <p className="zz-bazar__status">No pudimos cargar las piezas destacadas.</p>
          )}

          {estado === "listo" && piezas.length === 0 && (
            <p className="zz-bazar__status">
              Aún no marcaste ninguna pieza como destacada — hazlo desde{" "}
              <Link to="/admin/productos">el panel de productos</Link>.
            </p>
          )}

          {estado === "listo" && piezas.length > 0 && (
            <div className="grid grid-3 zz-pieces">
              {piezas.map((p) => (
                <Link to={`/bazar/${p.id}`} className="card zz-pieces__card" key={p.id}>
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="zz-pieces__imagen" />
                  ) : (
                    <div className="zz-piece__mark">
                      <Sigil size={30} />
                    </div>
                  )}
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                </Link>
              ))}
            </div>
          )}

          <div className="zz-pieces__cta">
            <Link to="/bazar" className="btn btn-ghost">Ver todo el bazar →</Link>
          </div>
        </div>
      </section>

      <div className="container">
        <RoughDivider />
      </div>

      {/* ---- CTA de contacto ---- */}
      <section className="section zz-cta">
        <div className="container zz-cta__inner">
          <h2>¿Buscas una pieza a la medida de tu ritual?</h2>
          <p className="lead">Escríbenos y forjamos algo único para ti.</p>
          <Link to="/contacto" className="btn">Invocar contacto</Link>
        </div>
      </section>
    </>
  );
}