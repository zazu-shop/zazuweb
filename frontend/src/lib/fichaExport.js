// Exporta la ficha de un personaje en formato A4 Vertical (1240×1754) estilo Pergamino Clásico D&D.
import { ABILITIES, MARCAS_COMPETENCIA, calcularFicha, conSigno, progresoXp, crearSlug } from "./dndRules";

// Dimensiones A4 Vertical
const W = 1240;
const H = 1754;

// Paleta Pergamino Clásico D&D
const C = {
  fondo: "#f5eee1",
  panel: "rgba(255, 252, 245, 0.85)",
  panel2: "#e8dfce",
  borde: "#8c6d3f",
  bordeSuave: "rgba(140, 109, 63, 0.3)",
  oro: "#8c6d3f",
  oroOscuro: "#5c4422",
  texto: "#1f1810",
  tenue: "#574836",
};

const F = {
  nombre: (px) => `${px}px "Pirata One", Georgia, serif`,
  titulo: (px) => `600 ${px}px Cinzel, Georgia, serif`,
  cuerpo: (px) => `${px}px "EB Garamond", Georgia, serif`,
  mono: (px, peso = 400) => `${peso} ${px}px "JetBrains Mono", monospace`,
};

/* ---------------- Utilidades de Dibujo ---------------- */

function trazarRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function caja(ctx, x, y, w, h, { relleno = C.panel, borde = C.bordeSuave, radio = 10 } = {}) {
  trazarRect(ctx, x, y, w, h, radio);
  ctx.fillStyle = relleno;
  ctx.fill();
  ctx.strokeStyle = borde;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function texto(ctx, str, x, y, { fuente, color = C.texto, alinear = "left" } = {}) {
  ctx.font = fuente;
  ctx.fillStyle = color;
  ctx.textAlign = alinear;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(String(str ?? ""), x, y);
}

function envolver(ctx, str, anchoMax) {
  const lineas = [];
  String(str || "").split("\n").forEach((bloque) => {
    const palabras = bloque.split(/\s+/).filter(Boolean);
    if (palabras.length === 0) {
      lineas.push("");
      return;
    }
    let actual = palabras[0];
    for (let i = 1; i < palabras.length; i++) {
      const prueba = `${actual} ${palabras[i]}`;
      if (ctx.measureText(prueba).width <= anchoMax) actual = prueba;
      else {
        lineas.push(actual);
        actual = palabras[i];
      }
    }
    lineas.push(actual);
  });
  return lineas;
}

function recortar(ctx, str, anchoMax) {
  let t = String(str ?? "");
  if (ctx.measureText(t).width <= anchoMax) return t;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > anchoMax) t = t.slice(0, -1);
  return `${t.trimEnd()}…`;
}

function ajustarTamano(ctx, str, fuente, pxMax, pxMin, anchoMax) {
  let px = pxMax;
  ctx.font = fuente(px);
  while (px > pxMin && ctx.measureText(str).width > anchoMax) {
    px -= 2;
    ctx.font = fuente(px);
  }
  return px;
}

// Dibuja un párrafo con salto de línea automático y devuelve la posición "Y" donde terminó
export function parrafo(ctx, str, x, y, anchoMax, altoLinea, maxLineas = Infinity) {
  let lineas = envolver(ctx, str, anchoMax);
  if (lineas.length > maxLineas) {
    lineas = lineas.slice(0, maxLineas);
    lineas[maxLineas - 1] = recortar(ctx, `${lineas[maxLineas - 1]} …`, anchoMax - 4);
  }
  lineas.forEach((l, i) => ctx.fillText(l, x, y + i * altoLinea));
  return y + lineas.length * altoLinea;
}

