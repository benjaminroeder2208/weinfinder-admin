import { useEffect, useState } from "react";
import { getSettings, updateSettings } from "../api/client.js";

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    getSettings().then(setSettings).catch((err) => setError(err.message));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSavedMsg(false);
    try {
      const updated = await updateSettings(settings);
      setSettings(updated);
      setSavedMsg(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (error) return <div className="error-box">{error}</div>;
  if (!settings) return <p>Lädt...</p>;

  return (
    <div>
      <h1>Plattform-Einstellungen</h1>
      <p>
        Diese Angaben gelten global für alle Kunden und erscheinen als
        „Auftragsverarbeiter" auf jeder automatisch generierten Datenschutzseite.
      </p>

      <div className="card">
        {savedMsg && <p style={{ color: "var(--color-accent)" }}>Gespeichert.</p>}
        <form onSubmit={handleSave}>
          <label>Firmenname / Betreiber</label>
          <input
            value={settings.operator_name || ""}
            onChange={(e) => setSettings({ ...settings, operator_name: e.target.value })}
            placeholder="z.B. Benjamin Röder / kontakt-2"
          />

          <label>Anschrift</label>
          <textarea
            value={settings.operator_address || ""}
            onChange={(e) => setSettings({ ...settings, operator_address: e.target.value })}
            placeholder={"Straße Hausnummer\nPLZ Ort"}
          />

          <label>Kontakt-E-Mail</label>
          <input
            type="email"
            value={settings.operator_contact_email || ""}
            onChange={(e) =>
              setSettings({ ...settings, operator_contact_email: e.target.value })
            }
          />

          <div className="form-actions">
            <button className="btn" type="submit" disabled={saving}>
              {saving ? "Speichert..." : "Speichern"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
