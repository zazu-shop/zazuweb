import { progresoXp } from "../lib/dndRules";
import "./xpBar.css";

export default function XpBar({ xp }) {
  const p = progresoXp(xp);
  return (
    <div className="zz-xpbar">
      <div className="zz-xpbar__info">
        <span>Nivel {p.nivel}</span>
        <span>XP {xp}{p.siguiente ? ` / ${p.siguiente}` : " (máx.)"}</span>
      </div>
      <div className="zz-xpbar__pista">
        <div className="zz-xpbar__relleno" style={{ width: `${p.porcentaje}%` }} />
      </div>
    </div>
  );
}