function fondo(ctx) {
  ctx.fillStyle = C.fondo;
  ctx.fillRect(0, 0, W, H);

  const sombraMarfil = ctx.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 900);
  sombraMarfil.addColorStop(0, "rgba(255, 255, 255, 0.4)");
  sombraMarfil.addColorStop(1, "rgba(180, 150, 110, 0.25)");
  ctx.fillStyle = sombraMarfil;
  ctx.fillRect(0, 0, W, H);

  trazarRect(ctx, 20, 20, W - 40, H - 40, 12);
  ctx.strokeStyle = C.borde;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  trazarRect(ctx, 26, 26, W - 52, H - 52, 10);
  ctx.strokeStyle = C.bordeSuave;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function pie(ctx, p, numero, total) {
  const fecha = new Date().toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" });
  texto(ctx, `${p.name} · Página ${numero} de ${total}`, W / 2, H - 35, {
    fuente: F.mono(14, 600), color: C.tenue, alinear: "center",
  });
  texto(ctx, `Generado el ${fecha}`, 45, H - 35, { fuente: F.mono(13), color: C.tenue });
  texto(ctx, "Zazu Shop · Bitácora D&D", W - 45, H - 35, { fuente: F.mono(13), color: C.tenue, alinear: "right" });
}

function dibujarRetrato(ctx, x, y, size, imagen, nombre) {
  trazarRect(ctx, x, y, size, size, 14);
  if (imagen) {
    ctx.save();
    ctx.clip();
    const escala = Math.max(size / imagen.width, size / imagen.height);
    const w = imagen.width * escala;
    const h = imagen.height * escala;
    ctx.drawImage(imagen, x + (size - w) / 2, y + (size - h) / 2, w, h);
    ctx.restore();
  } else {
    ctx.fillStyle = C.panel2;
    ctx.fill();
    texto(ctx, (nombre || "?").trim().charAt(0).toUpperCase(), x + size / 2, y + size / 2 + 24, {
      fuente: F.nombre(80), color: C.oroOscuro, alinear: "center",
    });
  }
  trazarRect(ctx, x, y, size, size, 14);
  ctx.strokeStyle = C.borde;
  ctx.lineWidth = 2;
  ctx.stroke();
}

/* ---------------- PÁGINA 1: HOJA PRINCIPAL VERTICAL ---------------- */

