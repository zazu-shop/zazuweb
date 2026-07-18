import "./slotMachineFrame.css";

/**
 * Fondo ilustrado del tragamonedas: ráfagas rotando, arco con remaches,
 * gema pulsante en la cima, banner "ZAZU" con contorno tipo cómic vintage,
 * y estrellas titilando abajo. Los carretes reales (HTML) se superponen
 * encima, alineados a la ventana recortada en esta ilustración.
 */
export default function SlotMachineFrame({ girando }) {
  return (
    <svg
      className={`zz-slotframe ${girando ? "zz-slotframe--girando" : ""}`}
      viewBox="0 0 380 460"
      xmlns="http://www.w3.org/2000/svg"
      filter="url(#zz-roughen)"
    >
      <defs>
        <radialGradient id="zz-gema-grad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#c9a9f5" />
          <stop offset="45%" stopColor="var(--zz-purple-2)" />
          <stop offset="100%" stopColor="var(--zz-purple)" />
        </radialGradient>
        <linearGradient id="zz-cabinete-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a1b3d" />
          <stop offset="55%" stopColor="#150f1e" />
          <stop offset="100%" stopColor="#0b0710" />
        </linearGradient>
      </defs>

      {/* ---- Ráfagas giratorias de fondo ---- */}
      <g className="zz-slotframe__rayos" style={{ transformOrigin: "190px 150px" }}>
        {Array.from({ length: 16 }).map((_, i) => (
          <polygon
            key={i}
            points="190,150 205,-40 175,-40"
            fill={i % 2 === 0 ? "rgba(201,162,39,0.10)" : "rgba(124,77,190,0.14)"}
            transform={`rotate(${i * 22.5} 190 150)`}
          />
        ))}
      </g>

      {/* ---- Cuerpo del gabinete ---- */}
      <path
        d="M60 460 V190 Q60 40 190 40 Q320 40 320 190 V460 Z"
        fill="url(#zz-cabinete-grad)"
        stroke="var(--zz-gold)"
        strokeWidth="5"
      />

      {/* Remaches decorativos */}
      {[[75, 200], [305, 200], [75, 440], [305, 440]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="5" fill="var(--zz-gold)" opacity="0.85" />
      ))}

      {/* ---- Gema en la cima, con resplandor pulsante ---- */}
      <circle cx="190" cy="70" r="34" fill="var(--zz-purple)" opacity="0.35">
        <animate attributeName="r" values="30;40;30" dur="2.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.25;0.5;0.25" dur="2.6s" repeatCount="indefinite" />
      </circle>
      <polygon
        points="190,42 216,64 206,98 174,98 164,64"
        fill="url(#zz-gema-grad)"
        stroke="var(--zz-gold-bright)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <polygon points="190,42 216,64 190,72 164,64" fill="rgba(255,255,255,0.25)" />

      {/* ---- Banner ZAZU (estilo cómic, contorno grueso) ---- */}
      <rect x="85" y="118" width="210" height="46" rx="10" fill="var(--zz-void)" stroke="var(--zz-gold)" strokeWidth="4" />
      <text
        x="190"
        y="151"
        textAnchor="middle"
        fontFamily="var(--font-feral)"
        fontSize="30"
        fill="var(--zz-gold-bright)"
        stroke="var(--zz-void)"
        strokeWidth="1.5"
        paintOrder="stroke"
      >
        ZAZU
      </text>

      {/* ---- Marco de la ventana de carretes (los HTML se superponen aquí) ---- */}
      <rect x="70" y="182" width="240" height="150" rx="14" fill="#05030a" stroke="var(--zz-gold)" strokeWidth="4" />

      {/* ---- Estrellas titilando ---- */}
      {[95, 140, 190, 240, 285].map((x, i) => (
        <text
          key={x}
          x={x}
          y="410"
          textAnchor="middle"
          fontSize="18"
          fill="var(--zz-gold)"
        >
          ✦
          <animate
            attributeName="opacity"
            values="0.3;1;0.3"
            dur="1.8s"
            begin={`${i * 0.3}s`}
            repeatCount="indefinite"
          />
        </text>
      ))}

      {/* ---- Banner inferior ---- */}
      <text
        x="190"
        y="445"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="13"
        letterSpacing="3"
        fill="var(--zz-parchment-dim)"
      >
        GIRA Y DESCUBRE TU SUERTE
      </text>
    </svg>
  );
}