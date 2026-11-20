// Generador mínimo de archivos .xlsx (Excel), sin dependencias.
// Un .xlsx es un ZIP con varios XML; aquí se arma el ZIP "sin compresión" a mano.
//
//   crearXlsx([{ nombre, filas, anchos, congelarEncabezado, filtro }]) → Blob
//
// Cada celda de `filas` puede ser un texto, un número, null (vacía) o { v, e } con un estilo:
//   e: "encabezado" | "dinero" | "fechaHora" | "fecha" | "negrita" | "titulo" | "dineroNegrita" | "entero"

const MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const ESTILOS = {
  normal: 0,
  encabezado: 1,
  dinero: 2,
  fechaHora: 3,
  fecha: 4,
  negrita: 5,
  titulo: 6,
  dineroNegrita: 7,
  entero: 8,
};

/* ---------------- fechas de Excel ---------------- */

// Excel guarda las fechas como días desde 1900. 25569 = días entre 1899-12-30 y 1970-01-01.
export function serialFecha(iso) {
  const [y, m, d] = String(iso).slice(0, 10).split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86400000 + 25569;
}

// Fecha y hora tal como se ven en Lima (Excel no maneja zonas horarias).
export function serialFechaHora(valor) {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(valor));
  const get = (tipo) => Number(partes.find((p) => p.type === tipo).value);
  const ms = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return ms / 86400000 + 25569;
}

/* ---------------- XML ---------------- */

const esc = (t) =>
  String(t)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function letraColumna(indice) {
  let n = indice + 1;
  let letras = "";
  while (n > 0) {
    const resto = (n - 1) % 26;
    letras = String.fromCharCode(65 + resto) + letras;
    n = Math.floor((n - 1) / 26);
  }
  return letras;
}

