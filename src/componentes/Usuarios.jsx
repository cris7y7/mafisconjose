// src/components/Usuarios.jsx
import { useEffect, useState } from "react";

export default function Usuarios() {
  const [datos, setDatos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({
    id: null,
    nombre: "",
    email: "",
    password: "",
    rol: "solicitante",
  });

  // Cargar lista
  useEffect(() => {
    fetch("http://localhost:5000/api/usuarios")
      .then((res) => res.json())
      .then((data) => setDatos(data));
  }, []);

  // Abrir form nuevo
  const nuevo = () => {
    setForm({
      id: null,
      nombre: "",
      email: "",
      password: "",
      rol: "solicitante",
    });
    setMostrarForm(true);
  };

  // Editar
  const editar = (item) => {
    setForm({
      ...item,
      password: "", // dejar vacío para que el admin decida si la cambia
    });
    setMostrarForm(true);
  };

  // Guardar (crea o actualiza)
  const guardar = async () => {
    if (!form.nombre || !form.email) return alert("Completa nombre y email");

    // si estamos editando y no tocamos la contraseña, no la enviamos
    const payload = { ...form };
    if (form.id && !form.password) delete payload.password;

    const url = form.id
      ? `http://localhost:5000/api/usuarios/${form.id}`
      : "http://localhost:5000/api/usuarios";
    const method = form.id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const msg = await res.json();
      alert(msg.error || "Error al guardar");
      return;
    }

    const nueva = await fetch("http://localhost:5000/api/usuarios").then((r) =>
      r.json()
    );
    setDatos(nueva);
    setMostrarForm(false);
  };

  // Eliminar
  const borrar = async (id) => {
    if (!window.confirm("¿Confirma eliminar este usuario?")) return;
    const res = await fetch(`http://localhost:5000/api/usuarios/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const msg = await res.json();
      alert(msg.error || "Error al borrar");
      return;
    }
    const nueva = await fetch("http://localhost:5000/api/usuarios").then((r) =>
      r.json()
    );
    setDatos(nueva);
  };

  return (
    <div className="container mt-4">
      <h2>Usuarios</h2>
      <button className="btn btn-primary mb-3" onClick={nuevo}>
        Nuevo usuario
      </button>

      {mostrarForm && (
        <div className="card mb-3">
          <div className="card-body">
            <h5>{form.id ? "Editar usuario" : "Crear usuario"}</h5>
            <input
              className="form-control mb-2"
              placeholder="Nombre completo"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
            <input
              className="form-control mb-2"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="form-control mb-2"
              placeholder="Contraseña"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <select
              className="form-select mb-2"
              value={form.rol}
              onChange={(e) => setForm({ ...form, rol: e.target.value })}
            >
              <option value="solicitante">Solicitante</option>
              <option value="tecnico">Técnico</option>
              <option value="administrador">Administrador</option>
            </select>
            <button className="btn btn-success btn-sm me-2" onClick={guardar}>
              Guardar
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setMostrarForm(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Fecha registro</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {datos.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.nombre}</td>
              <td>{item.email}</td>
              <td>{item.rol}</td>
              <td>{new Date(item.fecha_registro).toLocaleString()}</td>
              <td className="text-center">
                <button
                  className="btn btn-sm btn-outline-warning me-2"
                  onClick={() => editar(item)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => borrar(item.id)}
                >
                  Borrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
