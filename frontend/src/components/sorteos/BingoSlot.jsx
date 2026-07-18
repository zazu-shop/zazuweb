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
        setHistorial((h) => [`${letraFinal}-${numeroFinal}`, ...h].slice(0, 30));
        setGirando(false);
        sonidos8bit.atrapar();
      }
    }, 90);
  };

  const reiniciar = () => setHistorial([]);

  return (
    <div className="zz-bingo">
      {!listo && (
        <p className="zz-bazar__status">
          Agrega al menos una letra y un número en las listas de abajo para poder girar.
        </p>
      )}

      <div className="zz-bingo__conjunto">
        {/* ---- Gabinete real (imagen) con los carretes superpuestos ---- */}
        <div className={`zz-bingo__gabinete ${girando ? "zz-bingo__gabinete--girando" : ""}`}>
          <img
            src="/sorteos/gabinete-bingo.png"
            alt=""
            className="zz-bingo__imagen"
            aria-hidden="true"
          />

          <p className="zz-bingo__banner-texto">Gira y descubre tu suerte</p>

          <div className="zz-bingo__ventana zz-bingo__ventana--1">
            <span className={girando ? "zz-bingo__carrete--girando" : ""}>{letraActual}</span>
          </div>
          <div className="zz-bingo__ventana zz-bingo__ventana--2">
            <span className={girando ? "zz-bingo__carrete--girando" : ""}>{numeroActual}</span>
          </div>

          <button
            className={`zz-bingo__palanca-zona ${girando ? "zz-bingo__palanca-zona--activa" : ""}`}
            onClick={girar}
            disabled={!listo || girando}
            aria-label="Tirar de la palanca"
          />
        </div>

        <div className="zz-bingo__controles-abajo">
          <button className="btn zz-bingo__boton" onClick={girar} disabled={!listo || girando}>
            {girando ? "Girando…" : "Girar"}
          </button>
        </div>

        {/* ---- Pantalla LCD ámbar con el historial ---- */}
        <div className="zz-bingo__lcd">
          <p className="zz-bingo__lcd-titulo">Cantadas</p>
          <div className="zz-bingo__lcd-pantalla">
            {historial.length === 0 ? (
              <p className="zz-bingo__lcd-vacio">— sin registros aún —</p>
            ) : (
              <ul>
                {historial.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            )}
          </div>
          <button className="btn btn-ghost zz-bingo__reiniciar" onClick={reiniciar} disabled={historial.length === 0}>
            Empezar de nuevo
          </button>
        </div>
      </div>
    </div>
  );
}