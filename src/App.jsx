import { BrowserRouter, Routes, Route } from "react-router-dom";
import Activos from "./componentes/Activos";
import Reportes from "./componentes/Reportes";
import Usuarios from "./componentes/Usuarios";
import Navbar from "./componentes/Navbar";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Activos />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/usuarios" element={<Usuarios />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
 