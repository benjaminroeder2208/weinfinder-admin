import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getTenantWines,
  deleteWine,
  deleteAllWines,
  importWinesCSV,
  getTenant,
} from "../api/client.js";

const COLUMNS = [
  { key: "name", label: "Name" },
  { key: "color", label: "Farbe" },
  { key: "style", label: "Stil" },
  { key: "price", label: "Preis" },
  { key: "featured_score", label: "Featured" },
];

export default function WinesPage() {
  const { id } = useParams();
  const [wines, setWines] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [error, setError] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const [selected, setSelected] = useState([]);
  const [sort, setSort] = useState({ key: "name", direction: "asc" });
  const fileInputRef = useRef(null);

  function load() {
    getTenantWines(id).then(setWines).catch((err) => setError(err.message));
  }

  useEffect(() => {
    getTenant(id).then(setTenant).catch(() => setTenant(null));
  }, [id]);

  useEffect(load, [id]);

  useEffect(() => {
    setSelected([]);
  }, [wines]);

  const sortedWines = useMemo(() => {
    if (!wines) return [];
    const list = [...wines];
    list.sort((a, b) => {
      let va = a[sort.key];
      let vb = b[sort.key];
      if (sort.key === "price") {
        va = parseFloat(va);
        vb = parseFloat(vb);
      } else if (sort.key === "featured_score") {
        va = Number(va);
        vb = Number(vb);
      } else {
        va = (va || "").toString().toLowerCase();
        vb = (vb || "").toString().toLowerCase();
      }
      if (va < vb) return sort.direction === "asc" ? -1 : 1;
      if (va > vb) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [wines, sort]);

  function handleSort(key) {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  }

  function toggleSelected(wineId) {
    setSelected((prev) =>
      prev.includes(wineId) ? prev.filter((i) => i !== wineId) : [...prev, wineId]
    );
  }

  function toggleSelectAll() {
    setSelected((prev) =>
      prev.length === sortedWines.length ? [] : sortedWines.map((w) => w.id)
    );
  }

  async function handleDelete(wineId) {
    if (!confirm("Diesen Wein wirklich löschen?")) return;
    try {
      await deleteWine(wineId);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteSelected() {
    if (selected.length === 0) return;
    if (!confirm(`${selected.length} ausgewählte Weine wirklich löschen?`)) return;
    try {
      await Promise.all(selected.map((wineId) => deleteWine(wineId)));
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteAll() {
    if (!wines || wines.length === 0) return;
    if (
      !confirm(
        `Wirklich ALLE ${wines.length} Weine dieses Shops unwiderruflich löschen?`
      )
    )
      return;
    try {
      await deleteAllWines(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    setError(null);
    try {
      const text = await file.text();
      const result = await importWinesCSV(id, text);
      setImportResult(result);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  }

  if (error) return <div className="error-box">{error}</div>;
  if (!wines) return <p>Lädt...</p>;

  const allSelected = selected.length > 0 && selected.length === sortedWines.length;

  return (
    <div>
      <Link
        to={`/tenants/${id}`}
        style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", textDecoration: "none" }}
      >
        ← {tenant?.name || "Shop"}
      </Link>
      <div className="toolbar" style={{ marginTop: 8 }}>
        <h1>Weine – {tenant?.name || "..."}</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <a className="btn btn-secondary" href={`/api/admin/tenants/${id}/wines/export`}>
            CSV exportieren
          </a>
          <button className="btn btn-secondary" onClick={handleImportClick} disabled={importing}>
            {importing ? "Importiert..." : "CSV importieren"}
          </button>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <Link className="btn" to={`/tenants/${id}/wines/new`}>
            + Neuer Wein
          </Link>
        </div>
      </div>

      {importResult && (
        <div className="card">
          <strong>{importResult.imported} Weine importiert</strong>
          {importResult.failed > 0 && (
            <>
              <p style={{ color: "#e88" }}>{importResult.failed} fehlgeschlagen:</p>
              <ul style={{ fontSize: "0.85rem" }}>
                {importResult.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 16,
        }}
      >
        <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
          {wines.length} Weine{selected.length > 0 ? ` · ${selected.length} ausgewählt` : ""}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          {selected.length > 0 && (
            <button className="btn btn-danger" onClick={handleDeleteSelected}>
              Ausgewählte löschen ({selected.length})
            </button>
          )}
          {wines.length > 0 && (
            <button className="btn btn-danger" onClick={handleDeleteAll}>
              Alle löschen
            </button>
          )}
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
          {sortedWines.map((w) => (
            <tr key={w.id}>
              <td>
                <input
                  type="checkbox"
                  style={{ width: "auto" }}
                  checked={selected.includes(w.id)}
                  onChange={() => toggleSelected(w.id)}
                />
              </td>
              <td>{w.name}</td>
              <td>{w.color}</td>
              <td>{w.style}</td>
              <td>{parseFloat(w.price).toFixed(2)} €</td>
              <td>{w.featured_score}</td>
              <td style={{ whiteSpace: "nowrap" }}>
                <Link
                  className="btn btn-secondary"
                  to={`/tenants/${id}/wines/${w.id}`}
                  style={{ marginRight: 8 }}
                >
                  Bearbeiten
                </Link>
                <button className="btn btn-danger" onClick={() => handleDelete(w.id)}>
                  Löschen
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
