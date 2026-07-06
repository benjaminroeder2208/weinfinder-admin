import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2>🍷 Weinfinder</h2>
      <NavLink to="/tenants" className={({ isActive }) => (isActive ? "active" : "")}>
        Shops
      </NavLink>
    </div>
  );
}
