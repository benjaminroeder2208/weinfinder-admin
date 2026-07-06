import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTenant } from "../api/client.js";

export default function TenantNewPage() {
  const navigate = useNavigate();
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [color, setColor] = useState("#a0bd00");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const tenant = await createTenant({
        slug,
        name,
        branding: { primaryColor: color },
      });
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

          <label>Primärfarbe</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />

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
