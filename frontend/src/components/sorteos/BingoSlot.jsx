import { useState, useRef } from "react";
import { sonidos8bit } from "../../lib/sonidos8bit";
import "./bingoSlot.css";

export default function BingoSlot({ letras, numeros }) {
  const [letraActual, setLetraActual] = useState(letras[0]?.value || "?");
  const [numeroActual, setNumeroActual] = useState(numeros[0]?.value || "?");
  const [girando, setGirando] = useState(false);
  const [historial, setHistorial] = useState([]);
  const intervaloRef = useRef(null);

  const listo = letras.length > 0 && numeros.length > 0;

  const girar = () => {
    if (girando || !listo) return;
    setGirando(true);

    let ticks = 0;
    const totalTicks = 18;

    intervaloRef.current = setInterval(() => {
      setLetraActual(letras[Math.floor(Math.random() * letras.length)].value);
      setNumeroActual(numeros[Math.floor(Math.random() * numeros.length)].value);
      sonidos8bit.punto();
      ticks++;

      if (ticks >= totalTicks) {
        clearInterval(intervaloRef.current);
        const letraFinal = letras[Math.floor(Math.random() * letras.length)].value;
        const numeroFinal = numeros[Math.floor(Math.random() * numeros.length)].value;
        setLetraActual(letraFinal);
        setNumeroActual(numeroFinal);
        setHistorial((h) => [`${letraFinal}-${numeroFinal}`, ...h].slice(0, 15));
        setGirando(false);
        sonidos8bit.atrapar();
      }
    }, 90);
  };

  return (
    <div className="zz-bingo">
      {!listo && (
        <p className="zz-bazar__status">
          Agrega al menos una letra y un número en las listas de abajo para poder girar.
        </p>
      )}

      <div className="zz-bingo__maquina">
        <div className={`zz-bingo__carrete ${girando ? "zz-bingo__carrete--girando" : ""}`}>
          {letraActual}
        </div>
        <div className={`zz-bingo__carrete ${girando ? "zz-bingo__carrete--girando" : ""}`}>
          {numeroActual}
        </div>
      </div>

      <button className="btn zz-bingo__boton" onClick={girar} disabled={!listo || girando}>
        {girando ? "Girando…" : "Girar"}
      </button>

      {historial.length > 0 && (
        <div className="zz-bingo__historial">
          <p className="eyebrow">Cantadas en esta sesión</p>
          <div className="zz-bingo__chips">
            {historial.map((h, i) => (
              <span className="zz-chip" key={i}>{h}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}