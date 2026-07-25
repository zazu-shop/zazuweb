import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import "./raffleEditor.css";

const CATEGORIA = "roulette";
const PLACEHOLDER = "Ej. Cupón 15% de descuento";

export default function RaffleEditor({ onCambio }) {
  const [items, setItems] = useState([]);
  const [estado, setEstado] = useState("cargando");
  const [nuevoValor, setNuevoValor] = useState("");

  const cargar = () => {
    setEstado("cargando");
    supabase
      .from("raffle_items")
      .select("*")
      .eq("category", CATEGORIA)
      .order("position", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          setEstado("error");
          return;
        }
        setItems(data);
        setEstado("listo");
        onCambio?.();
      });
  };

  useEffect(cargar, []);

  const agregar = async () => {
    const valor = nuevoValor.trim();
    if (!valor) return;

    const posicionMax = items.reduce((max, i) => Math.max(max, i.position || 0), 0);

    const { error } = await supabase
      .from("raffle_items")
      .insert([{ category: CATEGORIA, value: valor, position: posicionMax + 1 }]);

    if (!error) {
      setNuevoValor("");
      cargar();
    }
  };

  const eliminar = async (id) => {
    const { error } = await supabase.from("raffle_items").delete().eq("id", id);
    if (!error) cargar();
  };

  return (
    <div className="zz-raffle-editor">
      <p className="zz-raffle-editor__aviso">
        Esta lista es pública: cualquiera que entre a esta página puede agregar o quitar
        opciones. Úsalo en un evento en vivo donde todos participan de la edición.
      </p>

      {estado === "cargando" && <p className="zz-bazar__status">Cargando…</p>}
      {estado === "error" && <p className="zz-bazar__status">No se pudo cargar la lista.</p>}

      {estado === "listo" && (
        <div className="zz-panel">
          <h2>Opciones de la ruleta</h2>

          <div className="zz-sorteos-admin__agregar">
            <input
              type="text"
              placeholder={PLACEHOLDER}
              value={nuevoValor}
              onChange={(e) => setNuevoValor(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), agregar())}
            />
            <button className="btn btn-ghost" onClick={agregar}>Agregar</button>
          </div>

          <div className="zz-sorteos-admin__lista">
            {items.length === 0 && (
              <p className="zz-bazar__status" style={{ padding: "0.5rem 0" }}>Sin elementos aún.</p>
            )}
            {items.map((item) => (
              <div className="zz-sorteos-admin__item" key={item.id}>
                <span>{item.value}</span>
                <button onClick={() => eliminar(item.id)} aria-label="Quitar">✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}