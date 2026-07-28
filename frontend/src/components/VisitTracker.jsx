import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { registrarVisita } from "../lib/visitTracker";

export default function VisitTracker() {
  const location = useLocation();
  const { session } = useAuth();

  useEffect(() => {
    registrarVisita(location.pathname, session?.user?.id || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return null;
}