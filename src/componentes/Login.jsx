import { useState } from "react";
import "./Login.css";
import logo from "../assets/mafis.jpeg";
import { API_BASE } from "../api";

export default function Login({ onLogin }) {
  const [vista, setVista] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState("solicitante");

  const login = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/login`, {
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

  const register = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/register`, {
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

  const recover = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/recover`, {
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

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-header">
          <img src={logo} alt="MAFIS" />
          <h2>MAFIS</h2>
        </div>

        {vista === "login" && (
          <form onSubmit={login}>
            <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit">Iniciar sesión</button>

            <div className="login-links">
              <span onClick={() => setVista("register")}>Crear cuenta</span>
              <span onClick={() => setVista("recover")}>Olvidé mi contraseña</span>
            </div>
          </form>
        )}

        {vista === "register" && (
          <form onSubmit={register}>
            <input placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <select value={rol} onChange={(e) => setRol(e.target.value)}>
              <option value="solicitante">Solicitante</option>
              <option value="tecnico">Técnico</option>
              <option value="administrador">Administrador</option>
            </select>

            <button type="submit">Crear cuenta</button>
            <div className="login-links">
              <span onClick={() => setVista("login")}>Ya tengo cuenta</span>
            </div>
          </form>
        )}

        {vista === "recover" && (
          <form onSubmit={recover}>
            <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit">Recuperar contraseña</button>
            <div className="login-links">
              <span onClick={() => setVista("login")}>Volver al login</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
