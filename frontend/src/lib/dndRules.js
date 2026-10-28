// Reglas de D&D 5e usadas por la bitácora: modificadores, nivel por experiencia,
// bono de competencia y bonos de salvaciones y habilidades.

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

// XP necesaria para alcanzar cada nivel (el nivel 1 empieza en 0).
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
  alignment: "",
  size: "Mediana",
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
  languages: "",
  armor_prof: "",
  weapon_prof: "",
  tool_prof: "",
  features: [],
  attacks: [],
  equipment: [],
  cp: 0,
  sp: 0,
  gp: 0,
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

// El sufijo evita choques entre personas que usan el mismo nombre.
export function crearSlug(texto) {
  const base = slugify(texto) || "entrada";
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

const abreviatura = (key) => ABILITIES.find((a) => a.key === key).abbr;

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

  const percepcion = habilidades.find((h) => h.key === "perception").bonus;

  return {
    nivel,
    prof,
    mods,
    salvaciones,
    habilidades,
    percepcionPasiva: 10 + percepcion,
    iniciativa: mods.dex + Number(p.initiative_bonus || 0),
  };
}