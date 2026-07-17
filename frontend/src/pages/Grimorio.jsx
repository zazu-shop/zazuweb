import RoughDivider from "../components/RoughDivider";
import "./grimorio.css";

const CAPITULOS = [
  {
    titulo: "El origen",
    texto:
      "Zazu comenzó como el cuaderno de bocetos de un tallador de madera fascinado por los bestiarios medievales y los rituales olvidados de sus abuelos.",
  },
  {
    titulo: "El oficio",
    texto:
      "Cada pieza pasa por boceto, talla y pulido a mano. No usamos moldes: el temblor de la línea es parte del carácter del objeto, no un error a corregir.",
  },
  {
    titulo: "La intención",
    texto:
      "Creemos que un objeto hecho con atención guarda memoria. Por eso cada pieza de Zazu se entrega con la historia de su sigilo.",
  },
];

export default function Grimorio() {
  return (
    <section className="section zz-grimorio">
      <div className="container">
        <div className="zz-grimorio__seal">
          <img src="/logo/icon-original.png" alt="Sello de Zazu Shop" />
        </div>
        <p className="eyebrow">El Grimorio</p>
        <h1>La historia detrás del sigilo</h1>
        <p className="lead zz-grimorio__intro">
          Tres capítulos que explican por qué cada pieza de Zazu se ve como
          si hubiera sido rescatada de un taller del siglo XV.
        </p>

        {CAPITULOS.map((cap, i) => (
          <div key={cap.titulo}>
            <RoughDivider label={`Capítulo ${i + 1}`} />
            <article className="zz-grimorio__cap">
              <h2>{cap.titulo}</h2>
              <p>{cap.texto}</p>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
