import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success">
      <div className="container">
        <span className="navbar-brand">MAFIS</span>

        <div className="navbar-nav">
          <NavLink className="nav-link" to="/">
            Activos
          </NavLink>

          <NavLink className="nav-link" to="/reportes">
            Reportes
          </NavLink>

          <NavLink className="nav-link" to="/usuarios">
            Usuarios
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
