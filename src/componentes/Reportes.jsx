import { useEffect, useState } from "react";

export default function Reportes() {
  const [datos, setDatos] = useState([]);
  const [activos, setActivos] = useState([]); // lista de activos para select
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({
    id: null,
    activo_id: "",
    descripcion: "",
    prioridad: "Media",
    estado: "Reportado",
  });

  // Cargar reportes y activos
  useEffect(() => {
    // reportes
    fetch("http://localhost:5000/api/reportes")
      .then((res) => res.json())
      .then((data) => setDatos(data));
    // activos (para select)
    fetch("http://localhost:5000/api/reportes")
      .then((res) => res.json())
      .then((data) => setActivos(data));
  }, []);

  // Abrir form nuevo
  const nuevo = () => {
    setForm({
      id: null,
      activo_id: "",
      descripcion: "",
      prioridad: "Media",
      estado: "Reportado",
    });
    setMostrarForm(true);
  };

  // Editar
  const editar = (activo) => {
    setForm({ ...activo });
    setMostrarForm(true);
  };

  // Guardar (crea o actualiza)
  const guardar = async () => {
    if (!form.activo_id || !form.descripcion)
      return alert("Completa activo y descripción");
    const url = form.id
      ? `http://localhost:5000/api/reportes/${form.id}`
      : "http://localhost:5000/api/reportes";
    const method = form.id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const msg = await res.json();
      alert(msg.error || "Error al guardar");
      return;
    }
    const nueva = await fetch("http://localhost:5000/api/reportes").then((r) =>
      r.json()
    );
    setDatos(nueva);
    setMostrarForm(false);
  };

  // Eliminar
  const borrar = async (id) => {
    if (!window.confirm("¿Confirma eliminar este reporte?")) return;
    const res = await fetch(`http://localhost:5000/api/reportes/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const msg = await res.json();
      alert(msg.error || "Error al borrar");
      return;
    }
    const nueva = await fetch("http://localhost:5000/api/reportes").then((r) =>
      r.json()
    );
    setDatos(nueva);
  };

  return (
    <div className="container mt-4">
      <h2>Reportes de Falla</h2>
      <button className="btn btn-primary mb-3" onClick={nuevo}>
        Nuevo reporte
      </button>

      {mostrarForm && (
        <div className="card mb-3">
          <div className="card-body">
            <h5>{form.id ? "Editar reporte" : "Crear reporte"}</h5>
            <div className="mb-2">
              <label className="form-label">Activo</label>
              <select
                className="form-select"
                value={form.activo_id}
                onChange={(e) =>
                  setForm({ ...form, activo_id: e.target.value })
                }
              >
                <option value="">Seleccione activo</option>
                {activos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombreActivo}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-2">
              <label className="form-label">Descripción</label>
              <textarea
                className="form-control"
                rows="2"
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
              />
            </div>
            <div className="mb-2">
              <label className="form-label">Prioridad</label>
              <select
                className="form-select"
                value={form.prioridad}
                onChange={(e) =>
                  setForm({ ...form, prioridad: e.target.value })
                }
              >
                <option>Baja</option>
                <option>Media</option>
                <option>Alta</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="form-label">Estado</label>
              <select
                className="form-select"
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value })}
              >
                <option>Reportado</option>
                <option>En proceso</option>
                <option>Completado</option>
              </select>
            </div>
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
            <th>Activo</th>
            <th>Descripción</th>
            <th>Prioridad</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {datos.map((activo) => (
            <tr key={activo.id}>
              <td>{activo.id}</td>
              <td>{activo.nombreActivo}</td>
              <td>{activo.descripcion}</td>
              <td>{activo.prioridad}</td>
              <td>{activo.estado}</td>
              <td>{new Date(activo.fecha).toLocaleString()}</td>
              <td className="text-center">
                <button
                  className="btn btn-sm btn-outline-warning me-2"
                  onClick={() => editar(activo)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => borrar(activo.id)}
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
