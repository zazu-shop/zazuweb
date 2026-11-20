import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { obtenerPersonajePorSlug, sumarXp } from "../../lib/bitacoraService";
import { exportarFichaPng, exportarFichaPdf } from "../../lib/fichaExport";
import "./bitacora.css";

// Ruta: /bitacora/personaje/<slug>/exportar?formato=pdf|png
export default function ExportarFicha() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const formato = params.get("formato") === "png" ? "png" : "pdf";

  const [p, setP] = useState(null);
  const [xp, setXp] = useState(0);
  const [estado, setEstado] = useState("cargando"); // cargando | generando | listo | no-existe | error
  const [error, setError] = useState(null);
  const yaCorrio = useRef(false);

  const exportar = async (tipo, personaje, xpActual) => {
    setEstado("generando");
    setError(null);
    try {
      if (tipo === "png") await exportarFichaPng(personaje, xpActual);
      else await exportarFichaPdf(personaje, xpActual);
      setEstado("listo");
    } catch (err) {
      setError(err.message);
      setEstado("error");
    }
  };

  useEffect(() => {
    if (yaCorrio.current) return;
    yaCorrio.current = true;

    obtenerPersonajePorSlug(slug)
      .then((personaje) => {
        if (!personaje) {
          setEstado("no-existe");
          return;
        }
        const xpTotal = sumarXp(personaje.dnd_xp_log);
        setP(personaje);
        setXp(xpTotal);
        exportar(formato, personaje, xpTotal);
      })
      .catch((err) => {
        setError(err.message);
        setEstado("error");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, formato]);

  return (
    <section className="section container" style={{ textAlign: "center", maxWidth: 560 }}>
      <p className="eyebrow">Exportar ficha</p>
      <h1>{p ? p.name : "Ficha de personaje"}</h1>

      {(estado === "cargando" || estado === "generando") && (
        <p className="zz-bazar__status">Preparando tu {formato === "png" ? "imagen Full HD" : "PDF"}…</p>
      )}
      {estado === "listo" && (
        <p className="zz-form__status zz-form__status--ok">✓ Listo. Revisa tus descargas.</p>
      )}
      {estado === "no-existe" && <p className="zz-bazar__status">Este personaje no está disponible.</p>}
      {estado === "error" && (
        <p className="zz-form__status zz-form__status--error">No se pudo generar la ficha: {error}</p>
      )}

      {p && (estado === "listo" || estado === "error") && (
        <div className="zz-bit__acciones" style={{ justifyContent: "center", margin: "var(--space-md) 0" }}>
          <button className="btn" onClick={() => exportar("png", p, xp)}>Descargar imagen Full HD</button>
          <button className="btn btn-ghost" onClick={() => exportar("pdf", p, xp)}>Descargar PDF</button>
        </div>
      )}

      <Link to={slug ? `/bitacora/personaje/${slug}` : "/bitacora"} className="zz-bit__nota">
        ← Volver a la hoja
      </Link>
    </section>
  );
}