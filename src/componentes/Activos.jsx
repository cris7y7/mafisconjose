import { useEffect, useState } from "react";

export default function Activos() {
  const [datos, setDatos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({
    id: null,
    nombreActivo: "",
    ubicacion: "",
    estado: "Activo",
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/activos")
      .then((res) => res.json())
      .then((data) => setDatos(data));
  }, []);

  const nuevo = () => {
    setForm({ id: null, nombreActivo: "", ubicacion: "", estado: "Activo" });
    setMostrarForm(true);
  };

  const editar = (item) => {
    setForm({ ...item });
    setMostrarForm(true);
  };

  const guardar = async () => {
    if (!form.nombreActivo || !form.ubicacion)
      return alert("Completa los campos");
    const url = form.id
      ? `http://localhost:5000/api/activos/${form.id}`
      : "http://localhost:5000/api/activos";
    const method = form.id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) return alert("Error al guardar");
    const nueva = await fetch("http://localhost:5000/api/activos").then((r) =>
      r.json()
    );
    setDatos(nueva);
    setMostrarForm(false);
  };

  const borrar = async (id) => {
    if (!window.confirm("¿Confirma eliminar este activo?")) return;
    const res = await fetch(`http://localhost:5000/api/activos/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) return alert("Error al borrar");
    const nueva = await fetch("http://localhost:5000/api/activos").then((r) =>
      r.json()
    );
    setDatos(nueva);
  };

  return (
    <div className="container mt-4">
      <h2>Gestión de Activos</h2>
      <button className="btn btn-primary mb-3" onClick={nuevo}>
        Nuevo activo
      </button>

      {mostrarForm && (
        <div className="card mb-3">
          <div className="card-body">
            <h5>{form.id ? "Editar activo" : "Crear activo"}</h5>
            <input
              className="form-control mb-2"
              placeholder="Nombre"
              value={form.nombreActivo}
              onChange={(e) =>
                setForm({ ...form, nombreActivo: e.target.value })
              }
            />
            <input
              className="form-control mb-2"
              placeholder="Ubicación"
              value={form.ubicacion}
              onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
            />
            <select
              className="form-select mb-2"
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
            >
              <option>Activo</option>
              <option>Inactivo</option>
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
            <th>Ubicación</th>
            <th>Estado</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {datos.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.nombreActivo}</td>
              <td>{item.ubicacion}</td>
              <td>{item.estado}</td>
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
