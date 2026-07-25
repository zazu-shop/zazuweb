import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import BingoSlot from "../components/sorteos/BingoSlot";
import RuletaMedieval from "../components/sorteos/RuletaMedieval";
import RaffleEditor from "../components/sorteos/RaffleEditor";
import "./sorteos.css";

export default function Sorteos() {
  const [juego, setJuego] = useState("bingo"); // bingo | ruleta
  const [mostrarEditor, setMostrarEditor] = useState(false);
  const [opcionesRuleta, setOpcionesRuleta] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("raffle_items")
      .select("*")
      .eq("category", "roulette")
      .order("position", { ascending: true })
      .then(({ data }) => {
        if (data) setOpcionesRuleta(data);
      });
  }, [refreshKey]);

  return (
    <section className="section container zz-sorteos">
      <p className="eyebrow">Sorteos</p>
      <h1>La rueda y el destino</h1>

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
        {juego === "bingo" ? <BingoSlot /> : <RuletaMedieval opciones={opcionesRuleta} />}
      </div>

      {juego === "ruleta" && (
        <div className="zz-sorteos__editor-toggle">
          <button className="btn btn-ghost" onClick={() => setMostrarEditor((v) => !v)}>
            {mostrarEditor ? "Ocultar lista editable" : "Editar opciones de la ruleta"}
          </button>
        </div>
      )}

      {juego === "ruleta" && mostrarEditor && (
        <RaffleEditor onCambio={() => setRefreshKey((k) => k + 1)} />
      )}
    </section>
  );
}