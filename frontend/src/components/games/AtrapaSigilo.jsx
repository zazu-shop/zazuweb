import { useEffect, useRef, useState } from "react";
import { sonidos8bit } from "../../lib/sonidos8bit";

const CASILLAS = 9;
const DURACION = 30; // segundos

export default function AtrapaSigilo() {
  const [activa, setActiva] = useState(null);
  const [puntaje, setPuntaje] = useState(0);
  const [mejor, setMejor] = useState(() => Number(localStorage.getItem("zazu_mejor_sigilo") || 0));
  const [tiempo, setTiempo] = useState(DURACION);
  const [jugando, setJugando] = useState(false);
  const intervaloRef = useRef(null);
  const cronometroRef = useRef(null);

  const iniciar = () => {
    setPuntaje(0);
    setTiempo(DURACION);
    setJugando(true);
  };

  useEffect(() => {
    if (!jugando) return;

    intervaloRef.current = setInterval(() => {
      setActiva(Math.floor(Math.random() * CASILLAS));
    }, 750);

    cronometroRef.current = setInterval(() => {
      setTiempo((t) => {
        if (t <= 1) {
          clearInterval(intervaloRef.current);
          clearInterval(cronometroRef.current);
          setJugando(false);
          setActiva(null);
          sonidos8bit.finJuego();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(intervaloRef.current);
      clearInterval(cronometroRef.current);
    };
  }, [jugando]);

  useEffect(() => {
    if (!jugando && tiempo === 0 && puntaje > mejor) {
      setMejor(puntaje);
      localStorage.setItem("zazu_mejor_sigilo", puntaje);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jugando, tiempo]);

  const atrapar = (i) => {
    if (i === activa) {
      sonidos8bit.atrapar();
      setPuntaje((p) => p + 1);
      setActiva(null);
    }
  };

  return (
    <div className="zz-minijuego">
      <div className="zz-minijuego__hud">
        <span>Puntaje: {puntaje}</span>
        <span>Tiempo: {tiempo}s</span>
        <span>Mejor: {mejor}</span>
      </div>

      <div className="zz-sigilo-grid">
        {Array.from({ length: CASILLAS }).map((_, i) => (
          <button
            key={i}
            className={`zz-sigilo-casilla ${activa === i ? "zz-sigilo-casilla--activa" : ""}`}
            onClick={() => atrapar(i)}
            disabled={!jugando}
          >
            {activa === i && "✦"}
          </button>
        ))}
      </div>

      {!jugando && (
        <button className="btn zz-minijuego__btn" onClick={iniciar}>
          {tiempo === 0 ? "Reintentar" : "Jugar"}
        </button>
      )}
      <p className="zz-minijuego__ayuda">Haz clic en el sigilo dorado antes de que se apague.</p>
    </div>
  );
}