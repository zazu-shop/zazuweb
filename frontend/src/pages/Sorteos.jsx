import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import BingoSlot from "../components/sorteos/BingoSlot";
import RuletaMedieval from "../components/sorteos/RuletaMedieval";
import RaffleEditor from "../components/sorteos/RaffleEditor";
import "./sorteos.css";

export default function Sorteos() {
  const [juego, setJuego] = useState("bingo"); // bingo | ruleta
  const [mostrarEditor, setMostrarEditor] = useState(false);
  const [datos, setDatos] = useState({ bingo_letter: [], bingo_number: [], roulette: [] });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("raffle_items")
      .select("*")
      .order("position", { ascending: true })
      .then(({ data }) => {
        if (!data) return;
        setDatos({
          bingo_letter: data.filter((i) => i.category === "bingo_letter"),
          bingo_number: data.filter((i) => i.category === "bingo_number"),
          roulette: data.filter((i) => i.category === "roulette"),
        });
      });
  }, [refreshKey]);

  return (
    <section className="section container zz-sorteos">
      <p className="eyebrow">Sorteos</p>
      <h1>La rueda y el destino</h1>
      <p className="lead zz-sorteos__intro">
        Dos formas de dejar que la suerte elija: el tragamonedas del bingo, o la ruleta de la
        fortuna. Ambas listas son editables por cualquiera, ideales para usar en vivo.
      </p>

      <div className="zz-sorteos__tabs">
        <button
          className={`zz-chip ${juego === "bingo" ? "zz-chip--active" : ""}`}
          onClick={() => setJuego("bingo")}
        >
          Tragamonedas de Bingo
        </button>
        <button
          className={`zz-chip ${juego === "ruleta" ? "zz-chip--active" : ""}`}
          onClick={() => setJuego("ruleta")}
        >
          Ruleta de la fortuna
        </button>
      </div>

      <div className="zz-sorteos__juego">
        {juego === "bingo" ? (
          <BingoSlot letras={datos.bingo_letter} numeros={datos.bingo_number} />
        ) : (
          <RuletaMedieval opciones={datos.roulette} />
        )}
      </div>

      <div className="zz-sorteos__editor-toggle">
        <button className="btn btn-ghost" onClick={() => setMostrarEditor((v) => !v)}>
          {mostrarEditor ? "Ocultar listas editables" : "Editar letras, números y opciones"}
        </button>
      </div>

      {mostrarEditor && <RaffleEditor onCambio={() => setRefreshKey((k) => k + 1)} />}
    </section>
  );
}