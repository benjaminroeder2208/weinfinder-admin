import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getTenantWines, deleteWine, importWinesCSV } from "../api/client.js";

export default function WinesPage() {
  const { id } = useParams();
  const [wines, setWines] = useState(null);
  const [error, setError] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  function load() {
    getTenantWines(id).then(setWines).catch((err) => setError(err.message));
  }

  useEffect(load, [id]);

  async function handleDelete(wineId) {
    if (!confirm("Diesen Wein wirklich löschen?")) return;
    try {
      await deleteWine(wineId);
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

  return (
    <div>
      <div className="toolbar">
        <h1>Weine</h1>
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

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Farbe</th>
            <th>Stil</th>
            <th>Preis</th>
            <th>Featured</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {wines.map((w) => (
            <tr key={w.id}>
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
