import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getTenant, updateTenant, getAnalytics } from "../api/client.js";

export default function TenantDetailPage() {
  const { id } = useParams();
  const [tenant, setTenant] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    getTenant(id).then(setTenant).catch((err) => setError(err.message));
    getAnalytics(id).then(setAnalytics).catch(() => setAnalytics(null));
  }, [id]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSavedMsg(false);
    try {
      const updated = await updateTenant(id, {
        name: tenant.name,
        active: tenant.active,
        branding: tenant.branding,
      });
      setTenant(updated);
      setSavedMsg(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (error) return <div className="error-box">{error}</div>;
  if (!tenant) return <p>Lädt...</p>;

  return (
    <div>
      <div className="toolbar">
        <h1>{tenant.name}</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <Link className="btn btn-secondary" to={`/tenants/${id}/quiz`}>
            Quiz-Fragen bearbeiten
          </Link>
          <Link className="btn" to={`/tenants/${id}/wines`}>
            Weine verwalten →
          </Link>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Shop-Einstellungen</h3>
        {savedMsg && <p style={{ color: "var(--color-accent)" }}>Gespeichert.</p>}
        <form onSubmit={handleSave}>
          <label>Name</label>
          <input
            value={tenant.name}
            onChange={(e) => setTenant({ ...tenant, name: e.target.value })}
          />

          <label>Slug</label>
          <input value={tenant.slug} disabled />

          <h3 style={{ marginTop: 24 }}>Farben</h3>
          <div className="row-flex">
            <div>
              <label>Hintergrund</label>
              <div className="color-row">
                <input
                  type="color"
                  value={tenant.branding?.backgroundColor || "#1c1612"}
                  onChange={(e) =>
                    setTenant({
                      ...tenant,
                      branding: { ...tenant.branding, backgroundColor: e.target.value },
                    })
                  }
                />
                <input
                  type="text"
                  value={tenant.branding?.backgroundColor || "#1c1612"}
                  onChange={(e) =>
                    setTenant({
                      ...tenant,
                      branding: { ...tenant.branding, backgroundColor: e.target.value },
                    })
                  }
                />
              </div>
            </div>
            <div>
              <label>Überschriften</label>
              <div className="color-row">
                <input
                  type="color"
                  value={tenant.branding?.headingColor || "#f2ede8"}
                  onChange={(e) =>
                    setTenant({
                      ...tenant,
                      branding: { ...tenant.branding, headingColor: e.target.value },
                    })
                  }
                />
                <input
                  type="text"
                  value={tenant.branding?.headingColor || "#f2ede8"}
                  onChange={(e) =>
                    setTenant({
                      ...tenant,
                      branding: { ...tenant.branding, headingColor: e.target.value },
                    })
                  }
                />
              </div>
            </div>
            <div>
              <label>Text</label>
              <div className="color-row">
                <input
                  type="color"
                  value={tenant.branding?.textColor || "#f2ede8"}
                  onChange={(e) =>
                    setTenant({
                      ...tenant,
                      branding: { ...tenant.branding, textColor: e.target.value },
                    })
                  }
                />
                <input
                  type="text"
                  value={tenant.branding?.textColor || "#f2ede8"}
                  onChange={(e) =>
                    setTenant({
                      ...tenant,
                      branding: { ...tenant.branding, textColor: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </div>
          <div className="row-flex">
            <div>
              <label>Primärfarbe</label>
              <div className="color-row">
                <input
                  type="color"
                  value={tenant.branding?.primaryColor || "#a0bd00"}
                  onChange={(e) =>
                    setTenant({
                      ...tenant,
                      branding: { ...tenant.branding, primaryColor: e.target.value },
                    })
                  }
                />
                <input
                  type="text"
                  value={tenant.branding?.primaryColor || "#a0bd00"}
                  onChange={(e) =>
                    setTenant({
                      ...tenant,
                      branding: { ...tenant.branding, primaryColor: e.target.value },
                    })
                  }
                />
              </div>
            </div>
            <div>
              <label>Sekundärfarbe</label>
              <div className="color-row">
                <input
                  type="color"
                  value={tenant.branding?.secondaryColor || "#8b2615"}
                  onChange={(e) =>
                    setTenant({
                      ...tenant,
                      branding: { ...tenant.branding, secondaryColor: e.target.value },
                    })
                  }
                />
                <input
                  type="text"
                  value={tenant.branding?.secondaryColor || "#8b2615"}
                  onChange={(e) =>
                    setTenant({
                      ...tenant,
                      branding: { ...tenant.branding, secondaryColor: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </div>

          <label>
            <input
              type="checkbox"
              style={{ width: "auto", marginRight: 8 }}
              checked={tenant.active}
              onChange={(e) => setTenant({ ...tenant, active: e.target.checked })}
            />
            Aktiv
          </label>

          <div className="form-actions">
            <button className="btn" type="submit" disabled={saving}>
              {saving ? "Speichert..." : "Speichern"}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Analytics (letzte 30 Tage)</h3>
        {!analytics ? (
          <p>Noch keine Daten vorhanden.</p>
        ) : (
          <>
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-value">{analytics.last30Days}</div>
                <div className="stat-label">Abgeschlossene Quiz</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {analytics.topRecommendedWine?.name || "–"}
                </div>
                <div className="stat-label">Meistempfohlener Wein</div>
              </div>
            </div>
            <div className="row-flex" style={{ marginTop: 16 }}>
              <div>
                <div className="stat-label">Häufigste Anlässe</div>
                {analytics.topOccasions.map((o) => (
                  <div key={o.value}>
                    {o.value} ({o.count})
                  </div>
                ))}
              </div>
              <div>
                <div className="stat-label">Häufigste Stile</div>
                {analytics.topStyles.map((s) => (
                  <div key={s.value}>
                    {s.value} ({s.count})
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
