// Reglas de D&D 5e / 2024 usadas por la bitácora: modificadores, nivel por experiencia,
// bono de competencia, bonos de salvaciones, habilidades y datos de creación 2024.

export const ABILITIES = [
  { key: "str", label: "Fuerza", abbr: "FUE", col: "str_score" },
  { key: "dex", label: "Destreza", abbr: "DES", col: "dex_score" },
  { key: "con", label: "Constitución", abbr: "CON", col: "con_score" },
  { key: "int", label: "Inteligencia", abbr: "INT", col: "int_score" },
  { key: "wis", label: "Sabiduría", abbr: "SAB", col: "wis_score" },
  { key: "cha", label: "Carisma", abbr: "CAR", col: "cha_score" },
];

export const SKILLS = [
  { key: "acrobatics", label: "Acrobacias", ability: "dex" },
  { key: "animal_handling", label: "Manejo de animales", ability: "wis" },
  { key: "arcana", label: "Arcanos", ability: "int" },
  { key: "athletics", label: "Atletismo", ability: "str" },
  { key: "deception", label: "Engaño", ability: "cha" },
  { key: "history", label: "Historia", ability: "int" },
  { key: "insight", label: "Perspicacia", ability: "wis" },
  { key: "intimidation", label: "Intimidación", ability: "cha" },
  { key: "investigation", label: "Investigación", ability: "int" },
  { key: "medicine", label: "Medicina", ability: "wis" },
  { key: "nature", label: "Naturaleza", ability: "int" },
  { key: "perception", label: "Percepción", ability: "wis" },
  { key: "performance", label: "Rendimiento", ability: "cha" },
  { key: "persuasion", label: "Persuasión", ability: "cha" },
  { key: "religion", label: "Religión", ability: "int" },
  { key: "sleight_of_hand", label: "Juego de manos", ability: "dex" },
  { key: "stealth", label: "Sigilo", ability: "dex" },
  { key: "survival", label: "Supervivencia", ability: "wis" },
];

/* ==========================================================================
   TALENTOS DE ORIGEN (D&D 2024)
   ========================================================================== */
export const TALENTOS_ORIGEN_2024 = {
  alerta: {
    name: "Talento de Origen: Alerta",
    text: "Ganas +Bono de Competencia a la iniciativa y puedes intercambiar tu iniciativa con un aliado al inicio del combate.",
  },
  atacante_salvaje: {
    name: "Talento de Origen: Atacante Salvaje",
    text: "Una vez por turno, al golpear con un arma, tiras el daño dos veces y usas el resultado más alto.",
  },
  duro: {
    name: "Talento de Origen: Duro",
    text: "Tus puntos de vida máximos aumentan en 2 por cada nivel.",
  },
  iniciado_magia_clerigo: {
    name: "Talento de Origen: Iniciado en la Magia (Clérigo)",
    text: "Aprendes 2 trucos y 1 conjuro de nivel 1 de Clérigo.",
  },
  iniciado_magia_mago: {
    name: "Talento de Origen: Iniciado en la Magia (Mago)",
    text: "Aprendes 2 trucos y 1 conjuro de nivel 1 de Mago.",
  },
  iniciado_magia_druida: {
    name: "Talento de Origen: Iniciado en la Magia (Druida)",
    text: "Aprendes 2 trucos y 1 conjuro de nivel 1 de Druida.",
  },
  hábil: {
    name: "Talento de Origen: Hábil",
    text: "Obtienes competencia en 3 habilidades o herramientas a tu elección.",
  },
};

/* ==========================================================================
   ESPECIES D&D 2024 (Con velocidades diferenciadas)
   ========================================================================== */
