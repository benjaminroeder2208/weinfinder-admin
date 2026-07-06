import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getTenantWines, deleteWine } from "../api/client.js";

export default function WinesPage() {
  const { id } = useParams();
  const [wines, setWines] = useState(null);
  const [error, setError] = useState(null);

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

  if (error) return <div className="error-box">{error}</div>;
  if (!wines) return <p>Lädt...</p>;

  return (
    <div>
      <div className="toolbar">
        <h1>Weine</h1>
        <Link className="btn" to={`/tenants/${id}/wines/new`}>
          + Neuer Wein
        </Link>
      </div>
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
