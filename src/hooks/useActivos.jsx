import { useEffect, useState } from "react";
import { apiFetch } from "../api";

function useActivos() {
  const [datos, setDatos] = useState([]);

  useEffect(() => {
    apiFetch("/activos")
      .then((res) => res.json())
      .then((data) => setDatos(data));
  }, []);

  return datos;
}

export default useActivos;