export const ESPECIES_OPCIONES_2024 = [
  {
    name: "Humano",
    size: "Mediano",
    speed: "30 pies",
    languages: "Común + 1 idioma adicional",
    features: [
      { name: "Ingenioso", text: "Ganas Inspiración Heroica tras cada descanso largo." },
      { name: "Hábil", text: "Competencia en 1 habilidad a elección." },
    ],
  },
  {
    name: "Elfo",
    size: "Mediano",
    speed: "35 pies",
    languages: "Común, Élfico",
    features: [
      { name: "Visión en la Oscuridad", text: "Ves en la penumbra/oscuridad hasta 60 pies." },
      { name: "Sentidos Agudos", text: "Competencia en la habilidad Percepción." },
    ],
  },
  {
    name: "Mediano",
    size: "Pequeño",
    speed: "25 pies",
    languages: "Común, Mediano",
    features: [
      { name: "Afortunado", text: "Al sacar un 1 en d20, puedes volver a tirar el dado." },
      { name: "Valiente", text: "Ventaja en salvaciones contra asustado." },
    ],
  },
  {
    name: "Enano",
    size: "Mediano",
    speed: "30 pies",
    languages: "Común, Enano",
    features: [
      { name: "Visión en la Oscuridad Superior", text: "Ves en la oscuridad hasta 120 pies." },
      { name: "Dureza Enana", text: "+1 PG máximo por nivel." },
    ],
  },
  {
    name: "Gnomo",
    size: "Pequeño",
    speed: "25 pies",
    languages: "Común, Gnomo",
    features: [
      { name: "Astucia Gnómica", text: "Ventaja en salvaciones de INT, SAB y CAR contra magia." },
    ],
  },
  {
    name: "Goliat",
    size: "Mediano",
    speed: "35 pies",
    languages: "Común, Gigante",
    features: [
      { name: "Gran Físico", text: "Cuentas como Grande para capacidad de carga." },
    ],
  },
  {
    name: "Dracónido",
    size: "Mediano",
    speed: "30 pies",
    languages: "Común, Dracónico",
    features: [
      { name: "Arma de Aliento", text: "Exhalas energía elemental (1d10 de daño)." },
    ],
  },
  {
    name: "Orco",
    size: "Mediano",
    speed: "30 pies",
    languages: "Común, Orco",
    features: [
      { name: "Adrenalina", text: "Acción bonus para Destrabarse y ganar PG temporales." },
    ],
  },
];

/* ==========================================================================
   TRASFONDOS D&D 2024
   ========================================================================== */
export const TRASFONDOS_OPCIONES_2024 = [
  {
    name: "Acólito",
    stats_recomendados: { wis: 2, cha: 1 },
    skills: ["insight", "religion"],
    tool_prof: "Herramientas de caligrafía",
    languages: "Común",
    feat: TALENTOS_ORIGEN_2024.iniciado_magia_clerigo,
  },
  {
    name: "Criminal",
    stats_recomendados: { dex: 2, con: 1 },
    skills: ["sleight_of_hand", "stealth"],
    tool_prof: "Herramientas de ladrón, Juego de cartas",
    languages: "Común",
    feat: TALENTOS_ORIGEN_2024.alerta,
  },
  {
    name: "Soldado",
    stats_recomendados: { str: 2, con: 1 },
    skills: ["athletics", "intimidation"],
    tool_prof: "Vehículos terrestres, Juego de cartas",
    languages: "Común",
    feat: TALENTOS_ORIGEN_2024.atacante_salvaje,
  },
  {
    name: "Granjero",
    stats_recomendados: { con: 2, wis: 1 },
    skills: ["animal_handling", "nature"],
    tool_prof: "Herramientas de carpintero",
    languages: "Común",
    feat: TALENTOS_ORIGEN_2024.duro,
  },
  {
    name: "Erudito",
    stats_recomendados: { int: 2, wis: 1 },
    skills: ["arcana", "history"],
    tool_prof: "Herramientas de caligrafía",
    languages: "Común",
    feat: TALENTOS_ORIGEN_2024.hábil,
  },
];

/* ==========================================================================
   CLASES D&D 2024
   ========================================================================== */
