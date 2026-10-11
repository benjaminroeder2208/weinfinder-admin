import { useEffect, useState } from "react";
import QRCode from "qrcode";

// Fehlerkorrektur "Q" (25 %): toleriert Knicke, Kratzer und leichte Verschmutzung
// auf Flaschenanhängern und Aufstellern. Schwarz auf Weiß ist bewusst fest
// gesetzt - farbige oder invertierte QR-Codes werden von manchen Handys
// schlechter gelesen als Kunden-Branding es wert wäre.
const QR_OPTIONS = { errorCorrectionLevel: "Q", margin: 2 };

export default function QrCodeCard({ url, slug }) {
  const [png, setPng] = useState(null);
  const [svg, setSvg] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    Promise.all([
      QRCode.toDataURL(url, { ...QR_OPTIONS, width: 1024 }),
      QRCode.toString(url, { ...QR_OPTIONS, type: "svg" }),
    ])
      .then(([pngUrl, svgString]) => {
        if (cancelled) return;
        setPng(pngUrl);
        setSvg(svgString);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  function downloadSvg() {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `weinfinder-qr-${slug}.svg`;
    a.click();
    URL.revokeObjectURL(href);
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>QR-Code fürs Ladengeschäft</h3>
      <p style={{ fontSize: "0.85rem" }}>
        Für Flaschenanhänger, Thekenaufsteller oder Visitenkarten. Der Code führt
        direkt zum Weinfinder dieses Shops.
      </p>

      {error && <div className="error-box">QR-Code konnte nicht erzeugt werden: {error}</div>}

      {png && (
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
          <img
            src={png}
            alt={`QR-Code für ${url}`}
            width={200}
            height={200}
            style={{ background: "#fff", borderRadius: 8, display: "block" }}
          />
          <div style={{ flex: 1, minWidth: 220 }}>
            <div className="form-actions" style={{ marginTop: 0 }}>
              <a className="btn" href={png} download={`weinfinder-qr-${slug}.png`}>
                PNG herunterladen
              </a>
              <button className="btn btn-secondary" type="button" onClick={downloadSvg}>
                SVG herunterladen
              </button>
            </div>
            <p style={{ fontSize: "0.8rem", marginTop: 12 }}>
              <strong>PNG</strong> für Office, Social Media oder schnellen Druck,{" "}
              <strong>SVG</strong> für Druckereien und Designer (beliebig skalierbar).
              Mindestens 2 × 2 cm drucken und vor dem Druck einmal mit dem Handy
              scannen.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
