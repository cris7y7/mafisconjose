import { useEffect, useState } from "react";

export default function Reportes() {
  const API = "http://127.0.0.1:5000";

  const [datos, setDatos] = useState([]);
  const [activos, setActivos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({
    id: null,
    activo_id: "",
    descripcion: "",
    prioridad: "Media",
    estado: "Reportado",
  });

  // Cargar datos
  useEffect(() => {
    fetch(`${API}/reportes_falla`).then((r) => r.json()).then(setDatos);
    fetch(`${API}/activoss`).then((r) => r.json()).then(setActivos);
  }, []);

  // Nuevo reporte
  const nuevo = () => {
    setForm({ id: null, activo_id: "", descripcion: "", prioridad: "Media", estado: "Reportado" });
    setMostrarForm(true);
  };

  // Editar
  const editar = (item) => {
    setForm({
      id: item.id,
      activo_id: item.activo_id,
      descripcion: item.descripcion,
      prioridad: item.prioridad,
      estado: item.estado,
    });
    setMostrarForm(true);
  };

  // Guardar
  const guardar = async () => {
    if (!form.activo_id || !form.descripcion) return alert("Completa activo y descripción");

    const url = form.id ? `${API}/reportes_falla/${form.id}` : `${API}/reportes_falla`;
    const method = form.id ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const nueva = await fetch(`${API}/reportes_falla`).then((r) => r.json());
    setDatos(nueva);
    setMostrarForm(false);
  };

  // Eliminar
  const borrar = async (id) => {
    if (!window.confirm("¿Eliminar?")) return;
    await fetch(`${API}/reportes_falla/${id}`, { method: "DELETE" });
    setDatos(await fetch(`${API}/reportes_falla`).then((r) => r.json()));
  };

  return (
    <div className="container mt-4">
      <h2>Reportes de Falla</h2>
      <button className="btn btn-primary mb-3 bg-success" onClick={nuevo}>Nuevo reporte</button>

      {mostrarForm && (
        <div className="card mb-3">
          <div className="card-body">
            <h5>{form.id ? "Editar reporte" : "Crear reporte"}</h5>

            <label className="form-label">Activo</label>
            <select
              className="form-select mb-2"
              value={form.activo_id}
              onChange={(e) => setForm({ ...form, activo_id: e.target.value })}
            >
              <option value="">Seleccione activo</option>
              {activos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombreActivo}
                </option>
              ))}
            </select>

            <label className="form-label">Descripción</label>
            <textarea
              className="form-control mb-2"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />

            <label className="form-label">Prioridad</label>
            <select
              className="form-select mb-2"
              value={form.prioridad}
              onChange={(e) => setForm({ ...form, prioridad: e.target.value })}
            >
              <option>Baja</option>
              <option>Media</option>
              <option>Alta</option>
            </select>

            <label className="form-label">Estado</label>
            <select
              className="form-select mb-2"
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
            >
              <option>Reportado</option>
              <option>En proceso</option>
              <option>Completado</option>
            </select>

            <button className="btn btn-success btn-sm me-2" onClick={guardar}>Guardar</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setMostrarForm(false)}>Cancelar</button>
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
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {datos.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.nombreActivo}</td>
              <td>{item.descripcion}</td>
              <td>{item.prioridad}</td>
              <td>{item.estado}</td>
              <td>{new Date(item.fecha).toLocaleString()}</td>
              <td>
                <button className="btn btn-warning btn-sm me-2" onClick={() => editar(item)}>Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => borrar(item.id)}>Borrar</button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}
