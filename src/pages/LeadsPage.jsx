import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getLeads, getTenant } from "../api/client.js";

export default function LeadsPage() {
  const { id } = useParams();
  const [leads, setLeads] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getTenant(id).then(setTenant).catch(() => setTenant(null));
    getLeads(id).then(setLeads).catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="error-box">{error}</div>;
  if (!leads) return <p>Lädt...</p>;

  return (
    <div>
      <Link
        to={`/tenants/${id}`}
        style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", textDecoration: "none" }}
      >
        ← {tenant?.name || "Shop"}
      </Link>
      <div className="toolbar" style={{ marginTop: 8 }}>
        <h1>Leads – {tenant?.name || "..."}</h1>
        <a className="btn btn-secondary" href={`/api/admin/tenants/${id}/leads/export`}>
          CSV exportieren
        </a>
      </div>

      {leads.length === 0 ? (
        <p>Noch keine Leads erfasst.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>E-Mail</th>
              <th>Empfohlener Wein</th>
              <th>Status</th>
              <th>Datum</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id}>
                <td>{l.email}</td>
                <td>{l.wine_name || "–"}</td>
                <td>
                  {l.unsubscribed ? (
                    <span className="badge">Abgemeldet</span>
                  ) : l.confirmed ? (
                    <span className="badge badge-active">Bestätigt</span>
                  ) : (
                    <span className="badge">Ausstehend</span>
                  )}
                </td>
                <td>{new Date(l.created_at).toLocaleString("de-DE")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
