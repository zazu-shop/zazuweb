import { useEffect, useRef, useState } from "react";
import "./reveal.css";

/**
 * Envuelve cualquier contenido y lo anima (fade + slide-up) la primera vez
 * que entra en pantalla al hacer scroll. Se dispara una sola vez — no se
 * repite si vuelves a subir y bajar, para que se sienta intencional y no
 * repetitivo.
 *
 * Uso: <Reveal><div className="card">...</div></Reveal>
 * Con retraso escalonado: <Reveal delay={120}>...</Reveal>
 */
export default function Reveal({ children, delay = 0, className = "", as: Tag = "div" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;

    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true);
          observer.unobserve(nodo);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(nodo);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`zz-reveal ${visible ? "zz-reveal--visible" : ""} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}