import Sigil from "../components/Sigil";
import "./instagram.css";

const USUARIO_IG = "shop.zazu";

export default function Instagram() {
  return (
    <section className="section container zz-ig">
      <Sigil size={70} />
      <p className="eyebrow">Síguenos</p>
      <h1>@{USUARIO_IG}</h1>
      <p className="lead zz-ig__intro">
        Ahí compartimos el proceso de cada pieza, adelantos de catálogo y cupones exclusivos
        antes que en cualquier otro lugar.
      </p>

      <a
        className="btn zz-ig__boton"
        href={`https://instagram.com/${shop.zazu}`}
        target="_blank"
        rel="noreferrer"
      >
        Abrir Instagram →
      </a>

      <p className="zz-ig__nota">
        Instagram no permite mostrar el feed en vivo dentro de otros sitios sin un proceso de
        aprobación de Meta — por eso te llevamos directo al perfil real en vez de simular una
        vista previa.
      </p>
    </section>
  );
}