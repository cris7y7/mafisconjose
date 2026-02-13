import { useState } from "react";
import Login from "./componentes/Login";
import Dashboard from "./componentes/Dashboard";

function getStoredUser() {
  const token = localStorage.getItem("token");
  const raw = localStorage.getItem("user");
  if (!token || !raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.clear();
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState(getStoredUser);

  const handleLogin = (u) => setUser(u);
  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  if (!user) return <Login onLogin={handleLogin} />;

  return <Dashboard user={user} onLogout={handleLogout} />;
}
