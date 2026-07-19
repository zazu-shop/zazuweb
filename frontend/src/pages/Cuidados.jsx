import RoughDivider from "../components/RoughDivider";
import Reveal from "../components/Reveal";
import "./cuidados.css";

const MATERIALES = [
  {
    titulo: "Madera",
    icono: "🪵",
    consejos: [
      "Evita la exposición directa y prolongada al sol — puede resecar y decolorar la pieza.",
      "Limpia con un paño seco o ligeramente húmedo, nunca con agua abundante.",
      "Si la pieza lleva acabado en aceite, puedes renovarlo cada varios meses con aceite mineral o de linaza.",
      "No la guardes en ambientes muy húmedos: la madera puede hincharse o deformarse.",
    ],
  },
  {
    titulo: "Latón y metales envejecidos",
    icono: "🗝️",
    consejos: [
      "La pátina envejecida es parte del diseño — no uses limpiametales abrasivos, la aclararían.",
      "Limpia con un paño suave y seco para quitar polvo.",
      "Evita el contacto prolongado con perfumes o alcohol, pueden opacar el acabado.",
      "Guarda en un lugar seco para prevenir oxidación adicional no deseada.",
    ],
  },
  {
    titulo: "Velas",
    icono: "🕯️",
    consejos: [
      "Recorta la mecha a 0.5 cm antes de cada encendido, así arde más parejo.",
      "Deja que la cera se derrita hasta los bordes en la primera quemada, evita el 'túnel'.",
      "No dejes una vela encendida sin supervisión ni cerca de textiles o corrientes de aire.",
      "Guarda lejos de la luz solar directa para que no pierda color ni fragancia.",
    ],
  },
  {
    titulo: "Cuero",
    icono: "🎒",
    consejos: [
      "Aplica una crema o cera para cuero cada pocos meses para mantenerlo flexible.",
      "Evita mojarlo; si se moja, deja secar a temperatura ambiente, nunca con calor directo.",
      "Guarda en un lugar ventilado — el cuero necesita respirar, evita bolsas plásticas cerradas.",
    ],
  },
  {
    titulo: "Papel y grimorios",
    icono: "📖",
    consejos: [
      "Mantén alejado de la humedad directa y de la luz solar prolongada.",
      "Pasa las páginas con cuidado, especialmente si tienen bordes envejecidos a mano.",
      "Guarda en posición vertical o plana, nunca con objetos pesados encima.",
    ],
  },
];

export default function Cuidados() {
  return (
    <section className="section zz-cuidados">
      <div className="container">
        <p className="eyebrow">Guía</p>
        <h1>Cuidados de tu pieza</h1>
        <p className="lead zz-cuidados__intro">
          Cada material pide un trato distinto. Aquí tienes consejos generales para que tu pieza
          de Zazu te dure — si la tuya tiene una recomendación específica, la incluimos en su
          descripción de producto.
        </p>

        <RoughDivider />

        <div className="zz-cuidados__grid">
          {MATERIALES.map((m, i) => (
            <Reveal key={m.titulo} delay={(i % 3) * 100}>
              <div className="zz-panel zz-cuidados__card">
                <p className="zz-cuidados__icono">{m.icono}</p>
                <h2>{m.titulo}</h2>
                <ul>
                  {m.consejos.map((c, j) => (
                    <li key={j}>{c}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="zz-cuidados__nota">
          ¿Tienes dudas sobre una pieza en particular? Escríbenos desde{" "}
          <a href="/contacto">Contacto</a>.
        </p>
      </div>
    </section>
  );
}