function dibujarPagina1(ctx, p, xp, ficha, retrato, totalPaginas) {
  fondo(ctx);

  // Cabecera
  dibujarRetrato(ctx, 45, 45, 140, retrato, p.name);
  const x0 = 205;
  const anchoCabecera = 980;

  const pxNombre = ajustarTamano(ctx, p.name || "", F.nombre, 64, 32, anchoCabecera);
  texto(ctx, p.name, x0, 95, { fuente: F.nombre(pxNombre), color: C.oroOscuro });

  const subtitulo = [p.class_name, p.species, p.background, p.alignment].filter(Boolean).join("  ·  ");
  texto(ctx, recortar(ctx, subtitulo, anchoCabecera), x0, 130, { fuente: F.cuerpo(24), color: C.tenue });

  const prog = progresoXp(xp);
  texto(ctx, `NIVEL ${prog.nivel}  ·  XP ${xp}${prog.siguiente ? ` / ${prog.siguiente}` : " (máx.)"}`, x0, 162, {
    fuente: F.mono(16, 600), color: C.oroOscuro,
  });

  trazarRect(ctx, x0, 172, 980, 10, 5);
  ctx.fillStyle = C.panel2;
  ctx.fill();
  if (prog.porcentaje > 0) {
    trazarRect(ctx, x0, 172, Math.max(10, (980 * prog.porcentaje) / 100), 10, 5);
    ctx.fillStyle = C.borde;
    ctx.fill();
  }

  // Cajas de Combate
  const cajas = [
    ["CLASE ARMADURA", String(p.ac ?? 10)],
    ["INICIATIVA", conSigno(ficha.iniciativa)],
    ["PUNTOS DE VIDA", `${p.hp_current}/${p.hp_max}`],
    ["DADO DE GOLPE", p.hit_die || "—"],
    ["COMPETENCIA", conSigno(ficha.prof)],
    ["PERCEPCIÓN PAS.", String(ficha.percepcionPasiva)],
    ["PERSPICACIA PAS.", String(ficha.perspicaciaPasiva)],
    ["INVESTIGACIÓN PAS.", String(ficha.investigacionPasiva)],
  ];

  const gap = 12;
  const anchoCaja = (W - 90 - gap * 3) / 4;
  cajas.forEach(([etiqueta, valor], i) => {
    const fila = Math.floor(i / 4);
    const col = i % 4;
    const x = 45 + col * (anchoCaja + gap);
    const y = 200 + fila * 75;

    caja(ctx, x, y, anchoCaja, 65);
    texto(ctx, etiqueta, x + anchoCaja / 2, y + 22, { fuente: F.mono(11, 600), color: C.tenue, alinear: "center" });
    const px = ajustarTamano(ctx, valor, (n) => F.mono(n, 600), 24, 14, anchoCaja - 10);
    texto(ctx, valor, x + anchoCaja / 2, y + 52, { fuente: F.mono(px, 600), color: C.oroOscuro, alinear: "center" });
  });

  // Atributos Base
  const anchoHab = (W - 90 - gap * 5) / 6;
  ABILITIES.forEach((a, i) => {
    const x = 45 + i * (anchoHab + gap);
    const y = 365;
    caja(ctx, x, y, anchoHab, 110, { borde: C.borde, relleno: "#ffffff" });
    texto(ctx, a.label.toUpperCase(), x + anchoHab / 2, y + 24, { fuente: F.mono(13, 600), color: C.tenue, alinear: "center" });
    texto(ctx, conSigno(ficha.mods[a.key]), x + anchoHab / 2, y + 74, { fuente: F.titulo(42), color: C.texto, alinear: "center" });
    texto(ctx, String(p[a.col]), x + anchoHab / 2, y + 98, { fuente: F.mono(16, 600), color: C.oroOscuro, alinear: "center" });
  });

  const colW1 = 560;
  const colW2 = 560;
  const colX2 = 635;

  // Salvaciones
  caja(ctx, 45, 490, colW1, 230);
  texto(ctx, "TIRADAS DE SALVACIÓN", 65, 522, { fuente: F.titulo(18), color: C.oroOscuro });
  ficha.salvaciones.forEach((s, i) => {
    const y = 555 + i * 27;
    texto(ctx, s.competente ? "●" : "○", 65, y, { fuente: F.cuerpo(20), color: C.borde });
    texto(ctx, conSigno(s.bonus), 125, y, { fuente: F.mono(18, 600), color: C.oroOscuro, alinear: "right" });
    texto(ctx, s.label, 145, y, { fuente: F.cuerpo(20) });
  });

  // Habilidades
  caja(ctx, 45, 735, colW1, 540);
  texto(ctx, "HABILIDADES", 65, 767, { fuente: F.titulo(18), color: C.oroOscuro });
  ficha.habilidades.forEach((h, i) => {
    const y = 798 + i * 25.5;
    texto(ctx, MARCAS_COMPETENCIA[h.nivelComp], 65, y, { fuente: F.cuerpo(19), color: C.borde });
    texto(ctx, conSigno(h.bonus), 135, y, { fuente: F.mono(17, 600), color: C.oroOscuro, alinear: "right" });
    texto(ctx, h.label, 155, y, { fuente: F.cuerpo(19) });
    texto(ctx, h.abbr, 580, y, { fuente: F.mono(12), color: C.tenue, alinear: "right" });
  });

  // Competencias y Dominios
  caja(ctx, 45, 1290, colW1, 410);
  texto(ctx, "COMPETENCIAS Y DOMINIOS", 65, 1322, { fuente: F.titulo(18), color: C.oroOscuro });
  let yComp = 1355;
  [
    ["Idiomas", p.languages],
    ["Armaduras", p.armor_prof],
    ["Armas", p.weapon_prof],
    ["Maestría de Armas", p.weapon_mastery],
    ["Herramientas", p.tool_prof],
  ]
    .filter(([, valor]) => valor && valor.trim())
    .forEach(([etiqueta, valor]) => {
      ctx.font = F.cuerpo(19);
      ctx.fillStyle = C.texto;
      yComp = parrafo(ctx, `${etiqueta}: ${valor}`, 65, yComp, colW1 - 40, 23, 3) + 8;
    });

  // Armas y Ataques
  caja(ctx, colX2, 490, colW2, 330);
  texto(ctx, "ARMAS Y ATAQUES", colX2 + 20, 522, { fuente: F.titulo(18), color: C.oroOscuro });
  
  const colAtaques = [["ARMA", colX2 + 20], ["ALCANCE", colX2 + 210], ["GOLPE", colX2 + 320], ["DAÑO", colX2 + 390]];
  colAtaques.forEach(([t, x]) => texto(ctx, t, x, 552, { fuente: F.mono(12, 600), color: C.tenue }));
  
  const ataques = p.attacks || [];
  ataques.slice(0, 7).forEach((a, i) => {
    const y = 582 + i * 32;
    texto(ctx, recortar(ctx, a.name || "", 180), colX2 + 20, y, { fuente: F.cuerpo(20) });
    texto(ctx, recortar(ctx, a.range || "—", 100), colX2 + 210, y, { fuente: F.mono(14), color: C.tenue });
    texto(ctx, recortar(ctx, a.bonus || "—", 60), colX2 + 320, y, { fuente: F.mono(15, 600), color: C.oroOscuro });
    texto(ctx, recortar(ctx, a.damage || "—", 150), colX2 + 390, y, { fuente: F.mono(14), color: C.texto });
  });
  if (ataques.length === 0) {
    texto(ctx, "Sin armas registradas.", colX2 + 20, 590, { fuente: F.cuerpo(20), color: C.tenue });
  }

  // Rasgos Principales (Incluyendo los autogenerados)
  caja(ctx, colX2, 835, colW2, 865);
  texto(ctx, "RASGOS Y HABILIDADES DE CLASE", colX2 + 20, 867, { fuente: F.titulo(18), color: C.oroOscuro });
  
  const rasgos = p.features || [];
  let yRasgo = 905;
  let rasgosMostrados = 0;

  for (let i = 0; i < rasgos.length; i++) {
    const r = rasgos[i];
    ctx.font = F.cuerpo(18);
    const lineas = envolver(ctx, r.text || "", colW2 - 40);
    const altoBloque = 24 + lineas.length * 22 + 12;

    if (yRasgo + altoBloque > 1650) {
      const restantes = rasgos.length - rasgosMostrados;
      texto(ctx, `… y ${restantes} rasgos más en la Página 2`, colX2 + 20, 1675, { fuente: F.mono(13, 600), color: C.oroOscuro });
      break;
    }

    texto(ctx, recortar(ctx, r.name || "", colW2 - 40), colX2 + 20, yRasgo, { fuente: F.titulo(19), color: C.oroOscuro });
    yRasgo += 22;

    ctx.font = F.cuerpo(18);
    ctx.fillStyle = C.tenue;
    ctx.textAlign = "left";
    lineas.forEach((l) => {
      ctx.fillText(l, colX2 + 20, yRasgo);
      yRasgo += 22;
    });

    yRasgo += 10;
    rasgosMostrados++;
  }

  if (rasgos.length === 0) {
    texto(ctx, "Sin rasgos registrados.", colX2 + 20, 910, { fuente: F.cuerpo(20), color: C.tenue });
  }

  pie(ctx, p, 1, totalPaginas);
}

