import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext";
import "./admin.css";

export default function AdminLogin() {
  const { login, session } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  if (session) {
    navigate("/admin/pedidos", { replace: true });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError(null);
    try {
      await login(form.email, form.password);
      navigate("/admin/pedidos", { replace: true });
    } catch (err) {
      setError("Credenciales incorrectas o cuenta no encontrada.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <section className="section container zz-admin-login">
      <p className="eyebrow">Panel de administración</p>
      <h1>Acceso restringido</h1>

      <form className="zz-form zz-admin-login__form" onSubmit={handleSubmit}>
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
          />
        </label>

        <button className="btn" type="submit" disabled={cargando}>
          {cargando ? "Ingresando…" : "Ingresar"}
        </button>

        {error && <p className="zz-form__status zz-form__status--error">{error}</p>}
      </form>
    </section>
  );
}