export const CLASES_OPCIONES_2024 = [
  {
    name: "Guerrero",
    hit_die: "1d10",
    hp_base: 10,
    primary_stat: "str",
    saves: ["str", "con"],
    armor_prof: "Todas las armaduras, escudos",
    weapon_prof: "Armas simples y marciales",
    weapon_mastery: "3 armas a elección (ej. Espada larga, Espadón, Arco largo)",
    tool_prof: "",
    features: [
      { name: "Segundo Aliento", text: "Como acción bonus, recuperas 1d10 + nivel PG." },
    ],
    starter_attacks: [
      { name: "Espada Larga", range: "Cuerpo a cuerpo", bonus: "+5", damage: "1d8+3", notes: "Versátil (1d10)" },
    ],
    starter_equipment: [
      { name: "Cota de malla (CA 16)", qty: 1 },
      { name: "Escudo (+2 CA)", qty: 1 },
    ],
  },
  {
    name: "Pícaro",
    hit_die: "1d8",
    hp_base: 8,
    primary_stat: "dex",
    saves: ["dex", "int"],
    armor_prof: "Armadura ligera",
    weapon_prof: "Armas simples, armas sutiles",
    weapon_mastery: "2 armas a elección (ej. Daga, Estoque)",
    tool_prof: "Herramientas de ladrón",
    features: [
      { name: "Ataque Furtivo", text: "Haz daño extra (+1d6) si tienes ventaja." },
    ],
    starter_attacks: [
      { name: "Estoque", range: "Cuerpo a cuerpo", bonus: "+5", damage: "1d8+3", notes: "Sutil" },
      { name: "Daga", range: "Cuerpo a cuerpo / 20/60", bonus: "+5", damage: "1d4+3", notes: "Sutil, Arrojadiza" },
    ],
    starter_equipment: [
      { name: "Armadura de cuero (CA 11)", qty: 1 },
      { name: "Herramientas de ladrón", qty: 1 },
    ],
  },
  {
    name: "Mago",
    hit_die: "1d6",
    hp_base: 6,
    primary_stat: "int",
    saves: ["int", "wis"],
    armor_prof: "Ninguna",
    weapon_prof: "Armas simples",
    weapon_mastery: "Ninguna",
    tool_prof: "",
    features: [
      { name: "Libro de Conjuros", text: "Inicias con 6 conjuros de nivel 1." },
    ],
    starter_attacks: [
      { name: "Bastón", range: "Cuerpo a cuerpo", bonus: "+2", damage: "1d6", notes: "Versátil" },
    ],
    starter_equipment: [
      { name: "Libro de conjuros", qty: 1 },
      { name: "Foco arcano", qty: 1 },
    ],
  },
  {
    name: "Clérigo",
    hit_die: "1d8",
    hp_base: 8,
    primary_stat: "wis",
    saves: ["wis", "cha"],
    armor_prof: "Armadura ligera, media y escudos",
    weapon_prof: "Armas simples",
    weapon_mastery: "Ninguna",
    tool_prof: "",
    features: [
      { name: "Lanzamiento de Conjuros", text: "Lanzas conjuros divinos." },
    ],
    starter_attacks: [
      { name: "Maza", range: "Cuerpo a cuerpo", bonus: "+4", damage: "1d6+2", notes: "Simple" },
    ],
    starter_equipment: [
      { name: "Símbolo sagrado", qty: 1 },
      { name: "Escudo (+2 CA)", qty: 1 },
    ],
  },
];

export const CONJUNTO_ESTANDAR = [15, 14, 13, 12, 10, 8];
export const XP_NIVELES = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
  85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000,
];

export const NIVELES_COMPETENCIA = ["Sin competencia", "Competente", "Experto"];
export const MARCAS_COMPETENCIA = ["○", "●", "◆"];

