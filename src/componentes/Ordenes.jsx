// src/components/Ordenes.jsx
import { useEffect, useState } from "react";

export default function Ordenes() {
  const [datos, setDatos] = useState([]);
  const [reportesSinOrden, setReportesSinOrden] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({
    id: null,
    reporte_id: "",
    usuario_id: "",
    descripcion: "",
    estado: "Asignada",
  });

  // Cargar órdenes, reportes sin orden y técnicos
  useEffect(() => {
    fetch("http://localhost:5000/api/ordenes")
      .then((res) => res.json())
      .then((data) => setDatos(data));

    fetch("http://localhost:5000/api/ordenes/sin-asignar")
      .then((res) => res.json())
      .then((data) => setReportesSinOrden(data));

    fetch("http://localhost:5000/api/usuarios")
      .then((res) => res.json())
      .then((data) => setTecnicos(data.filter((u) => u.rol === "tecnico")));
  }, []);

  const nuevo = () => {
    setForm({
      id: null,
      reporte_id: "",
      usuario_id: "",
      descripcion: "",
      estado: "Asignada",
    });
    setMostrarForm(true);
  };

  const editar = (item) => {
    setForm({ ...item });
    setMostrarForm(true);
  };

  const guardar = async () => {
    if (!form.reporte_id || !form.usuario_id || !form.descripcion)
      return alert("Completa todos los campos");
    const url = form.id
      ? `http://localhost:5000/api/ordenes/${form.id}`
      : "http://localhost:5000/api/ordenes";
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
    const nueva = await fetch("http://localhost:5000/api/ordenes").then((r) =>
      r.json()
    );
    setDatos(nueva);
    setMostrarForm(false);
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    const res = await fetch(`http://localhost:5000/api/ordenes/${id}/estado`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    if (!res.ok) return alert("Error al cambiar estado");
    const nueva = await fetch("http://localhost:5000/api/ordenes").then((r) =>
      r.json()
    );
    setDatos(nueva);
  };

  const borrar = async (id) => {
    if (!window.confirm("¿Confirma eliminar esta orden?")) return;
    const res = await fetch(`http://localhost:5000/api/ordenes/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const msg = await res.json();
      alert(msg.error || "Error al borrar");
      return;
    }
    const nueva = await fetch("http://localhost:5000/api/ordenes").then((r) =>
      r.json()
    );
    setDatos(nueva);
  };

  return (
    <div className="container mt-4">
      <h2>Órdenes de Trabajo</h2>
      <button className="btn btn-primary mb-3" onClick={nuevo}>
        Nueva orden
      </button>

      {mostrarForm && (
        <div className="card mb-3">
          <div className="card-body">
            <h5>{form.id ? "Editar orden" : "Crear orden"}</h5>

            {/* Reporte con nombreActivo */}
            <div className="mb-2">
              <label className="form-label">Reporte</label>
              <select
                className="form-select"
                value={form.reporte_id}
                onChange={(e) =>
                  setForm({ ...form, reporte_id: Number(e.target.value) })
                }
              >
                <option value="">Seleccione reporte</option>
                {reportesSinOrden.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombreActivo} – {r.descripcion}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <label className="form-label">Técnico</label>
              <select
                className="form-select"
                value={form.usuario_id}
                onChange={(e) =>
                  setForm({ ...form, usuario_id: e.target.value })
                }
              >
                <option value="">Seleccione técnico</option>
                {tecnicos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
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
              <label className="form-label">Estado</label>
              <select
                className="form-select"
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value })}
              >
                <option>Asignada</option>
                <option>En proceso</option>
                <option>Completada</option>
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
            <th>Reporte</th>
            <th>Activo</th>
            <th>Técnico</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {datos.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.reporte_desc}</td>
              <td>{item.nombreActivo}</td>
              <td>{item.usuario_nombre}</td>
              <td>{item.descripcion}</td>
              <td>{item.estado}</td>
              <td>{new Date(item.fecha_creacion).toLocaleString()}</td>
              <td className="text-center">
                {item.estado === "Asignada" && (
                  <button
                    className="btn btn-sm btn-outline-warning me-2"
                    onClick={() => cambiarEstado(item.id, "En proceso")}
                  >
                    Iniciar
                  </button>
                )}
                {item.estado === "En proceso" && (
                  <button
                    className="btn btn-sm btn-outline-success me-2"
                    onClick={() => cambiarEstado(item.id, "Completada")}
                  >
                    Completar
                  </button>
                )}
                {/* Botón Editar */}
                <button
                  className="btn btn-sm btn-outline-primary me-2"
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
