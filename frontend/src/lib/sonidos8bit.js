let audioCtx = null;
let silenciado = localStorage.getItem("zazu_juegos_silencio") === "true";

export function alternarSilencio() {
  silenciado = !silenciado;
  localStorage.setItem("zazu_juegos_silencio", String(silenciado));
  return silenciado;
}

export function estaSilenciado() {
  return silenciado;
}

function obtenerContexto() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  // Los navegadores suspenden el audio hasta la primera interacción del
  // usuario; como estos sonidos siempre se disparan por un clic/tecla,
  // esto lo reactiva sin problema.
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

/**
 * Reproduce un tono tipo 8-bits (onda cuadrada) con un pequeño glide de
 * frecuencia opcional, para efectos de salto, punto, error, etc.
 */
function tono({ frecuenciaInicial, frecuenciaFinal = frecuenciaInicial, duracion = 0.1, volumen = 0.08, tipo = "square" }) {
  if (silenciado) return;
  try {
    const ctx = obtenerContexto();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = tipo;
    osc.frequency.setValueAtTime(frecuenciaInicial, ctx.currentTime);
    if (frecuenciaFinal !== frecuenciaInicial) {
      osc.frequency.exponentialRampToValueAtTime(frecuenciaFinal, ctx.currentTime + duracion);
    }

    gain.gain.setValueAtTime(volumen, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duracion);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duracion);
  } catch {
    // Si el navegador bloquea el audio, el juego sigue funcionando sin sonido.
  }
}

export const sonidos8bit = {
  salto: () => tono({ frecuenciaInicial: 300, frecuenciaFinal: 600, duracion: 0.12 }),
  punto: () => tono({ frecuenciaInicial: 700, frecuenciaFinal: 900, duracion: 0.08, volumen: 0.06 }),
  atrapar: () => tono({ frecuenciaInicial: 500, frecuenciaFinal: 1000, duracion: 0.1, volumen: 0.07 }),
  golpe: () => tono({ frecuenciaInicial: 180, frecuenciaFinal: 60, duracion: 0.3, volumen: 0.09 }),
  finJuego: () => tono({ frecuenciaInicial: 220, frecuenciaFinal: 110, duracion: 0.4, volumen: 0.08 }),
};