export const PERSONAJE_VACIO = {
  name: "",
  class_name: "",
  species: "",
  background: "",
  alignment: "Neutral",
  size: "Mediano",
  speed: "30 pies",
  portrait_url: "",
  hit_die: "1d8",
  hp_max: 10,
  hp_current: 10,
  ac: 10,
  initiative_bonus: 0,
  str_score: 10,
  dex_score: 10,
  con_score: 10,
  int_score: 10,
  wis_score: 10,
  cha_score: 10,
  saves: [],
  skills: {},
  languages: "Común",
  armor_prof: "",
  weapon_prof: "",
  weapon_mastery: "", // ⚔️ Nuevo campo D&D 2024
  tool_prof: "",
  features: [],
  attacks: [],
  equipment: [],
  cp: 0,
  sp: 0,
  gp: 15,
  notes: "",
  published: true,
};

export const modificador = (puntaje) => Math.floor((Number(puntaje) - 10) / 2);
export const bonusCompetencia = (nivel) => Math.ceil(nivel / 4) + 1;
export const conSigno = (n) => (n >= 0 ? `+${n}` : `${n}`);

export function nivelPorXp(xp) {
  let nivel = 1;
  for (let i = 0; i < XP_NIVELES.length; i++) {
    if (xp >= XP_NIVELES[i]) nivel = i + 1;
  }
  return nivel;
}

export function progresoXp(xp) {
  const nivel = nivelPorXp(xp);
  const base = XP_NIVELES[nivel - 1];
  const siguiente = XP_NIVELES[nivel] ?? null;
  return {
    nivel,
    siguiente,
    porcentaje: siguiente ? Math.max(0, Math.min(100, ((xp - base) / (siguiente - base)) * 100)) : 100,
  };
}

