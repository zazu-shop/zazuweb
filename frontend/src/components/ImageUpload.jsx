import { useState } from "react";
import { subirImagen } from "../lib/bitacoraService";
import "./imageUpload.css";

// Subida de una foto a Supabase Storage. Devuelve la URL pública con onChange.
export default function ImageUpload({ value, onChange, userId, etiqueta = "Foto" }) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState(null);

  const elegir = async (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setSubiendo(true);
    setError(null);
    try {
      onChange(await subirImagen(archivo, userId));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubiendo(false);
      e.target.value = "";
    }
  };

  return (
    <div className="zz-subida">
      <div className="zz-subida__vista">
        {value ? <img src={value} alt="" /> : <span>Sin foto</span>}
      </div>
      <div className="zz-subida__controles">
        <label className="btn btn-ghost zz-subida__boton">
          {subiendo ? "Subiendo…" : value ? `Cambiar ${etiqueta.toLowerCase()}` : `Subir ${etiqueta.toLowerCase()}`}
          <input type="file" accept="image/*" onChange={elegir} disabled={subiendo} hidden />
        </label>
        {value && !subiendo && (
          <button type="button" className="zz-admin__eliminar" onClick={() => onChange("")}>
            Quitar
          </button>
        )}
        {error && <p className="zz-form__status zz-form__status--error">{error}</p>}
      </div>
    </div>
  );
}