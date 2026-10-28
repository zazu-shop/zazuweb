import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarPersonajes, listarCronicas } from "../../lib/bitacoraService";
import { useEditor } from "../../lib/useEditor";
import XpBar from "../../components/XpBar";
import Sigil from "../../components/Sigil";
import { SkeletonGrid } from "../../components/Skeleton";
import "./bitacora.css";

export function resumen(texto, max = 150) {
  const limpio = (texto || "").replace(/\s+/g, " ").trim();
  return limpio.length > max ? limpio.slice(0, max).trimEnd() + "…" : limpio;
}

export function fechaCorta(iso) {
  return new Date(iso).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" });
}

export default function Bitacora() {
  const { esEditor } = useEditor();
  const [personajes, setPersonajes] = useState([]);
  const [cronicas, setCronicas] = useState([]);
  const [estado, setEstado] = useState("cargando"); // cargando | listo | error

  useEffect(() => {
    Promise.all([listarPersonajes(), listarCronicas()])
      .then(([p, c]) => {
        setPersonajes(p);
        setCronicas(c);
        setEstado("listo");
      })
      .catch((err) => {
        console.error("[Zazu] Error al cargar la bitácora:", err.message);
        setEstado("error");
      });
  }, []);

  return (
    <section className="section zz-bit">
      <div className="container">
        <header className="zz-bit__hero">
          <Sigil size={64} />
          <p className="eyebrow">Bitácora</p>
          <h1>Diario de un novato</h1>
          <p className="lead">
            Crónicas y hojas de personaje de mis primeras partidas de Dungeons &amp; Dragons.
          </p>
          {esEditor && (
            <Link to="/bitacora/editar" className="btn">Escribir y gestionar mi bitácora</Link>
          )}
        </header>

        {estado === "cargando" && <SkeletonGrid cantidad={3} />}
        {estado === "error" && <p className="zz-bazar__status">No se pudo cargar la bitácora.</p>}

        {estado === "listo" && (
          <>
            <div className="zz-bit__seccion">
              <p className="eyebrow">Mis aventureros</p>
              <h2>Personajes</h2>

              {personajes.length === 0 ? (
                <p className="zz-bazar__status">Aún no hay personajes publicados.</p>
              ) : (
                <div className="zz-bit__grid">
                  {personajes.map((p) => (
                    <Link to={`/bitacora/personaje/${p.slug}`} className="zz-bit__card" key={p.id}>
                      <div className="zz-bit__card-retrato">
                        {p.portrait_url ? <img src={p.portrait_url} alt={p.name} loading="lazy" /> : <Sigil size={64} />}
                      </div>
                      <div className="zz-bit__card-cuerpo">
                        <h3>{p.name}</h3>
                        <p className="zz-bit__sub">{[p.class_name, p.species].filter(Boolean).join(" · ")}</p>
                        <XpBar xp={p.xp} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="zz-bit__seccion">
              <p className="eyebrow">Lo que va pasando</p>
              <h2>Crónicas</h2>

              {cronicas.length === 0 ? (
                <p className="zz-bazar__status">Aún no hay crónicas publicadas.</p>
              ) : (
                <div className="zz-bit__posts">
                  {cronicas.map((c) => (
                    <Link
                      to={`/bitacora/cronica/${c.slug}`}
                      className={`zz-bit__post ${c.cover_url ? "" : "zz-bit__post--sin-portada"}`}
                      key={c.id}
                    >
                      {c.cover_url && <img src={c.cover_url} alt="" loading="lazy" />}
                      <div className="zz-bit__post-cuerpo">
                        <p className="zz-bit__sub">
                          {fechaCorta(c.created_at)}
                          {c.dnd_characters && <span className="zz-bit__etiqueta">{c.dnd_characters.name}</span>}
                        </p>
                        <h3>{c.title}</h3>
                        <p>{resumen(c.body)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}