export function slugify(texto) {
  return (texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function crearSlug(texto) {
  const base = slugify(texto) || "entrada";
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

const abreviatura = (key) => ABILITIES.find((a) => a.key === key)?.abbr || "---";

export function calcularFicha(p, xp) {
  const nivel = nivelPorXp(xp);
  const prof = bonusCompetencia(nivel);
  const mods = {};
  ABILITIES.forEach((a) => {
    mods[a.key] = modificador(p[a.col] ?? 10);
  });

  const salvaciones = ABILITIES.map((a) => {
    const competente = (p.saves || []).includes(a.key);
    return { ...a, competente, bonus: mods[a.key] + (competente ? prof : 0) };
  });

  const habilidades = SKILLS.map((s) => {
    const nivelComp = Number(p.skills?.[s.key] || 0);
    return { ...s, abbr: abreviatura(s.ability), nivelComp, bonus: mods[s.ability] + nivelComp * prof };
  });

  const getBonusHabilidad = (key) => habilidades.find((h) => h.key === key)?.bonus || 0;

  // D&D 2024: Si tiene el Talento de Origen "Alerta", suma el Bono de Competencia a la Iniciativa
  const tieneTalentoAlerta = (p.features || []).some((f) =>
    (f.name || "").toLowerCase().includes("alerta")
  );
  const bonoAlerta = tieneTalentoAlerta ? prof : 0;

  return {
    nivel,
    prof,
    mods,
    salvaciones,
    habilidades,
    // Puntuaciones Pasivas (D&D 2024)
    percepcionPasiva: 10 + getBonusHabilidad("perception"),
    perspicaciaPasiva: 10 + getBonusHabilidad("insight"),
    investigacionPasiva: 10 + getBonusHabilidad("investigation"),
    // Iniciativa: DES + Bono manual + Bono de Alerta (+prof)
    iniciativa: mods.dex + Number(p.initiative_bonus || 0) + bonoAlerta,
  };
}

/* ==========================================================================
   FUNCIÓN DE DEDUPLICACIÓN STRICTA Y AUTOCOMPLETADO
   ========================================================================== */
function limpiarHerramientas(tool1, tool2) {
  const items = [];
  const vistos = new Set();

  [tool1, tool2].forEach((cadena) => {
    if (!cadena) return;
    cadena.split(",").forEach((raw) => {
      const item = raw.trim();
      if (!item || item.toLowerCase() === "ninguna") return;
      const key = item.toLowerCase();
      if (!vistos.has(key)) {
        vistos.add(key);
        const formateado = item.charAt(0).toUpperCase() + item.slice(1);
        items.push(formateado);
      }
    });
  });

  return items.join(", ");
}

export function aplicarPlantilla2024(personajeActual, { claseNombre, especieNombre, trasfondoNombre }) {
  let nuevo = { ...personajeActual };

  // 1. Buscar y Aplicar Especie
  const esp = especieNombre ? ESPECIES_OPCIONES_2024.find((e) => e.name === especieNombre) : null;
  if (esp) {
    nuevo.species = esp.name;
    nuevo.size = esp.size;
    nuevo.speed = esp.speed;
    nuevo._esp_languages = esp.languages || "Común";

    const rasgosSinEspecie = (nuevo.features || []).filter((f) => !f.esEspecie);
    const rasgosEspecieNuevos = esp.features.map((f) => ({ ...f, esEspecie: true }));
    nuevo.features = [...rasgosSinEspecie, ...rasgosEspecieNuevos];
  }

  // 2. Buscar y Aplicar Clase
  const cls = claseNombre ? CLASES_OPCIONES_2024.find((c) => c.name === claseNombre) : null;
  if (cls) {
    nuevo.class_name = cls.name;
    nuevo.hit_die = cls.hit_die;
    nuevo.saves = cls.saves || [];
    nuevo.armor_prof = cls.armor_prof || "";
    nuevo.weapon_prof = cls.weapon_prof || "";
    nuevo.weapon_mastery = cls.weapon_mastery || "";
    
    nuevo._cls_tool_prof = cls.tool_prof || "";

    const modCon = modificador(nuevo.con_score);
    nuevo.hp_max = Math.max(1, cls.hp_base + modCon);
    nuevo.hp_current = nuevo.hp_max;

    const rasgosSinClase = (nuevo.features || []).filter((f) => !f.esClase);
    const rasgosClaseNuevos = cls.features.map((f) => ({ ...f, esClase: true }));
    nuevo.features = [...rasgosSinClase, ...rasgosClaseNuevos];

    const ataquesSinClase = (nuevo.attacks || []).filter((a) => !a.esAtaqueInicial);
    const nuevosAtaques = (cls.starter_attacks || []).map((a) => ({ ...a, esAtaqueInicial: true }));
    nuevo.attacks = [...ataquesSinClase, ...nuevosAtaques];

    const equipoSinClase = (nuevo.equipment || []).filter((eq) => !eq.esEquipoInicial);
    const nuevoEquipo = (cls.starter_equipment || []).map((eq) => ({ ...eq, esEquipoInicial: true }));
    nuevo.equipment = [...equipoSinClase, ...nuevoEquipo];
  }

  // 3. Buscar y Aplicar Trasfondo
  const bg = trasfondoNombre ? TRASFONDOS_OPCIONES_2024.find((b) => b.name === trasfondoNombre) : null;
  if (bg) {
    nuevo.background = bg.name;
    nuevo._bg_tool_prof = bg.tool_prof || "";
    nuevo._bg_languages = bg.languages || "";

    if (nuevo._applied_bg_stats) {
      Object.entries(nuevo._applied_bg_stats).forEach(([abilityKey, bonificador]) => {
        const col = ABILITIES.find((a) => a.key === abilityKey)?.col;
        if (col && nuevo[col] !== undefined) {
          nuevo[col] = Math.max(1, Number(nuevo[col]) - bonificador);
        }
      });
    }

    if (bg.stats_recomendados) {
      Object.entries(bg.stats_recomendados).forEach(([abilityKey, bonificador]) => {
        const col = ABILITIES.find((a) => a.key === abilityKey)?.col;
        if (col) {
          nuevo[col] = (Number(nuevo[col]) || 10) + bonificador;
        }
      });
      nuevo._applied_bg_stats = bg.stats_recomendados;
    } else {
      nuevo._applied_bg_stats = null;
    }

    const nuevasSkills = { ...(nuevo.skills || {}) };
    bg.skills.forEach((skillKey) => {
      nuevasSkills[skillKey] = 1;
    });
    nuevo.skills = nuevasSkills;

    const rasgosSinFeat = (nuevo.features || []).filter((f) => !f.esTalentoOrigen);
    if (bg.feat) {
      nuevo.features = [...rasgosSinFeat, { ...bg.feat, esTalentoOrigen: true }];
    }
  }

  // Limpieza estricta de herramientas
  nuevo.tool_prof = limpiarHerramientas(nuevo._cls_tool_prof, nuevo._bg_tool_prof);

  // Unificación de idiomas sin duplicar "Común"
  const idiomasUnicos = new Set();
  [nuevo._esp_languages || nuevo.languages, nuevo._bg_languages].forEach((cadena) => {
    if (!cadena) return;
    cadena.split(",").forEach((lang) => {
      const limpio = lang.trim();
      if (limpio) idiomasUnicos.add(limpio);
    });
  });

  if (idiomasUnicos.size > 0) {
    nuevo.languages = Array.from(idiomasUnicos).join(", ");
  }

  return nuevo;
}

/**
 * Calcula la Clase de Armadura (CA) según la armadura equipada,
 * el modificador de Destreza y si lleva escudo.
 */
export function calcularCAAutomatico(tipoArmadura, modDex, llevaEscudo) {
  let caBase = 10;

  switch (tipoArmadura) {
    case "cuero": // Ligera
      caBase = 11 + modDex;
      break;
    case "cuero_tachonado": // Ligera
      caBase = 12 + modDex;
      break;
    case "cota_escamas": // Media (Máximo +2 de DES)
      caBase = 14 + Math.min(modDex, 2);
      break;
    case "coraza": // Media (Máximo +2 de DES)
      caBase = 15 + Math.min(modDex, 2);
      break;
    case "cota_malla": // Pesada (Fija)
      caBase = 16;
      break;
    case "placas": // Pesada (Fija)
      caBase = 18;
      break;
    default: // Sin armadura
      caBase = 10 + modDex;
      break;
  }

  return caBase + (llevaEscudo ? 2 : 0);
}

// Tabla de costos oficiales de Point Buy (8 a 15)
const COSTO_POINT_BUY = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9
};

/**
 * Calcula el total de puntos consumidos según los 6 atributos actuales
 */
export function calcularPuntosPointBuy(personaje) {
  let totalPuntos = 0;
  
  ABILITIES.forEach((a) => {
    const valor = Number(personaje[a.col]) || 8;
    // Si el valor está dentro del rango válido de compra (8-15) suma su costo
    if (COSTO_POINT_BUY[valor] !== undefined) {
      totalPuntos += COSTO_POINT_BUY[valor];
    }
  });

  return totalPuntos;
}

/**
 * Calcula el valor total en Piezas de Oro y el peso total del monedero
 */
export function calcularRiqueza(personaje) {
  const gp = Number(personaje.gp || 0);
  const sp = Number(personaje.sp || 0);
  const cp = Number(personaje.cp || 0);

  // Conversión oficial: 10 pp = 1 po | 100 pc = 1 po
  const valorTotalEnPo = gp + (sp / 10) + (cp / 100);
  
  // Peso oficial: 50 monedas = 1 lb
  const totalMonedas = gp + sp + cp;
  const pesoMonedasLbs = (totalMonedas / 50).toFixed(1);

  return {
    valorTotalEnPo: valorTotalEnPo.toFixed(2),
    pesoMonedasLbs: Number(pesoMonedasLbs)
  };
}