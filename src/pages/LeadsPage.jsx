import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getLeads, getTenant, deleteLead, deleteAllLeads } from "../api/client.js";

const COLUMNS = [
  { key: "email", label: "E-Mail" },
  { key: "wine_name", label: "Empfohlener Wein" },
  { key: "status", label: "Status" },
  { key: "created_at", label: "Datum" },
];

function statusValue(l) {
  if (l.unsubscribed) return 2;
  if (l.confirmed) return 1;
  return 0;
}

export default function LeadsPage() {
  const { id } = useParams();
  const [leads, setLeads] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState([]);
  const [sort, setSort] = useState({ key: "created_at", direction: "desc" });

  function load() {
    getLeads(id).then(setLeads).catch((err) => setError(err.message));
  }

  useEffect(() => {
    getTenant(id).then(setTenant).catch(() => setTenant(null));
  }, [id]);

  useEffect(load, [id]);

  useEffect(() => {
    setSelected([]);
  }, [leads]);

  const sortedLeads = useMemo(() => {
    if (!leads) return [];
    const list = [...leads];
    list.sort((a, b) => {
      let va, vb;
      if (sort.key === "status") {
        va = statusValue(a);
        vb = statusValue(b);
      } else if (sort.key === "created_at") {
        va = new Date(a.created_at).getTime();
        vb = new Date(b.created_at).getTime();
      } else {
        va = (a[sort.key] || "").toString().toLowerCase();
        vb = (b[sort.key] || "").toString().toLowerCase();
      }
      if (va < vb) return sort.direction === "asc" ? -1 : 1;
      if (va > vb) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [leads, sort]);

  function handleSort(key) {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  }

  function toggleSelected(leadId) {
    setSelected((prev) =>
      prev.includes(leadId) ? prev.filter((i) => i !== leadId) : [...prev, leadId]
    );
  }

  function toggleSelectAll() {
    setSelected((prev) =>
      prev.length === sortedLeads.length ? [] : sortedLeads.map((l) => l.id)
    );
  }

  async function handleDelete(leadId) {
    if (!confirm("Diesen Lead wirklich löschen?")) return;
    try {
      await deleteLead(leadId);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteSelected() {
    if (selected.length === 0) return;
    if (!confirm(`${selected.length} ausgewählte Leads wirklich löschen?`)) return;
    try {
      await Promise.all(selected.map((leadId) => deleteLead(leadId)));
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteAll() {
    if (!leads || leads.length === 0) return;
    if (!confirm(`Wirklich ALLE ${leads.length} Leads dieses Shops unwiderruflich löschen?`)) return;
    try {
      await deleteAllLeads(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) return <div className="error-box">{error}</div>;
  if (!leads) return <p>Lädt...</p>;

  const allSelected = selected.length > 0 && selected.length === sortedLeads.length;

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
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 16,
            }}
          >
            <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              {leads.length} Leads{selected.length > 0 ? ` · ${selected.length} ausgewählt` : ""}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              {selected.length > 0 && (
                <button className="btn btn-danger" onClick={handleDeleteSelected}>
                  Ausgewählte löschen ({selected.length})
                </button>
              )}
              <button className="btn btn-danger" onClick={handleDeleteAll}>
                Alle löschen
              </button>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style={{ width: 32 }}>
                  <input
                    type="checkbox"
                    style={{ width: "auto" }}
                    checked={allSelected}
                    onChange={toggleSelectAll}
                  />
                </th>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    style={{ cursor: "pointer", userSelect: "none" }}
                  >
                    {col.label}
                    {sort.key === col.key ? (sort.direction === "asc" ? " ▲" : " ▼") : ""}
                  </th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sortedLeads.map((l) => (
                <tr key={l.id}>
                  <td>
                    <input
                      type="checkbox"
                      style={{ width: "auto" }}
                      checked={selected.includes(l.id)}
                      onChange={() => toggleSelected(l.id)}
                    />
                  </td>
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
                  <td>
                    <button className="btn btn-danger" onClick={() => handleDelete(l.id)}>
                      Löschen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
