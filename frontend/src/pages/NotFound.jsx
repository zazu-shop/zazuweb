import { Link } from "react-router-dom";
import Sigil from "../components/Sigil";
import MiniJuegos from "../components/games/MiniJuegos";

export default function NotFound() {
  return (
    <section
      className="section"
      style={{ textAlign: "center", paddingTop: "6rem", paddingBottom: "4rem" }}
    >
      <div className="container" style={{ display: "grid", gap: "1.5rem", justifyItems: "center" }}>
        <Sigil size={100} />
        <p className="eyebrow">Página no encontrada</p>
        <h1>Este sendero no está trazado en el mapa</h1>
        <Link to="/" className="btn">Volver al inicio</Link>

        <p className="eyebrow" style={{ marginTop: "1.5rem" }}>
          Ya que estás aquí, el gato también se perdió
        </p>
        <MiniJuegos />
      </div>
    </section>
  );
}