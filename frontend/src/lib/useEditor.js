import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { useAuth } from "./AuthContext";

// Dice si la cuenta con sesión iniciada tiene permiso de editor (o es admin).
export function useEditor() {
  const { session, cargando: cargandoAuth } = useAuth();
  const [esEditor, setEsEditor] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (cargandoAuth) return;
    if (!session || !supabase) {
      setEsEditor(false);
      setCargando(false);
      return;
    }
    setCargando(true);
    supabase.rpc("is_editor").then(({ data }) => {
      setEsEditor(Boolean(data));
      setCargando(false);
    });
  }, [session, cargandoAuth]);

  return { esEditor, cargando: cargando || cargandoAuth, session };
}