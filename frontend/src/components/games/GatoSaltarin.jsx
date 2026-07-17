import { useEffect, useRef, useState } from "react";

const ANCHO = 560;
const ALTO = 180;
const SUELO = 150;
const GRAVEDAD = 0.9;
const SALTO = -13;

export default function GatoSaltarin() {
  const canvasRef = useRef(null);
  const estadoRef = useRef(null);
  const [puntaje, setPuntaje] = useState(0);
  const [mejor, setMejor] = useState(() => Number(localStorage.getItem("zazu_mejor_runner") || 0));
  const [jugando, setJugando] = useState(false);
  const [terminado, setTerminado] = useState(false);

  const iniciar = () => {
    estadoRef.current = {
      gatoY: SUELO,
      velocidadY: 0,
      saltando: false,
      obstaculos: [{ x: ANCHO, ancho: 16, alto: 30 }],
      velocidad: 5.5,
      frame: 0,
      puntaje: 0,
    };
    setPuntaje(0);
    setTerminado(false);
    setJugando(true);
  };

  const saltar = () => {
    const s = estadoRef.current;
    if (s && !s.saltando) {
      s.saltando = true;
      s.velocidadY = SALTO;
    }
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        jugando ? saltar() : iniciar();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jugando]);

  useEffect(() => {
    if (!jugando) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;

    const loop = () => {
      const s = estadoRef.current;
      s.frame++;

      // física del salto
      if (s.saltando) {
        s.velocidadY += GRAVEDAD;
        s.gatoY += s.velocidadY;
        if (s.gatoY >= SUELO) {
          s.gatoY = SUELO;
          s.saltando = false;
          s.velocidadY = 0;
        }
      }

      // obstáculos
      s.velocidad += 0.002;
      s.obstaculos.forEach((o) => (o.x -= s.velocidad));
      if (s.obstaculos[s.obstaculos.length - 1].x < ANCHO - 220) {
        s.obstaculos.push({ x: ANCHO, ancho: 14 + Math.random() * 10, alto: 24 + Math.random() * 20 });
      }
      s.obstaculos = s.obstaculos.filter((o) => o.x > -30);

      // colisión (gato es un cuadrado de 28x28 en x=40)
      const gatoX = 40, gatoAncho = 28;
      for (const o of s.obstaculos) {
        const colisionX = gatoX + gatoAncho > o.x && gatoX < o.x + o.ancho;
        const colisionY = s.gatoY + 28 > SUELO + 30 - o.alto;
        if (colisionX && colisionY) {
          setJugando(false);
          setTerminado(true);
          const finalScore = Math.floor(s.puntaje);
          if (finalScore > mejor) {
            setMejor(finalScore);
            localStorage.setItem("zazu_mejor_runner", finalScore);
          }
          return;
        }
      }

      s.puntaje += 0.15;
      setPuntaje(Math.floor(s.puntaje));

      // dibujo
      ctx.clearRect(0, 0, ANCHO, ALTO);
      ctx.fillStyle = "#0b0710";
      ctx.fillRect(0, 0, ANCHO, ALTO);
      ctx.strokeStyle = "rgba(201,162,39,0.4)";
      ctx.beginPath();
      ctx.moveTo(0, SUELO + 30);
      ctx.lineTo(ANCHO, SUELO + 30);
      ctx.stroke();

      // gato (cuadro simple con orejas, estilo silueta)
      ctx.fillStyle = "#ece3ce";
      ctx.fillRect(gatoX, s.gatoY, gatoAncho, 28);
      ctx.beginPath();
      ctx.moveTo(gatoX, s.gatoY);
      ctx.lineTo(gatoX + 6, s.gatoY - 8);
      ctx.lineTo(gatoX + 12, s.gatoY);
      ctx.moveTo(gatoX + gatoAncho - 12, s.gatoY);
      ctx.lineTo(gatoX + gatoAncho - 6, s.gatoY - 8);
      ctx.lineTo(gatoX + gatoAncho, s.gatoY);
      ctx.fill();

      // obstáculos (velas)
      ctx.fillStyle = "#c9a227";
      s.obstaculos.forEach((o) => {
        ctx.fillRect(o.x, SUELO + 30 - o.alto, o.ancho, o.alto);
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [jugando, mejor]);

  return (
    <div className="zz-minijuego">
      <canvas
        ref={canvasRef}
        width={ANCHO}
        height={ALTO}
        onClick={() => (jugando ? saltar() : iniciar())}
        className="zz-minijuego__canvas"
      />
      <div className="zz-minijuego__hud">
        <span>Puntaje: {puntaje}</span>
        <span>Mejor: {mejor}</span>
      </div>
      {!jugando && (
        <button className="btn zz-minijuego__btn" onClick={iniciar}>
          {terminado ? "Reintentar" : "Jugar"}
        </button>
      )}
      <p className="zz-minijuego__ayuda">Espacio o clic para saltar las velas.</p>
    </div>
  );
}