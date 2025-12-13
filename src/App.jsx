import { useState, useEffect } from "react";
import Login from "./componentes/Login";
import Dashboard from "./componentes/Dashboard";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const raw = localStorage.getItem("user");
    if (token && raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        localStorage.clear();
      }
    }
  }, []);

  const handleLogin = (u) => setUser(u);
  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  if (!user) return <Login onLogin={handleLogin} />;

  return <Dashboard user={user} onLogout={handleLogout} />;
}
