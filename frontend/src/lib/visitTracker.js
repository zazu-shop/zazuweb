import { supabase } from "./supabaseClient";

function detectarDispositivo(ua) {
  if (/iPad|Tablet(?!.*Mobile)/i.test(ua)) return "Tablet";
  if (/Mobi|Android.*Mobile|iPhone/i.test(ua)) return "Móvil";
  return "Escritorio";
}

function detectarNavegador(ua) {
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return "Chrome";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua) && !/Chrome/.test(ua)) return "Safari";
  return "Otro";
}

function detectarSO(ua) {
  if (/Windows/.test(ua)) return "Windows";
  if (/Mac OS X/.test(ua)) return "macOS";
  if (/Android/.test(ua)) return "Android";
  if (/iPhone|iPad|iOS/.test(ua)) return "iOS";
  if (/Linux/.test(ua)) return "Linux";
  return "Otro";
}

// Geolocalización aproximada por IP, sin necesitar clave ni backend.
// Si el servicio falla (bloqueado, sin internet, etc.), seguimos igual
// registrando el dispositivo/navegador sin ubicación.
async function obtenerUbicacion() {
  try {
    const res = await fetch("https://ipwho.is/");
    const data = await res.json();
    if (!data.success) return {};
    return {
      country: data.country || null,
      city: data.city || null,
      region: data.region || null,
    };
  } catch {
    return {};
  }
}

export async function registrarVisita(pagina, userId = null) {
  if (!supabase) return;

  const ua = navigator.userAgent;
  const ubicacion = await obtenerUbicacion();

  try {
    await supabase.from("site_visits").insert([
      {
        page: pagina,
        user_id: userId,
        device: detectarDispositivo(ua),
        browser: detectarNavegador(ua),
        os: detectarSO(ua),
        referrer: document.referrer || null,
        ...ubicacion,
      },
    ]);
  } catch {
    // Si falla el registro, no interrumpimos la navegación del visitante.
  }
}