import { useState } from "react";
import Activos from "./Activos";
import Reportes from "./reportes";
import Usuarios from "./Usuarios";
import Ordenes from "./Ordenes";
import "./dashboard.css";

/* SIDEBAR */
const Sidebar = ({ seccion, setSeccion, user, onLogout }) => (
  <div className="sidebar">
    <h2 className="sidebar-title">MAFIS</h2>

    <button
      className={seccion === "activos" ? "active" : ""}
      onClick={() => setSeccion("activos")}
    >
      Activos
    </button>

    <button
      className={seccion === "reportes" ? "active" : ""}
      onClick={() => setSeccion("reportes")}
    >
      Reportes
    </button>

    {["administrador", "tecnico"].includes(user.rol) && (
      <button
        className={seccion === "ordenes" ? "active" : ""}
        onClick={() => setSeccion("ordenes")}
      >
        Órdenes
      </button>
    )}

    {user.rol === "administrador" && (
      <button
        className={seccion === "usuarios" ? "active" : ""}
        onClick={() => setSeccion("usuarios")}
      >
        Usuarios
      </button>
    )}

    <div className="sidebar-footer">
      <button className="logout" onClick={onLogout}>
        Cerrar sesión
      </button>
    </div>
  </div>
);

/* AREA PRINCIPAL */
const MainArea = ({ seccion }) => {
  switch (seccion) {
    case "activos":
      return <Activos />;
    case "reportes":
      return <Reportes />;
    case "usuarios":
      return <Usuarios />;
    case "ordenes":
      return <Ordenes />;
    default:
      return <Activos />;
  }
};

export default function Dashboard({ user, onLogout }) {
  const [seccion, setSeccion] = useState("activos");

  return (
    <div className="dashboard-container">
      <Sidebar
        seccion={seccion}
        setSeccion={setSeccion}
        user={user}
        onLogout={onLogout}
      />

      <div className="main-content">
        <div className="welcome-box">
          <strong>Bienvenido, {user.nombre}</strong>
          <span>Rol: {user.rol}</span>
        </div>

        <div className="card-content">
          <MainArea seccion={seccion} />
        </div>
      </div>
    </div>
  );
}
