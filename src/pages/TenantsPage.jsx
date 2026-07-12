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
      <div className="table-scroll">
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
                  {{ basis: "Basis", premium: "Premium", demo: "Demo", pilot: "Pilot", enterprise: "Enterprise" }[t.pricing_tier] || "Demo"}
                </span>
              </td>
              <td>
                <span className={`badge ${t.active ? "badge-active" : ""}`}>
                  {t.active ? "aktiv" : "inaktiv"}
                </span>
              </td>
              <td>{new Date(t.created_at).toLocaleDateString("de-DE")}</td>
              <td style={{ whiteSpace: "nowrap" }}>
                <a
                  className="btn btn-secondary"
                  href={`https://app.premium-weinfinder.de/w/${t.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ marginRight: 8 }}
                >
                  Öffnen
                </a>
                <Link className="btn" to={`/tenants/${t.id}`}>
                  Admin
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
