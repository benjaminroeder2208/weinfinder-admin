import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTenants } from "../api/client.js";

export default function TenantsPage() {
  const [tenants, setTenants] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getTenants()
      .then(setTenants)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="error-box">{error}</div>;
  if (!tenants) return <p>Lädt...</p>;

  return (
    <div>
      <div className="toolbar">
        <h1>Shops</h1>
        <Link className="btn" to="/tenants/new">
          + Neuer Shop
        </Link>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Slug</th>
            <th>Paket</th>
            <th>Status</th>
            <th>Erstellt</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((t) => (
            <tr key={t.id}>
              <td>{t.name}</td>
              <td>{t.slug}</td>
              <td>
                <span className="badge">
                  {t.pricing_tier === "premium" ? "Premium" : "Basis"}
                </span>
              </td>
              <td>
                <span className={`badge ${t.active ? "badge-active" : ""}`}>
                  {t.active ? "aktiv" : "inaktiv"}
                </span>
              </td>
              <td>{new Date(t.created_at).toLocaleDateString("de-DE")}</td>
              <td>
                <Link className="btn btn-secondary" to={`/tenants/${t.id}`}>
                  Öffnen
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