/* ---------------- PÁGINA 2 ---------------- */

function tienePagina2(p) {
  return (p.features || []).length > 4 || (p.equipment || []).length > 0 || Boolean((p.notes || "").trim());
}

function dibujarPagina2(ctx, p, totalPaginas) {
  fondo(ctx);

  const pxNombre = ajustarTamano(ctx, p.name || "", F.nombre, 48, 28, 900);
  texto(ctx, p.name, 45, 80, { fuente: F.nombre(pxNombre), color: C.oroOscuro });
  texto(ctx, "RASGOS, EQUIPO E HISTORIA", 45, 110, { fuente: F.mono(15, 600), color: C.tenue });

  caja(ctx, 45, 130, 1150, 800);
  texto(ctx, "TODOS LOS RASGOS Y HABILIDADES", 65, 165, { fuente: F.titulo(20), color: C.oroOscuro });

  const colX = [65, 605];
  const colW = 510;
  let col = 0;
  let y = 200;

  for (const r of p.features || []) {
    ctx.font = F.cuerpo(18);
    const lineas = envolver(ctx, r.text || "", colW);
    const alto = 26 + lineas.length * 22 + 14;

    if (y + alto > 900 && col === 0) {
      col = 1;
      y = 200;
    }
    if (y + alto > 900) break;

    texto(ctx, recortar(ctx, r.name || "", colW), colX[col], y, { fuente: F.titulo(19), color: C.oroOscuro });
    ctx.font = F.cuerpo(18);
    ctx.fillStyle = C.tenue;
    ctx.textAlign = "left";
    lineas.forEach((l, i) => ctx.fillText(l, colX[col], y + 24 + i * 22));
    y += alto;
  }

  caja(ctx, 45, 950, 560, 720);
  const pesoTotal = (p.equipment || []).reduce((acc, item) => acc + (Number(item.weight || 0) * Number(item.qty || 1)), 0);
  const limiteCarga = (p.str_score || 10) * 15;

  texto(ctx, "EQUIPO E INVENTARIO", 65, 985, { fuente: F.titulo(18), color: C.oroOscuro });
  if (pesoTotal > 0) {
    texto(ctx, `${pesoTotal} lbs / ${limiteCarga} lbs máx`, 580, 985, { fuente: F.mono(13), color: C.tenue, alinear: "right" });
  }

  const equipo = p.equipment || [];
  equipo.slice(0, 18).forEach((e, i) => {
    const yy = 1020 + i * 28;
    texto(ctx, `×${e.qty || 1}`, 95, yy, { fuente: F.mono(16, 600), color: C.oroOscuro, alinear: "right" });
    const textoItem = `${e.name || ""}${e.weight ? ` (${e.weight * (e.qty || 1)} lbs)` : ""}`;
    texto(ctx, recortar(ctx, textoItem, 450), 110, yy, { fuente: F.cuerpo(19) });
  });

  texto(ctx, `Oro: ${p.gp || 0} po   ·   Plata: ${p.sp || 0} pp   ·   Cobre: ${p.cp || 0} pc`, 65, 1640, {
    fuente: F.mono(15, 600), color: C.oroOscuro,
  });

  caja(ctx, 635, 950, 560, 720);
  texto(ctx, "HISTORIA Y NOTAS", 655, 985, { fuente: F.titulo(18), color: C.oroOscuro });
  if ((p.notes || "").trim()) {
    ctx.font = F.cuerpo(19);
    ctx.fillStyle = C.texto;
    ctx.textAlign = "left";
    parrafo(ctx, p.notes, 655, 1020, 520, 25, 24);
  } else {
    texto(ctx, "Sin notas registradas.", 655, 1020, { fuente: F.cuerpo(20), color: C.tenue });
  }

  pie(ctx, p, 2, totalPaginas);
}

