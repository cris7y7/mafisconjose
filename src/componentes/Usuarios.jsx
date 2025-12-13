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

  useEffect(() => {
    const cargarUsuarios = async () => {
      const res = await fetch("http://localhost:5000/usuarios");
      const data = await res.json();
      setDatos(data);
    };
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    const res = await fetch("http://localhost:5000/usuarios");
    const data = await res.json();
    setDatos(data);
  };

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

  const editar = (u) => {
    setForm({
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      password: "",
      rol: u.rol,
    });
    setMostrarForm(true);
  };

  const guardar = async () => {
    if (!form.nombre || !form.email || (!form.id && !form.password)) {
      alert("Completa todos los campos");
      return;
    }

    const url = form.id
      ? `http://localhost:5000/usuarios/${form.id}`
      : "http://localhost:5000/usuarios";

    const method = form.id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Error");
      return;
    }

    cargarUsuarios();
    setMostrarForm(false);
  };

  const borrar = async (id) => {
    if (!window.confirm("¿Eliminar usuario?")) return;

    await fetch(`http://localhost:5000/usuarios/${id}`, {
      method: "DELETE",
    });

    cargarUsuarios();
  };

  return (
    <div className="container mt-4">
      <h2>Usuarios</h2>

      <button className="btn btn-primary mb-3 bg-success" onClick={nuevo}>
        Nuevo usuario
      </button>

      {mostrarForm && (
        <div className="card mb-3">
          <div className="card-body">
            <input
              className="form-control mb-2"
              placeholder="Nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
            <input
              className="form-control mb-2"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="form-control mb-2"
              type="password"
              placeholder="Contraseña"
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
            <th>Fecha</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {datos.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.nombre}</td>
              <td>{u.email}</td>
              <td>{u.rol}</td>
              <td>{new Date(u.fecha_registro).toLocaleString()}</td>
              <td>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => editar(u)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => borrar(u.id)}
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
