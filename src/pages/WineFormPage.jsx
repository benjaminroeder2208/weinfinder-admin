import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getWine, createWine, updateWine } from "../api/client.js";

const EMPTY_WINE = {
  name: "",
  weingut: "",
  price: "",
  price_category: "10-20",
  color: "weiss",
  style: "leicht_frisch",
  occasion: "",
  food_pairing: "",
  body: "leicht",
  acidity: "mittel",
  sweetness: "trocken",
  aroma_notes: "",
  grape_variety: "",
  region: "",
  vintage: "",
  alcohol: "",
  gift_score: 0,
  featured_score: 0,
  link: "",
  description: "",
};

// Wandelt kommagetrennte Textfelder in Arrays um (für Backend-Felder vom Typ TEXT[])
function toArray(value) {
  return value
    ? value.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
}

function fromArray(value) {
  return Array.isArray(value) ? value.join(", ") : "";
}

export default function WineFormPage() {
  const { id: tenantId, wineId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(wineId);

  const [wine, setWine] = useState(EMPTY_WINE);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      getWine(wineId).then((data) =>
        setWine({
          ...data,
          occasion: fromArray(data.occasion),
          food_pairing: fromArray(data.food_pairing),
          aroma_notes: fromArray(data.aroma_notes),
        })
      );
    }
  }, [isEdit, wineId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const payload = {
      ...wine,
      price: parseFloat(wine.price),
      occasion: toArray(wine.occasion),
      food_pairing: toArray(wine.food_pairing),
      aroma_notes: toArray(wine.aroma_notes),
      gift_score: parseInt(wine.gift_score, 10) || 0,
      featured_score: parseInt(wine.featured_score, 10) || 0,
    };
    try {
      if (isEdit) {
        await updateWine(wineId, payload);
      } else {
        await createWine(tenantId, payload);
      }
      navigate(`/tenants/${tenantId}/wines`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function set(field, value) {
    setWine((w) => ({ ...w, [field]: value }));
  }

  return (
    <div>
      <h1>{isEdit ? "Wein bearbeiten" : "Neuer Wein"}</h1>
      {error && <div className="error-box">{error}</div>}
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="row-flex">
            <div>
              <label>Name</label>
              <input value={wine.name} onChange={(e) => set("name", e.target.value)} required />
            </div>
            <div>
              <label>Weingut</label>
              <input value={wine.weingut} onChange={(e) => set("weingut", e.target.value)} />
            </div>
          </div>

          <div className="row-flex">
            <div>
              <label>Preis (€)</label>
              <input
                type="number"
                step="0.01"
                value={wine.price}
                onChange={(e) => set("price", e.target.value)}
                required
              />
            </div>
            <div>
              <label>Preiskategorie</label>
              <select value={wine.price_category} onChange={(e) => set("price_category", e.target.value)}>
                <option value="unter10">unter 10 €</option>
                <option value="10-20">10–20 €</option>
                <option value="ueber20">über 20 €</option>
              </select>
            </div>
          </div>

          <div className="row-flex">
            <div>
              <label>Farbe</label>
              <select value={wine.color} onChange={(e) => set("color", e.target.value)}>
                <option value="weiss">Weiß</option>
                <option value="rot">Rot</option>
                <option value="rose">Rosé</option>
              </select>
            </div>
            <div>
              <label>Stil</label>
              <select value={wine.style} onChange={(e) => set("style", e.target.value)}>
                <option value="leicht_frisch">leicht & frisch</option>
                <option value="fruchtig_aromatisch">fruchtig & aromatisch</option>
                <option value="weich_harmonisch">weich & harmonisch</option>
                <option value="kraeftig_intensiv">kräftig & intensiv</option>
              </select>
            </div>
          </div>

          <label>Anlässe (kommagetrennt, z. B. abend, dinner)</label>
          <input value={wine.occasion} onChange={(e) => set("occasion", e.target.value)} />

          <label>Food-Pairing (kommagetrennt, z. B. fisch, pasta)</label>
          <input value={wine.food_pairing} onChange={(e) => set("food_pairing", e.target.value)} />

          <div className="row-flex">
            <div>
              <label>Körper</label>
              <select value={wine.body} onChange={(e) => set("body", e.target.value)}>
                <option value="leicht">leicht</option>
                <option value="mittel">mittel</option>
                <option value="kraeftig">kräftig</option>
              </select>
            </div>
            <div>
              <label>Säure</label>
              <select value={wine.acidity} onChange={(e) => set("acidity", e.target.value)}>
                <option value="niedrig">niedrig</option>
                <option value="mittel">mittel</option>
                <option value="hoch">hoch</option>
              </select>
            </div>
            <div>
              <label>Süße</label>
              <select value={wine.sweetness} onChange={(e) => set("sweetness", e.target.value)}>
                <option value="trocken">trocken</option>
                <option value="halbtrocken">halbtrocken</option>
                <option value="lieblich">lieblich</option>
              </select>
            </div>
          </div>

          <label>Aromen (kommagetrennt)</label>
          <input value={wine.aroma_notes} onChange={(e) => set("aroma_notes", e.target.value)} />

          <div className="row-flex">
            <div>
              <label>Rebsorte</label>
              <input value={wine.grape_variety} onChange={(e) => set("grape_variety", e.target.value)} />
            </div>
            <div>
              <label>Region</label>
              <input value={wine.region} onChange={(e) => set("region", e.target.value)} />
            </div>
          </div>

          <div className="row-flex">
            <div>
              <label>Jahrgang</label>
              <input value={wine.vintage} onChange={(e) => set("vintage", e.target.value)} />
            </div>
            <div>
              <label>Alkohol</label>
              <input value={wine.alcohol} onChange={(e) => set("alcohol", e.target.value)} />
            </div>
          </div>

          <div className="row-flex">
            <div>
              <label>Gift-Score (0–5)</label>
              <input
                type="number"
                min="0"
                max="5"
                value={wine.gift_score}
                onChange={(e) => set("gift_score", e.target.value)}
              />
            </div>
            <div>
              <label>Featured-Score (0–5)</label>
              <input
                type="number"
                min="0"
                max="5"
                value={wine.featured_score}
                onChange={(e) => set("featured_score", e.target.value)}
              />
            </div>
          </div>

          <label>Shop-Link</label>
          <input value={wine.link} onChange={(e) => set("link", e.target.value)} />

          <label>Beschreibung</label>
          <textarea value={wine.description} onChange={(e) => set("description", e.target.value)} />

          <div className="form-actions">
            <button className="btn" type="submit" disabled={saving}>
              {saving ? "Speichert..." : isEdit ? "Speichern" : "Wein anlegen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