function xmlHoja({ filas, anchos = [], congelarEncabezado = false, filtro = false }, seleccionada) {
  let maxCol = 0;

  const filasXml = filas
    .map((fila, r) => {
      const celdas = fila
        .map((celda, c) => {
          const objeto = celda !== null && typeof celda === "object" && "v" in celda ? celda : { v: celda };
          const { v, e } = objeto;
          if (v === null || v === undefined || v === "") return "";
          maxCol = Math.max(maxCol, c + 1);
          const ref = `${letraColumna(c)}${r + 1}`;
          const s = e ? ` s="${ESTILOS[e]}"` : "";
          if (typeof v === "number" && Number.isFinite(v)) return `<c r="${ref}"${s}><v>${v}</v></c>`;
          return `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${esc(v)}</t></is></c>`;
        })
        .join("");
      return `<row r="${r + 1}">${celdas}</row>`;
    })
    .join("");

  const ultimaCol = Math.max(maxCol, anchos.length, 1);
  const dimension = `A1:${letraColumna(ultimaCol - 1)}${Math.max(filas.length, 1)}`;

  const vista = congelarEncabezado
    ? `<sheetView workbookViewId="0"${seleccionada ? ' tabSelected="1"' : ""}><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/></sheetView>`
    : `<sheetView workbookViewId="0"${seleccionada ? ' tabSelected="1"' : ""}/>`;

  const cols = anchos.length
    ? `<cols>${anchos.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join("")}</cols>`
    : "";

  const autoFiltro = filtro && filas.length > 1 ? `<autoFilter ref="A1:${letraColumna(ultimaCol - 1)}${filas.length}"/>` : "";

  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<dimension ref="${dimension}"/><sheetViews>${vista}</sheetViews><sheetFormatPr defaultRowHeight="15"/>` +
    `${cols}<sheetData>${filasXml}</sheetData>${autoFiltro}</worksheet>`
  );
}

const XML_ESTILOS =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n` +
  `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
  `<numFmts count="3">` +
  `<numFmt numFmtId="164" formatCode="&quot;S/ &quot;#,##0.00"/>` +
  `<numFmt numFmtId="165" formatCode="dd/mm/yyyy hh:mm"/>` +
  `<numFmt numFmtId="166" formatCode="dd/mm/yyyy"/>` +
  `</numFmts>` +
  `<fonts count="4">` +
  `<font><sz val="11"/><name val="Calibri"/></font>` +
  `<font><b/><sz val="11"/><name val="Calibri"/></font>` +
  `<font><b/><sz val="11"/><color rgb="FF0B0710"/><name val="Calibri"/></font>` +
  `<font><b/><sz val="14"/><name val="Calibri"/></font>` +
  `</fonts>` +
  `<fills count="3">` +
  `<fill><patternFill patternType="none"/></fill>` +
  `<fill><patternFill patternType="gray125"/></fill>` +
  `<fill><patternFill patternType="solid"><fgColor rgb="FFE8C468"/><bgColor indexed="64"/></patternFill></fill>` +
  `</fills>` +
  `<borders count="2">` +
  `<border><left/><right/><top/><bottom/><diagonal/></border>` +
  `<border><left/><right/><top/><bottom style="thin"><color rgb="FFC9A227"/></bottom><diagonal/></border>` +
  `</borders>` +
  `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
  `<cellXfs count="9">` +
  `<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>` +
  `<xf numFmtId="0" fontId="2" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>` +
  `<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>` +
  `<xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>` +
  `<xf numFmtId="166" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>` +
  `<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>` +
  `<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1"/>` +
  `<xf numFmtId="164" fontId="1" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1"/>` +
  `<xf numFmtId="1" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>` +
  `</cellXfs>` +
  `<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>` +
  `</styleSheet>`;

// Los nombres de hoja no admiten  \ / ? * [ ] :  y tienen un máximo de 31 caracteres.
const nombreHoja = (n, i) => String(n || `Hoja ${i + 1}`).replace(/[\\/?*[\]:]/g, " ").trim().slice(0, 31) || `Hoja ${i + 1}`;

/* ---------------- ZIP sin compresión ---------------- */

const TABLA_CRC = (() => {
  const tabla = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    tabla[n] = c >>> 0;
  }
  return tabla;
})();

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = TABLA_CRC[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function crearZip(archivos) {
  const enc = new TextEncoder();
  const locales = [];
  const centrales = [];
  let offset = 0;

  const ahora = new Date();
  const hora = (ahora.getHours() << 11) | (ahora.getMinutes() << 5) | Math.floor(ahora.getSeconds() / 2);
  const fecha = ((ahora.getFullYear() - 1980) << 9) | ((ahora.getMonth() + 1) << 5) | ahora.getDate();

  for (const a of archivos) {
    const nombre = enc.encode(a.nombre);
    const datos = enc.encode(a.contenido);
    const crc = crc32(datos);
    const tam = datos.length;

    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0x0800, true); // nombres en UTF-8
    local.setUint16(8, 0, true); // sin compresión
    local.setUint16(10, hora, true);
    local.setUint16(12, fecha, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, tam, true);
    local.setUint32(22, tam, true);
    local.setUint16(26, nombre.length, true);
    local.setUint16(28, 0, true);
    locales.push(new Uint8Array(local.buffer), nombre, datos);

    const central = new DataView(new ArrayBuffer(46));
    central.setUint32(0, 0x02014b50, true);
    central.setUint16(4, 20, true);
    central.setUint16(6, 20, true);
    central.setUint16(8, 0x0800, true);
    central.setUint16(10, 0, true);
    central.setUint16(12, hora, true);
    central.setUint16(14, fecha, true);
    central.setUint32(16, crc, true);
    central.setUint32(20, tam, true);
    central.setUint32(24, tam, true);
    central.setUint16(28, nombre.length, true);
    central.setUint32(42, offset, true);
    centrales.push(new Uint8Array(central.buffer), nombre);

    offset += 30 + nombre.length + tam;
  }

  const tamCentral = centrales.reduce((s, p) => s + p.length, 0);
  const fin = new DataView(new ArrayBuffer(22));
  fin.setUint32(0, 0x06054b50, true);
  fin.setUint16(8, archivos.length, true);
  fin.setUint16(10, archivos.length, true);
  fin.setUint32(12, tamCentral, true);
  fin.setUint32(16, offset, true);

  return new Blob([...locales, ...centrales, new Uint8Array(fin.buffer)], { type: MIME });
}

/* ---------------- libro completo ---------------- */

export function crearXlsx(hojas) {
  const hojasXml = hojas.map((h, i) => ({ nombre: `xl/worksheets/sheet${i + 1}.xml`, contenido: xmlHoja(h, i === 0) }));

  const tipos =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n` +
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
    `<Default Extension="xml" ContentType="application/xml"/>` +
    `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
    hojas
      .map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`)
      .join("") +
    `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>` +
    `</Types>`;

  const relsRaiz =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
    `</Relationships>`;

  const libro =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n` +
    `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
    `<bookViews><workbookView activeTab="0"/></bookViews><sheets>` +
    hojas.map((h, i) => `<sheet name="${esc(nombreHoja(h.nombre, i))}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("") +
    `</sheets></workbook>`;

  const relsLibro =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    hojas
      .map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`)
      .join("") +
    `<Relationship Id="rId${hojas.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
    `</Relationships>`;

  return crearZip([
    { nombre: "[Content_Types].xml", contenido: tipos },
    { nombre: "_rels/.rels", contenido: relsRaiz },
    { nombre: "xl/workbook.xml", contenido: libro },
    { nombre: "xl/_rels/workbook.xml.rels", contenido: relsLibro },
    { nombre: "xl/styles.xml", contenido: XML_ESTILOS },
    ...hojasXml,
  ]);
}

export function descargarArchivo(blob, nombre) {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}