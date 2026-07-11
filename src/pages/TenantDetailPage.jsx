import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getTenant, updateTenant, getAnalytics, getTenants } from "../api/client.js";

export default function TenantDetailPage() {
  const { id } = useParams();
  const [tenant, setTenant] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [allTenants, setAllTenants] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    getTenant(id)
      .then((data) =>
        setTenant({
          ...data,
          content: {
            headline: "Weinfinder",
            subheadlineTemplate: "Finde den Wein, der wirklich zu deinem Geschmack passt.",
            description:
              "Beantworte wenige kurze Fragen und erhalte eine persönliche Weinempfehlung – fast wie im Gespräch mit einem Sommelier.",
            ctaLabel: "Weinberatung starten",
            ctaSupportText: "Schnell, einfach und individuell",
            logoUrl: "",
            ...data.content,
          },
        })
      )
      .catch((err) => setError(err.message));
    getAnalytics(id).then(setAnalytics).catch(() => setAnalytics(null));
    getTenants().then(setAllTenants).catch(() => setAllTenants([]));
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
        content: tenant.content,
        pricing_tier: tenant.pricing_tier,
        demo_sources: tenant.demo_sources || [],
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

  const publicUrl = `https://app.premium-weinfinder.de/w/${tenant.slug}`;
  const iframeSnippet = `<iframe src="${publicUrl}" style="width:100%; height:800px; border:none;" title="Weinfinder"></iframe>`;

  return (
    <div>
      <div className="toolbar">
        <h1>{tenant.name}</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <Link className="btn btn-secondary" to={`/tenants/${id}/quiz`}>
            Quiz-Fragen bearbeiten
          </Link>
          {!["basis", "pilot"].includes(tenant.pricing_tier) && (
            <Link className="btn btn-secondary" to={`/tenants/${id}/leads`}>
              Leads ansehen
            </Link>
          )}
          <Link className="btn" to={`/tenants/${id}/wines`}>
            Weine verwalten
          </Link>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Einbindung</h3>

        <label>Link zum Weinfinder</label>
        <div className="row-flex">
          <input readOnly value={publicUrl} onClick={(e) => e.target.select()} />
          <a className="btn btn-secondary" href={publicUrl} target="_blank" rel="noreferrer">
            Öffnen
          </a>
        </div>

        <label style={{ marginTop: 16 }}>iFrame-Einbettungscode</label>
        <textarea
          readOnly
          value={iframeSnippet}
          onClick={(e) => e.target.select()}
          style={{ fontFamily: "monospace", fontSize: "0.8rem", minHeight: 60 }}
        />
        <div className="form-actions">
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => navigator.clipboard.writeText(iframeSnippet)}
          >
            Code kopieren
          </button>
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

          <label>Paket</label>
          <select
            value={tenant.pricing_tier || "demo"}
            onChange={(e) => setTenant({ ...tenant, pricing_tier: e.target.value })}
          >
            <option value="basis">Basis</option>
            <option value="premium">Premium</option>
            <option value="demo">Demo</option>
            <option value="pilot">Pilot</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <p style={{ fontSize: "0.8rem", marginTop: 4 }}>
            Lead-Gen-Formular ist bei „Basis" und „Pilot" ausgeblendet, sonst sichtbar.
          </p>

          {tenant.pricing_tier === "demo" && (
            <>
              <label style={{ marginTop: 16 }}>
                Kunden, deren Weine im Demo-Dropdown wählbar sind
              </label>
              <div
                style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  padding: 12,
                  maxHeight: 200,
                  overflowY: "auto",
                }}
              >
                {allTenants
                  .filter((t) => t.id !== tenant.id)
                  .map((t) => {
                    const checked = (tenant.demo_sources || []).includes(t.slug);
                    return (
                      <label
                        key={t.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontSize: "0.9rem",
                          marginTop: 4,
                        }}
                      >
                        <input
                          type="checkbox"
                          style={{ width: "auto" }}
                          checked={checked}
                          onChange={(e) => {
                            const current = tenant.demo_sources || [];
                            const next = e.target.checked
                              ? [...current, t.slug]
                              : current.filter((s) => s !== t.slug);
                            setTenant({ ...tenant, demo_sources: next });
                          }}
                        />
                        {t.name} ({t.slug})
                      </label>
                    );
                  })}
                {allTenants.length <= 1 && (
                  <p style={{ fontSize: "0.85rem", margin: 0 }}>
                    Keine weiteren Kunden vorhanden.
                  </p>
                )}
              </div>
            </>
          )}

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
          <div className="row-flex">
            <div>
              <label>Kachel-Hintergrund</label>
              <div className="color-row">
                <input
                  type="color"
                  value={tenant.branding?.cardBackgroundColor || "#2a221c"}
                  onChange={(e) =>
                    setTenant({
                      ...tenant,
                      branding: { ...tenant.branding, cardBackgroundColor: e.target.value },
                    })
                  }
                />
                <input
                  type="text"
                  value={tenant.branding?.cardBackgroundColor || "#2a221c"}
                  onChange={(e) =>
                    setTenant({
                      ...tenant,
                      branding: { ...tenant.branding, cardBackgroundColor: e.target.value },
                    })
                  }
                />
              </div>
            </div>
            <div>
              <label>Kachel-Schrift</label>
              <div className="color-row">
                <input
                  type="color"
                  value={tenant.branding?.cardTextColor || "#a89e94"}
                  onChange={(e) =>
                    setTenant({
                      ...tenant,
                      branding: { ...tenant.branding, cardTextColor: e.target.value },
                    })
                  }
                />
                <input
                  type="text"
                  value={tenant.branding?.cardTextColor || "#a89e94"}
                  onChange={(e) =>
                    setTenant({
                      ...tenant,
                      branding: { ...tenant.branding, cardTextColor: e.target.value },
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
        <h3 style={{ marginTop: 0 }}>Startseite</h3>
        <label>Logo-URL (leer lassen für Standard-Weinglas-Icon)</label>
        <input
          value={tenant.content.logoUrl}
          onChange={(e) =>
            setTenant({ ...tenant, content: { ...tenant.content, logoUrl: e.target.value } })
          }
          placeholder="https://..."
        />

        <label>Überschrift</label>
        <input
          value={tenant.content.headline}
          onChange={(e) =>
            setTenant({ ...tenant, content: { ...tenant.content, headline: e.target.value } })
          }
        />

        <label>Unterüberschrift</label>
        <input
          value={tenant.content.subheadlineTemplate}
          onChange={(e) =>
            setTenant({
              ...tenant,
              content: { ...tenant.content, subheadlineTemplate: e.target.value },
            })
          }
        />

        <label>Beschreibungstext</label>
        <textarea
          value={tenant.content.description}
          onChange={(e) =>
            setTenant({ ...tenant, content: { ...tenant.content, description: e.target.value } })
          }
        />

        <div className="row-flex">
          <div>
            <label>Button-Text</label>
            <input
              value={tenant.content.ctaLabel}
              onChange={(e) =>
                setTenant({ ...tenant, content: { ...tenant.content, ctaLabel: e.target.value } })
              }
            />
          </div>
          <div>
            <label>Text unter dem Button</label>
            <input
              value={tenant.content.ctaSupportText}
              onChange={(e) =>
                setTenant({
                  ...tenant,
                  content: { ...tenant.content, ctaSupportText: e.target.value },
                })
              }
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="btn" onClick={handleSave} disabled={saving}>
            {saving ? "Speichert..." : "Speichern"}
          </button>
        </div>
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
