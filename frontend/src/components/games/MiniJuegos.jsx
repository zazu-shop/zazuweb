import { useState } from "react";
import GatoSaltarin from "./GatoSaltarin";
import AtrapaSigilo from "./AtrapaSigilo";
import { alternarSilencio, estaSilenciado } from "../../lib/sonidos8bit";
import "./minijuegos.css";

export default function MiniJuegos() {
  const [juego, setJuego] = useState("gato");
  const [silencio, setSilencio] = useState(estaSilenciado());

  return (
    <div className="zz-minijuegos">
      <div className="zz-minijuegos__tabs">
        <button
          className={`zz-chip ${juego === "gato" ? "zz-chip--active" : ""}`}
          onClick={() => setJuego("gato")}
        >
          El gato saltarín
        </button>
        <button
          className={`zz-chip ${juego === "sigilo" ? "zz-chip--active" : ""}`}
          onClick={() => setJuego("sigilo")}
        >
          Atrapa el sigilo
        </button>
        <button
          className="zz-chip zz-minijuegos__silencio"
          onClick={() => setSilencio(alternarSilencio())}
          aria-label={silencio ? "Activar sonido" : "Silenciar"}
        >
          {silencio ? "🔇" : "🔊"}
        </button>
      </div>

      {juego === "gato" ? <GatoSaltarin /> : <AtrapaSigilo />}
    </div>
  );
}