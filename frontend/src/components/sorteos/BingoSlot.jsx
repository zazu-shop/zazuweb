import { useState, useMemo } from "react";
import { sonidos8bit } from "../../lib/sonidos8bit";
import "./bingoSlot.css";

const LETRAS = ["B", "I", "N", "G", "O"];

// El número determina la letra automáticamente, dividiendo el total de
// bolas en 5 franjas iguales (75 → 15 c/u, 90 → 18 c/u).
function letraDelNumero(numero, totalBolas) {
  const porLetra = totalBolas / LETRAS.length;
  const indice = Math.min(LETRAS.length - 1, Math.floor((numero - 1) / porLetra));
  return LETRAS[indice];
}

export default function BingoSlot() {
  const [totalBolas, setTotalBolas] = useState(75);
  const [letraActual, setLetraActual] = useState(LETRAS[0]);
  const [numeroActual, setNumeroActual] = useState(1);
  const [girando, setGirando] = useState(false);
  const [historial, setHistorial] = useState([]); // [{letra, numero}]

  const numerosDisponibles = useMemo(() => {
    const sacados = new Set(historial.map((h) => h.numero));
    const disponibles = [];
    for (let n = 1; n <= totalBolas; n++) {
      if (!sacados.has(n)) disponibles.push(n);
    }
    return disponibles;
  }, [historial, totalBolas]);

  const agotado = numerosDisponibles.length === 0;

  const cambiarTotalBolas = (n) => {
    if (girando) return;
    setTotalBolas(n);
    setHistorial([]);
  };

  const girar = () => {
    if (girando || agotado) return;
    setGirando(true);

    const intervalos = [
      90, 90, 90, 90, 90, 90, 90, 90,
      110, 110, 110, 130, 130, 150, 170,
      200, 240, 290, 350, 420,
    ];

    let i = 0;
    const paso = () => {
      // Durante el giro mostramos combinaciones válidas al azar (de todo
      // el rango), para que la animación también respete la correspondencia.
      const numeroAlAzar = Math.floor(Math.random() * totalBolas) + 1;
      setNumeroActual(numeroAlAzar);
      setLetraActual(letraDelNumero(numeroAlAzar, totalBolas));

      const esUltimo = i === intervalos.length - 1;
      if (!esUltimo) sonidos8bit.punto();

      i++;
      if (i < intervalos.length) {
        setTimeout(paso, intervalos[i]);
      } else {
        // Resultado final: uno de los números que de verdad falta por salir.
        const numeroFinal = numerosDisponibles[Math.floor(Math.random() * numerosDisponibles.length)];
        const letraFinal = letraDelNumero(numeroFinal, totalBolas);
        setNumeroActual(numeroFinal);
        setLetraActual(letraFinal);
        setHistorial((h) => [{ letra: letraFinal, numero: numeroFinal }, ...h]);
        setGirando(false);
        sonidos8bit.atrapar();
      }
    };

    paso();
  };

  const reiniciar = () => setHistorial([]);

  return (
    <div className="zz-bingo">
      <div className="zz-bingo__config">
        <span className="eyebrow">Modo</span>
        <button
          className={`zz-chip ${totalBolas === 75 ? "zz-chip--active" : ""}`}
          onClick={() => cambiarTotalBolas(75)}
          disabled={girando}
        >
          75 bolas
        </button>
        <button
          className={`zz-chip ${totalBolas === 90 ? "zz-chip--active" : ""}`}
          onClick={() => cambiarTotalBolas(90)}
          disabled={girando}
        >
          90 bolas
        </button>
      </div>

      <div className="zz-bingo__conjunto">
        <div className="zz-bingo__columna">
          <div className={`zz-bingo__gabinete ${girando ? "zz-bingo__gabinete--girando" : ""}`}>
            <img src="/sorteos/gabinete-bingo.png" alt="" className="zz-bingo__imagen" aria-hidden="true" />

            <p className="zz-bingo__banner-texto">Gira y descubre tu suerte</p>

            <div className="zz-bingo__ventana zz-bingo__ventana--1">
              <span className={girando ? "zz-bingo__carrete--girando" : ""}>{letraActual}</span>
            </div>
            <div className="zz-bingo__ventana zz-bingo__ventana--2">
              <span className={girando ? "zz-bingo__carrete--girando" : ""}>{numeroActual}</span>
            </div>

            <button
              className="zz-bingo__palanca-zona"
              onClick={girar}
              disabled={agotado || girando}
              aria-label="Tirar de la palanca"
            />
          </div>

          <button className="btn zz-bingo__boton" onClick={girar} disabled={agotado || girando}>
            {girando ? "Girando…" : agotado ? "¡Se acabaron las bolas!" : "Girar"}
          </button>

          <p className="zz-bingo__restantes">
            {numerosDisponibles.length} de {totalBolas} bolas sin cantar
          </p>
        </div>

        {/* ---- Historial, con el estilo del resto del sitio ---- */}
        <div className="zz-bingo__historial">
          <p className="eyebrow">Cantadas</p>
          <div className="zz-bingo__historial-lista">
            {historial.length === 0 ? (
              <p className="zz-bingo__historial-vacio">— sin registros aún —</p>
            ) : (
              historial.map((h, i) => (
                <span key={i} className="zz-bingo__historial-item">{h.letra}-{h.numero}</span>
              ))
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