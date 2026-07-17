import { useEffect, useRef } from "react";

/**
 * Ráfaga de chispas doradas que cae desde arriba, una sola vez, y luego
 * desaparece sola. Pensado para el momento de "pedido confirmado".
 */
export default function ChispasDoradas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colores = ["#c9a227", "#e8c468", "#ece3ce"];
    const particulas = Array.from({ length: 90 }).map(() => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.5,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 3,
      tam: 2 + Math.random() * 3,
      color: colores[Math.floor(Math.random() * colores.length)],
      vida: 1,
    }));

    let animId;
    const inicio = performance.now();

    const loop = (t) => {
      const transcurrido = t - inicio;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particulas.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02;
        p.vida = Math.max(0, 1 - transcurrido / 2200);

        ctx.globalAlpha = p.vida;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.tam, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      if (transcurrido < 2200) {
        animId = requestAnimationFrame(loop);
      }
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 200,
      }}
      aria-hidden="true"
    />
  );
}