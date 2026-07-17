// Filtro compartido que da el temblor de "tinta dibujada a pulso" a bordes,
// tarjetas y divisores. Vive una sola vez en el DOM (ver App.jsx) y se
// referencia desde CSS con filter: url(#zz-roughen).
export default function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <filter id="zz-roughen" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.04" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}
