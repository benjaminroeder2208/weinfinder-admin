import { NavLink } from "react-router-dom";
import { logout } from "../api/client.js";

export default function Sidebar({ open, onNavigate, onLogout }) {
  async function handleLogout() {
    try {
      await logout();
    } catch {
      // Cookie ggf. bereits abgelaufen - trotzdem lokal ausloggen
    }
    onLogout();
  }

  return (
    <div
      className={`sidebar ${open ? "open" : ""}`}
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <div style={{ flex: 1 }}>
        <h2>🍷 Weinfinder</h2>
        <NavLink
          to="/tenants"
          onClick={onNavigate}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Shops
        </NavLink>
        <NavLink
          to="/settings"
          onClick={onNavigate}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Einstellungen
        </NavLink>
      </div>
      <a onClick={handleLogout} style={{ cursor: "pointer" }}>
        ← Logout
      </a>
    </div>
  );
}
