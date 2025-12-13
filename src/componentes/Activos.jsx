import { useState, useEffect } from "react";
import { Link } from 'react-router-dom'

export default function Activos() {
  const [datos, setDatos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({
    id: null,
    nombreActivo: "",
    ubicacion: "",
    estado: "Activo",
  });

  // Cargar lista inicial
  const cargarDatos = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/activoss");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setDatos(data);
    } catch (err) {
      console.error("Error cargando activos:", err);
      alert("Error cargando activos. Revisa la consola.");
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const Nuevo = () => {
    setForm({ id: null, nombreActivo: "", ubicacion: "", estado: "Activo" });
    setMostrarForm(true);
  };

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

  // Crear/Actualizar activo
  const guardar = async () => {
    if (!form.nombreActivo || !form.ubicacion)
      return alert("Completa los campos");

    const url = form.id
      ? `http://127.0.0.1:5000/activoss/${form.id}`
      : "http://127.0.0.1:5000/activoss";
    const method = form.id ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreActivo: form.nombreActivo,
          ubicacion: form.ubicacion,
          estado: form.estado,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        console.error("Respuesta no OK:", res.status, text);
        return alert("Error al guardar. Revisa la consola.");
      }

      // recarga la lista desde el servidor para mantener sincronía
      await cargarDatos();

      // limpiar formulario y cerrar
      setForm({ id: null, nombreActivo: "", ubicacion: "", estado: "Activo" });
      setMostrarForm(false);
    } catch (err) {
      console.error("Error guardando activo:", err);
      alert("Error guardando activo. Revisa la consola.");
    }
  };

  // Eliminar
  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar?")) return;
    await fetch(`http://127.0.0.1:5000/activoss/${id}`, { method: "DELETE" });
    await cargarDatos();
  };

  return (
    <>
      <h2 className="mb-3">Activos</h2>
      <button className="btn btn-primary mb-3 bg-success" onClick={Nuevo}>
        Nuevo Activo
      </button>

      {mostrarForm && (
        <div className="card mb-3">
          <div className="card-body">
            <h5>{form.id ? "Editar Activo" : "Crear Activo"}</h5>

            <input
              className="form-control mb-2"
              placeholder="Nombre"
              value={form.nombreActivo}
              onChange={(e) => setForm({ ...form, nombreActivo: e.target.value })}
            />

            <input
              className="form-control mb-2"
              placeholder="Ubicacion"
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
                <button className="btn btn-warning btn-sm me-2" onClick={() => editar(activo)}>Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => eliminar(activo.id)}>Borrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
