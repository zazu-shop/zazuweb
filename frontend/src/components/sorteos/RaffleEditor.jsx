import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import "./raffleEditor.css";

const SECCIONES = [
  { categoria: "bingo_letter", titulo: "Letras del bingo", placeholder: "Ej. B" },
  { categoria: "bingo_number", titulo: "Números del bingo", placeholder: "Ej. 42" },
  { categoria: "roulette", titulo: "Opciones de la ruleta", placeholder: "Ej. Cupón 15% de descuento" },
];

export default function RaffleEditor({ onCambio }) {
  const [items, setItems] = useState({ bingo_letter: [], bingo_number: [], roulette: [] });
  const [estado, setEstado] = useState("cargando");
  const [nuevoValor, setNuevoValor] = useState({ bingo_letter: "", bingo_number: "", roulette: "" });

  const cargar = () => {
    setEstado("cargando");
    supabase
      .from("raffle_items")
      .select("*")
      .order("position", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          setEstado("error");
          return;
        }
        setItems({
          bingo_letter: data.filter((i) => i.category === "bingo_letter"),
          bingo_number: data.filter((i) => i.category === "bingo_number"),
          roulette: data.filter((i) => i.category === "roulette"),
        });
        setEstado("listo");
        onCambio?.();
      });
  };

  useEffect(cargar, []);

  const agregar = async (categoria) => {
    const valor = nuevoValor[categoria].trim();
    if (!valor) return;

    const posicionMax = items[categoria].reduce((max, i) => Math.max(max, i.position || 0), 0);

    const { error } = await supabase
      .from("raffle_items")
      .insert([{ category: categoria, value: valor, position: posicionMax + 1 }]);

    if (!error) {
      setNuevoValor({ ...nuevoValor, [categoria]: "" });
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
        Estas listas son públicas: cualquiera que entre a esta página puede agregar o quitar
        elementos. Úsalo en un evento en vivo donde todos participan de la edición.
      </p>

      {estado === "cargando" && <p className="zz-bazar__status">Cargando…</p>}
      {estado === "error" && <p className="zz-bazar__status">No se pudieron cargar las listas.</p>}

      {estado === "listo" && (
        <div className="zz-sorteos-admin__grid">
          {SECCIONES.map((seccion) => (
            <div className="zz-panel" key={seccion.categoria}>
              <h2>{seccion.titulo}</h2>

              <div className="zz-sorteos-admin__agregar">
                <input
                  type="text"
                  placeholder={seccion.placeholder}
                  value={nuevoValor[seccion.categoria]}
                  onChange={(e) => setNuevoValor({ ...nuevoValor, [seccion.categoria]: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), agregar(seccion.categoria))}
                />
                <button className="btn btn-ghost" onClick={() => agregar(seccion.categoria)}>Agregar</button>
              </div>

              <div className="zz-sorteos-admin__lista">
                {items[seccion.categoria].length === 0 && (
                  <p className="zz-bazar__status" style={{ padding: "0.5rem 0" }}>Sin elementos aún.</p>
                )}
                {items[seccion.categoria].map((item) => (
                  <div className="zz-sorteos-admin__item" key={item.id}>
                    <span>{item.value}</span>
                    <button onClick={() => eliminar(item.id)} aria-label="Quitar">✕</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}