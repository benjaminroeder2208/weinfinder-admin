import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTenant } from "../api/client.js";

const DEFAULT_BRANDING = {
  backgroundColor: "#1c1612",
  textColor: "#f2ede8",
  headingColor: "#f2ede8",
  primaryColor: "#a0bd00",
  secondaryColor: "#8b2615",
};

export default function TenantNewPage() {
  const navigate = useNavigate();
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [branding, setBranding] = useState(DEFAULT_BRANDING);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  function setColor(field, value) {
    setBranding((b) => ({ ...b, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const tenant = await createTenant({ slug, name, branding });
      navigate(`/tenants/${tenant.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1>Neuer Shop</h1>
      {error && <div className="error-box">{error}</div>}
      <div className="card">
        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />

          <label>Slug (URL-Bestandteil, z. B. weingut-mueller)</label>
          <input
            value={slug}
            onChange={(e) =>
              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))
            }
            required
          />

          <h3 style={{ marginTop: 24 }}>Farben</h3>
          <div className="row-flex">
            <div>
              <label>Hintergrund</label>
              <input
                type="color"
                value={branding.backgroundColor}
                onChange={(e) => setColor("backgroundColor", e.target.value)}
              />
            </div>
            <div>
              <label>Überschriften</label>
              <input
                type="color"
                value={branding.headingColor}
                onChange={(e) => setColor("headingColor", e.target.value)}
              />
            </div>
            <div>
              <label>Text</label>
              <input
                type="color"
                value={branding.textColor}
                onChange={(e) => setColor("textColor", e.target.value)}
              />
            </div>
          </div>
          <div className="row-flex">
            <div>
              <label>Primärfarbe</label>
              <input
                type="color"
                value={branding.primaryColor}
                onChange={(e) => setColor("primaryColor", e.target.value)}
              />
            </div>
            <div>
              <label>Sekundärfarbe</label>
              <input
                type="color"
                value={branding.secondaryColor}
                onChange={(e) => setColor("secondaryColor", e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn" type="submit" disabled={saving}>
              {saving ? "Speichert..." : "Shop anlegen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

