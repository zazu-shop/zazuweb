import { Link } from "react-router-dom";
import Sigil from "../components/Sigil";
import RoughDivider from "../components/RoughDivider";
import "./home.css";

const PIEZAS = [
  {
    titulo: "Amuleto de Cuervo Negro",
    desc: "Tallado en madera de roble ahumado, engastado en latón envejecido.",
  },
  {
    titulo: "Grimorio de Bolsillo",
    desc: "Cubierta en cuero repujado a mano con el sigilo de la casa.",
  },
  {
    titulo: "Vela de Vigilia Púrpura",
    desc: "Cera de soja con resina de mirra, para rituales de introspección.",
  },
];

export default function Home() {
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

      {/* ---- Piezas destacadas ---- */}
      <section className="section">
        <div className="container">
          <p className="eyebrow">Del bazar</p>
          <h2 className="zz-section-title">Piezas destacadas</h2>

          <div className="grid grid-3 zz-pieces">
            {PIEZAS.map((p) => (
              <article className="card" key={p.titulo}>
                <div className="zz-piece__mark">
                  <Sigil size={30} />
                </div>
                <h3>{p.titulo}</h3>
                <p>{p.desc}</p>
              </article>
            ))}
          </div>

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