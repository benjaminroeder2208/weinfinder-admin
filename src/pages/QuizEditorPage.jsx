import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTenant, updateTenant } from "../api/client.js";

// Feste Struktur: field-Schlüssel und zulässige Werte sind an die Matching-Logik
// im Backend gekoppelt und dürfen hier nicht verändert werden. Editierbar sind
// nur der Fragetext und die Beschriftung (label) je Option.
const FIELDS_META = [
  {
    field: "occasion",
    defaultQuestion: "Wann möchtest du den Wein trinken?",
    values: [
      { value: "abend", defaultLabel: "gemütlicher Abend" },
      { value: "dinner", defaultLabel: "Dinner mit Freunden" },
      { value: "geschenk", defaultLabel: "Geschenk" },
      { value: "party", defaultLabel: "Party / Feier" },
      { value: "essen", defaultLabel: "zum Essen" },
    ],
  },
  {
    field: "style",
    defaultQuestion: "Welcher Weinstil passt am besten zu dir?",
    values: [
      { value: "leicht_frisch", defaultLabel: "leicht & frisch" },
      { value: "fruchtig_aromatisch", defaultLabel: "fruchtig & aromatisch" },
      { value: "weich_harmonisch", defaultLabel: "weich & harmonisch" },
      { value: "kraeftig_intensiv", defaultLabel: "kräftig & intensiv" },
    ],
  },
  {
    field: "food",
    defaultQuestion: "Möchtest du den Wein zu einem Essen trinken?",
    values: [
      { value: "fisch", defaultLabel: "Fisch / Meeresfrüchte" },
      { value: "fleisch", defaultLabel: "Fleisch / Grill" },
      { value: "pasta", defaultLabel: "Pasta / mediterran" },
      { value: "vegetarisch", defaultLabel: "vegetarisch" },
      { value: "ohne_essen", defaultLabel: "ohne Essen / nach dem Essen" },
    ],
  },
  {
    field: "color",
    defaultQuestion: "Welche Weinart möchtest du?",
    values: [
      { value: "rot", defaultLabel: "Rotwein" },
      { value: "weiss", defaultLabel: "Weißwein" },
      { value: "rose", defaultLabel: "Rosé" },
      { value: "egal", defaultLabel: "egal – überrasche mich" },
    ],
  },
  {
    field: "priceCategory",
    defaultQuestion: "In welchem Preisbereich suchst du?",
    values: [
      { value: "unter10", defaultLabel: "unter 10 €" },
      { value: "10-20", defaultLabel: "10–20 €" },
      { value: "ueber20", defaultLabel: "über 20 €" },
      { value: "egal", defaultLabel: "egal" },
    ],
  },
  {
    field: "acidity",
    defaultQuestion: "Wie frisch und lebendig darf der Wein wirken?",
    values: [
      { value: "niedrig", defaultLabel: "eher mild und weich" },
      { value: "mittel", defaultLabel: "ausgewogen" },
      { value: "hoch", defaultLabel: "schön frisch und lebendig" },
    ],
  },
];

// Baut aus vorhandener quiz_config + FIELDS_META einen vollständigen,
// editierbaren Zustand - fehlende Felder/Optionen werden mit Defaults aufgefüllt.
function buildEditableState(quizConfig) {
  return FIELDS_META.map((meta) => {
    const existing = quizConfig?.find((q) => q.field === meta.field);
    return {
      field: meta.field,
      question: existing?.question || meta.defaultQuestion,
      options: meta.values.map((v) => {
        const existingOption = existing?.options?.find((o) => o.value === v.value);
        return {
          value: v.value,
          label: existingOption?.label || v.defaultLabel,
        };
      }),
    };
  });
}

export default function QuizEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    getTenant(id)
      .then((tenant) => setQuestions(buildEditableState(tenant.quiz_config)))
      .catch((err) => setError(err.message));
  }, [id]);

  function setQuestionText(fieldIndex, text) {
    setQuestions((qs) =>
      qs.map((q, i) => (i === fieldIndex ? { ...q, question: text } : q))
    );
  }

  function setOptionLabel(fieldIndex, optionIndex, label) {
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === fieldIndex
          ? {
              ...q,
              options: q.options.map((o, j) =>
                j === optionIndex ? { ...o, label } : o
              ),
            }
          : q
      )
    );
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSavedMsg(false);
    try {
      await updateTenant(id, { quiz_config: questions });
      setSavedMsg(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (error) return <div className="error-box">{error}</div>;
  if (!questions) return <p>Lädt...</p>;

  return (
    <div>
      <div className="toolbar">
        <h1>Quiz-Fragen</h1>
        <button className="btn btn-secondary" onClick={() => navigate(`/tenants/${id}`)}>
          ← Zurück zum Shop
        </button>
      </div>

      <p style={{ marginBottom: 24 }}>
        Du kannst die Fragetexte und die Beschriftung der Antwortoptionen anpassen.
        Die Reihenfolge und Anzahl der Fragen ist fest, da sie mit der
        Empfehlungslogik im Hintergrund verknüpft ist.
      </p>

      {savedMsg && (
        <div className="card" style={{ borderColor: "var(--color-accent)" }}>
          Gespeichert.
        </div>
      )}

      {questions.map((q, fieldIndex) => (
        <div className="card" key={q.field}>
          <label>Frage {fieldIndex + 1}</label>
          <input
            value={q.question}
            onChange={(e) => setQuestionText(fieldIndex, e.target.value)}
          />

          <label style={{ marginTop: 16 }}>Antwortoptionen</label>
          {q.options.map((opt, optionIndex) => (
            <div className="row-flex" key={opt.value} style={{ marginBottom: 8 }}>
              <input
                value={opt.label}
                onChange={(e) =>
                  setOptionLabel(fieldIndex, optionIndex, e.target.value)
                }
              />
              <input value={opt.value} disabled style={{ maxWidth: 140, opacity: 0.5 }} />
            </div>
          ))}
        </div>
      ))}

      <div className="form-actions">
        <button className="btn" onClick={handleSave} disabled={saving}>
          {saving ? "Speichert..." : "Alle Fragen speichern"}
        </button>
      </div>
    </div>
  );
}
