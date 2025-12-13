import { useState } from "react";

export default function Login({ onLogin }) {
  const [vista, setVista] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState("solicitante");

  // ---------- LOGIN ----------
  const login = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      alert("Credenciales inválidas");
      return;
    }
    const { token, user } = await res.json();
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    onLogin(user);
  };

  // ---------- REGISTRO ----------
  const register = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, password, rol }),
    });
    if (!res.ok) {
      const msg = await res.json();
      alert(msg.error || "Error al registrar");
      return;
    }
    alert("Usuario creado");
    setVista("login");
  };

  // ---------- RECUPERAR ----------
  const recover = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/recover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const msg = await res.json();
      alert(msg.error || "Error al recuperar");
      return;
    }
    alert("Revisa tu bandeja (simulado)");
    setVista("login");
  };

  // Vista actual
  if (vista === "login")
    return (
      <div className="container mt-5" style={{ maxWidth: 400 }}>
        <h2 className="mb-4 text-center">Iniciar sesión</h2>
        <form onSubmit={login} className="card p-4">
          <input
            type="email"
            className="form-control mb-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="form-control mb-3"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary w-100 mb-2">
            Entrar
          </button>
          <div className="text-center">
            <button
              type="button"
              className="btn btn-link btn-sm"
              onClick={() => setVista("register")}
            >
              Crear cuenta
            </button>
            <button
              type="button"
              className="btn btn-link btn-sm"
              onClick={() => setVista("recover")}
            >
              Olvidé mi contraseña
            </button>
          </div>
        </form>
      </div>
    );

  if (vista === "register")
    return (
      <div className="container mt-5" style={{ maxWidth: 400 }}>
        <h2 className="mb-4 text-center">Crear cuenta</h2>
        <form onSubmit={register} className="card p-4">
          <input
            className="form-control mb-2"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <input
            type="email"
            className="form-control mb-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="form-control mb-2"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <select
            className="form-select mb-3"
            value={rol}
            onChange={(e) => setRol(e.target.value)}
          >
            <option value="solicitante">Solicitante</option>
            <option value="tecnico">Técnico</option>
            <option value="administrador">Administrador</option>
          </select>
          <button type="submit" className="btn btn-success w-100 mb-2">
            Crear cuenta
          </button>
          <div className="text-center">
            <button
              type="button"
              className="btn btn-link btn-sm"
              onClick={() => setVista("login")}
            >
              Ya tengo cuenta
            </button>
          </div>
        </form>
      </div>
    );

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h2 className="mb-4 text-center">Recuperar contraseña</h2>
      <form onSubmit={recover} className="card p-4">
        <input
          type="email"
          className="form-control mb-3"
          placeholder="Email de tu cuenta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-warning w-100 mb-2">
          Enviar enlace
        </button>
        <div className="text-center">
          <button
            type="button"
            className="btn btn-link btn-sm"
            onClick={() => setVista("login")}
          >
            Volver al login
          </button>
        </div>
      </form>
    </div>
  );
}
