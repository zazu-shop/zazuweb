import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { obtenerCronicaPorSlug } from "../../lib/bitacoraService";
import { useAuth } from "../../lib/AuthContext";
import Sigil from "../../components/Sigil";
import { fechaCorta } from "./Bitacora";
import "./bitacora.css";

export default function Cronica() {
  const { slug } = useParams();
  const { session, esAdmin } = useAuth();
  const [c, setC] = useState(null);
  const [estado, setEstado] = useState("cargando"); // cargando | listo | no-existe | error

  useEffect(() => {
    setEstado("cargando");
    obtenerCronicaPorSlug(slug)
      .then((cronica) => {
        if (!cronica) {
          setEstado("no-existe");
          return;
        }
        setC(cronica);
        setEstado("listo");
      })
      .catch(() => setEstado("error"));
  }, [slug]);

  if (estado === "cargando") {
    return (
      <section className="section container">
        <p className="zz-bazar__status">Abriendo la crónica…</p>
      </section>
    );
  }

  if (estado !== "listo") {
    return (
      <section className="section container" style={{ textAlign: "center" }}>
        <p className="eyebrow">Bitácora</p>
        <h1>{estado === "error" ? "No se pudo abrir esta crónica" : "Esta crónica no está disponible"}</h1>
        <Link to="/bitacora" className="btn" style={{ marginTop: "1.5rem" }}>Volver a la bitácora</Link>
      </section>
    );
  }

  const personaje = c.dnd_characters;
  const puedeEditar = Boolean(session && (c.user_id === session.user.id || esAdmin));
  const parrafos = (c.body || "").split(/\n{2,}/).filter((t) => t.trim());

  return (
    <section className="section zz-bit">
      <div className="container">
        <article className="zz-bit__articulo">
          <Link to="/bitacora" className="zz-bit__nota">← Bitácora</Link>
          <p className="eyebrow" style={{ marginTop: "1rem" }}>
            {fechaCorta(c.created_at)}{!c.published && " · borrador"}
          </p>
          <h1>{c.title}</h1>

          {puedeEditar && (
            <div className="zz-bit__acciones">
              <Link to={`/bitacora/editar/cronica/${c.id}`} className="btn btn-ghost">Editar crónica</Link>
            </div>
          )}

          {c.cover_url && <img src={c.cover_url} alt="" className="zz-bit__portada" />}

          <div className="zz-bit__cuerpo">
            {parrafos.map((t, i) => (
              <p key={i}>{t.trim()}</p>
            ))}
          </div>

          {personaje && (
            <Link to={`/bitacora/personaje/${personaje.slug}`} className="zz-bit__enlace-personaje">
              {personaje.portrait_url ? <img src={personaje.portrait_url} alt="" /> : <Sigil size={48} />}
              <div>
                <p className="zz-bit__sub">Bitácora del personaje</p>
                <strong>{personaje.name}</strong>
                <p className="zz-bit__sub">{[personaje.class_name, personaje.species].filter(Boolean).join(" · ")}</p>
              </div>
            </Link>
          )}
        </article>
      </div>
    </section>
  );
}