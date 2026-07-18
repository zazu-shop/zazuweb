import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext";
import "./cuenta.css";

export default function CuentaLogin() {
  const { login, registrar, session } = useAuth();
  const navigate = useNavigate();
  const [modo, setModo] = useState("login"); // login | registro
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [cargando, setCargando] = useState(false);

  if (session) {
    navigate("/cuenta", { replace: true });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError(null);
    setAviso(null);

    try {
      if (modo === "login") {
        await login(form.email, form.password);
        navigate("/cuenta", { replace: true });
      } else {
        await registrar(form.email, form.password);
        setAviso("Cuenta creada. Si tu proyecto pide confirmación por correo, revisa tu bandeja antes de entrar.");
      }
    } catch (err) {
      setError(err.message || "No se pudo completar la acción.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <section className="section container zz-cuenta">
      <p className="eyebrow">Mi cuenta</p>
      <h1>{modo === "login" ? "Inicia sesión" : "Crea tu cuenta"}</h1>
      <p className="lead zz-cuenta__intro">
        Una cuenta es opcional — sirve para ver todo tu historial de pedidos en un solo lugar.
        Puedes seguir comprando como invitado si prefieres.
      </p>

      <form className="zz-form zz-cuenta__form" onSubmit={handleSubmit}>
        <label>
          Correo
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={6}
          />
        </label>

        <button className="btn" type="submit" disabled={cargando}>
          {cargando ? "Un momento…" : modo === "login" ? "Ingresar" : "Crear cuenta"}
        </button>

        {error && <p className="zz-form__status zz-form__status--error">{error}</p>}
        {aviso && <p className="zz-form__status zz-form__status--ok">{aviso}</p>}
      </form>

      <button className="zz-cuenta__cambiar" onClick={() => setModo(modo === "login" ? "registro" : "login")}>
        {modo === "login" ? "¿No tienes cuenta? Crea una" : "¿Ya tienes cuenta? Inicia sesión"}
      </button>

      <p className="zz-cuenta__seguimiento">
        ¿Compraste como invitado? Usa <Link to="/seguimiento">Seguimiento de pedido</Link> en su lugar.
      </p>
    </section>
  );
}