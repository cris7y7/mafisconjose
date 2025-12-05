import { useState, useEffect } from "react";

export default function Activos() {
  const [datos, setDatos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({
    nombreActivo: "",
    ubicacion: "",
    estado: "Activo",
  });

  // Cargar lista inicial
  const cargarDatos = () => {
    fetch("http://127.0.0.1:5000/activoss")
      .then((res) => res.json())
      .then((data) => setDatos(data));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Crear activo
  const crear = async () => {
    if (!form.nombreActivo || !form.ubicacion)
      return alert("Completa los campos");

    const res = await fetch("http://127.0.0.1:5000/activoss", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) return alert("Error al crear");

    cargarDatos();
    setForm({ nombreActivo: "", ubicacion: "", estado: "Activo" });
    setMostrarForm(false);
  };

  // ---------------------------------------
  // ELIMINAR ACTIVO
  // ---------------------------------------
  const eliminar = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este activo?")) return;

    const res = await fetch(`http://127.0.0.1:5000/activoss/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) return alert("Error al eliminar");

    cargarDatos(); // actualizar tabla
  };

  return (
    <>
      <h2 className="mb-3">Activos</h2>
      <button
        className="btn btn-primary mb-3"
        onClick={() => setMostrarForm(true)}
      >
        Nuevo Activo
      </button>

      {mostrarForm && (
        <div className="card mb-3">
          <div className="card-body">
            <h5>Crear Activo</h5>

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
              placeholder="Ubicacion"
              value={form.ubicacion}
              onChange={(e) =>
                setForm({ ...form, ubicacion: e.target.value })
              }
            />

            <select
              className="form-select mb-2"
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
            >
              <option>Activo</option>
              <option>Inactivo</option>
            </select>

            <button className="btn btn-success btn-sm me-2" onClick={crear}>
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
            <th>Ubicacion</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {datos.map((activo) => (
            <tr key={activo.id}>
              <td>{activo.id}</td>
              <td>{activo.nombreActivo}</td>
              <td>{activo.ubicacion}</td>
              <td>{activo.estado}</td>

              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => eliminar(activo.id)}
                >
                  Eliminar
                </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