/* ---------------- Render & Exportación ---------------- */

function cargarImagen(url, cors = true) {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new Image();
    if (cors) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

async function prepararFuentes() {
  if (typeof document === "undefined" || !document.fonts) return;
  try {
    await Promise.all([
      document.fonts.load('64px "Pirata One"'),
      document.fonts.load("600 24px Cinzel"),
      document.fonts.load('24px "EB Garamond"'),
      document.fonts.load('600 20px "JetBrains Mono"'),
    ]);
  } catch {
    // Fuentes de respaldo
  }
}

function crearCanvasNavegador() {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  return canvas;
}

export async function renderizarFicha(personaje, xp = 0, opciones = {}) {
  const crearCanvas = opciones.crearCanvas || crearCanvasNavegador;
  const cargar = opciones.cargarImagen || cargarImagen;

  await prepararFuentes();
  const ficha = calcularFicha(personaje, xp);
  const retrato = await cargar(personaje.portrait_url, true);

  const total = tienePagina2(personaje) ? 2 : 1;
  const paginas = [];

  const c1 = crearCanvas();
  dibujarPagina1(c1.getContext("2d"), personaje, xp, ficha, retrato, total);
  paginas.push(c1);

  if (total === 2) {
    const c2 = crearCanvas();
    dibujarPagina2(c2.getContext("2d"), personaje, total);
    paginas.push(c2);
  }

  return paginas;
}

/* ---------------- Generación PDF (A4 Vertical) ---------------- */

export function crearPdf(paginas) {
  const enc = new TextEncoder();
  const partes = [];
  const offsets = [];
  let largo = 0;

  const poner = (dato) => {
    const bytes = typeof dato === "string" ? enc.encode(dato) : dato;
    partes.push(bytes);
    largo += bytes.length;
  };
  const objeto = (n, cuerpo) => {
    offsets[n] = largo;
    poner(`${n} 0 obj\n${cuerpo}\nendobj\n`);
  };

  poner("%PDF-1.4\n");
  objeto(1, "<< /Type /Catalog /Pages 2 0 R >>");
  objeto(2, `<< /Type /Pages /Kids [${paginas.map((_, i) => `${3 + i * 3} 0 R`).join(" ")}] /Count ${paginas.length} >>`);

  paginas.forEach((pg, i) => {
    const nPagina = 3 + i * 3;
    const nContenido = 4 + i * 3;
    const nImagen = 5 + i * 3;
    const ancho = pg.w * 0.75;
    const alto = pg.h * 0.75;

    objeto(
      nPagina,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${ancho} ${alto}] /Resources << /XObject << /Im0 ${nImagen} 0 R >> >> /Contents ${nContenido} 0 R >>`
    );
    const contenido = `q ${ancho} 0 0 ${alto} 0 0 cm /Im0 Do Q`;
    objeto(nContenido, `<< /Length ${contenido.length} >>\nstream\n${contenido}\nendstream`);

    offsets[nImagen] = largo;
    poner(
      `${nImagen} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${pg.w} /Height ${pg.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${pg.jpeg.length} >>\nstream\n`
    );
    poner(pg.jpeg);
    poner("\nendstream\nendobj\n");
  });

  const total = 2 + paginas.length * 3;
  const inicioXref = largo;
  let xref = `xref\n0 ${total + 1}\n0000000000 65535 f \n`;
  for (let n = 1; n <= total; n++) {
    xref += `${String(offsets[n]).padStart(10, "0")} 00000 n \n`;
  }
  poner(xref);
  poner(`trailer\n<< /Size ${total + 1} /Root 1 0 R >>\nstartxref\n${inicioXref}\n%%EOF`);

  return new Blob(partes, { type: "application/pdf" });
}

/* ---------------- Descargas ---------------- */

function aBlob(canvas, tipo) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo generar la imagen"))), tipo);
  });
}

function dataUrlABytes(dataUrl) {
  const base64 = dataUrl.split(",")[1];
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return bytes;
}

function descargarBlob(blob, nombre) {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const nombreBase = (p) => `ficha-${crearSlug(p.name) || "personaje"}`;

export async function exportarFichaPng(personaje, xp = 0) {
  const paginas = await renderizarFicha(personaje, xp);
  const base = nombreBase(personaje);
  for (let i = 0; i < paginas.length; i++) {
    descargarBlob(await aBlob(paginas[i], "image/png"), `${base}${i === 0 ? "" : `-${i + 1}`}.png`);
    if (i < paginas.length - 1) await esperar(400);
  }
  return paginas.length;
}

export async function exportarFichaPdf(personaje, xp = 0) {
  const paginas = await renderizarFicha(personaje, xp);
  const jpegs = paginas.map((c) => ({
    w: c.width,
    h: c.height,
    jpeg: dataUrlABytes(c.toDataURL("image/jpeg", 0.92)),
  }));
  descargarBlob(crearPdf(jpegs), `${nombreBase(personaje)}.pdf`);
  return paginas.length;
}