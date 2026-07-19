import RoughDivider from "../components/RoughDivider";
import Reveal from "../components/Reveal";
import "./grimorio.css";

const CAPITULOS = [
  {
    titulo: "El gato que no tenía dueño",
    texto:
      "Cuentan que, mucho antes de que Zazu tuviera nombre, un gato negro de ojos brillantes rondaba los mercados nocturnos de un pueblo sin mapa. No pertenecía a nadie porque, según los viejos, había elegido no pertenecer: dormía sobre grimorios abandonados, robaba velas a medio consumir y observaba a los tallistas trabajar hasta el amanecer. Una noche de tormenta se coló en el taller de una aprendiz de brujería que apenas comenzaba su oficio, y se quedó. Ella le puso un sombrero viejo para protegerlo de la lluvia. El gato jamás se lo quitó.",
  },
  {
    titulo: "El sombrero prestado",
    texto:
      "El sombrero no era cualquier prenda: había pertenecido a una bruja itinerante que lo dejó olvidado tras pasar una sola noche en el pueblo, pagando su hospedaje con una advertencia: 'todo lo que se guarde bajo este sombrero, guardará también un poco de mí'. La aprendiz no le creyó, hasta que empezó a notar que los objetos que tallaba bajo la luz de las velas del gato salían distintos — con una precisión que no recordaba haber tenido, y un peso en las manos que solo se siente cuando algo importa. Así nació la primera pieza de lo que hoy llamamos Zazu.",
  },
  {
    titulo: "El oficio de tallar memoria",
    texto:
      "Con los años, el taller creció, pero la forma de trabajar no cambió: cada amuleto, grimorio o vela se dibuja primero a mano alzada, con el temblor propio de quien no busca la perfección sino la verdad del trazo. No usamos moldes ni líneas perfectamente rectas — cada boceto brusco es intencional, una firma de que ninguna pieza salió de una máquina, sino de una mesa iluminada por poca luz y mucha paciencia.",
  },
  {
    titulo: "El bazar bajo la luna",
    texto:
      "Se dice que en ciertas noches, cuando el pueblo dormía, la aprendiz montaba un pequeño bazar en la plaza vacía: solo una mesa, unas velas y las piezas que había tallado esa semana. No anunciaba nada — quienes debían encontrarlo, lo encontraban. Ese espíritu sigue vivo en cada rincón de esta tienda: no vendemos en masa, mostramos lo que se hizo con intención, para quien sepa reconocerlo.",
  },
  {
    titulo: "El sigilo que nos representa",
    texto:
      "El sombrero de bruja y el gato negro que ves en nuestro logo no son solo un dibujo: son el recuerdo de esa primera noche de tormenta, cuando un oficio y una compañía inesperada se cruzaron y decidieron quedarse. Cada vez que grabamos ese sigilo en una pieza nueva, honramos ese comienzo — la idea de que algo hecho con las manos, con tiempo y con un poco de terquedad, puede durar mucho más que una moda.",
  },
  {
    titulo: "Lo que sigue",
    texto:
      "Hoy Zazu ya no es solo un bazar bajo la luna: es un taller con nombre, un catálogo que crece pieza a pieza, y una comunidad de quienes eligen rodearse de objetos con historia. La tormenta de aquella primera noche ya pasó, pero el gato — dicen — todavía observa desde algún rincón cada vez que se talla algo nuevo.",
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
        <h1>La leyenda del sombrero y el gato</h1>
        <p className="lead zz-grimorio__intro">
          No es solo la historia de una marca — es la leyenda que contamos en el taller cuando
          alguien pregunta de dónde viene nuestro nombre.
        </p>

        {CAPITULOS.map((cap, i) => (
          <div key={cap.titulo}>
            <RoughDivider label={`Capítulo ${i + 1}`} />
            <Reveal>
              <article className="zz-grimorio__cap">
                <h2>{cap.titulo}</h2>
                <p>{cap.texto}</p>
              </article>
            </Reveal>
          </div>
        ))}
      </div>
    </section>
  );
}