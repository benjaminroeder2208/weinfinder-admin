// Einbettungscode für Kunden OHNE WordPress-Plugin: iFrame plus kurzes Skript,
// das die vom Weinfinder gemeldete Höhe übernimmt. Das Skript prüft Herkunft
// UND Absender-Fenster, damit fremde Skripte auf der Seite die Höhe nicht
// manipulieren können. Ohne das Skript funktioniert der iFrame weiterhin
// (feste Höhe 800px) - das Skript ist eine reine Verbesserung.
export function buildEmbedSnippet(publicUrl) {
  const origin = new URL(publicUrl).origin;
  return `<iframe id="weinfinder-frame" src="${publicUrl}" style="width:100%; height:800px; border:none;" title="Weinfinder"></iframe>
<script>
(function () {
  var frame = document.getElementById("weinfinder-frame");
  window.addEventListener("message", function (e) {
    if (!frame || e.origin !== "${origin}" || e.source !== frame.contentWindow) return;
    var d = e.data;
    if (!d || d.source !== "weinfinder") return;
    if (d.type === "height" && typeof d.height === "number" && d.height >= 200 && d.height <= 10000) {
      frame.style.height = d.height + "px";
    } else if (d.type === "scrollTop") {
      var top = frame.getBoundingClientRect().top;
      if (top < 0) window.scrollBy({ top: top - 16, behavior: "smooth" });
    }
  });
})();
</script>`;
}
