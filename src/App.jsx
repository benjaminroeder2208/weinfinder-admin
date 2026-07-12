import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { getTenants } from "./api/client.js";
import LoginPage from "./pages/LoginPage.jsx";
import Sidebar from "./components/Sidebar.jsx";
import TenantsPage from "./pages/TenantsPage.jsx";
import TenantNewPage from "./pages/TenantNewPage.jsx";
import TenantDetailPage from "./pages/TenantDetailPage.jsx";
import QuizEditorPage from "./pages/QuizEditorPage.jsx";
import LeadsPage from "./pages/LeadsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import WinesPage from "./pages/WinesPage.jsx";
import WineFormPage from "./pages/WineFormPage.jsx";

export default function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // getTenants() ist eine geschützte Route - schlägt fehl, wenn kein gültiges Cookie vorliegt
    getTenants()
      .then(() => setAuthenticated(true))
      .catch(() => setAuthenticated(false))
      .finally(() => setAuthChecked(true));
  }, []);

  if (!authChecked) {
    return <p style={{ padding: 40 }}>Lädt...</p>;
  }

  if (!authenticated) {
    return <LoginPage onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <div className="layout">
      <div className="mobile-topbar">
        <button aria-label="Menü öffnen" onClick={() => setMobileMenuOpen(true)}>
          ☰
        </button>
        <h2>🍷 Weinfinder</h2>
      </div>

      <div
        className={`sidebar-overlay ${mobileMenuOpen ? "open" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <Sidebar
        open={mobileMenuOpen}
        onNavigate={() => setMobileMenuOpen(false)}
        onLogout={() => setAuthenticated(false)}
      />

      <div className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/tenants" replace />} />
          <Route path="/tenants" element={<TenantsPage />} />
          <Route path="/tenants/new" element={<TenantNewPage />} />
          <Route path="/tenants/:id" element={<TenantDetailPage />} />
          <Route path="/tenants/:id/quiz" element={<QuizEditorPage />} />
          <Route path="/tenants/:id/leads" element={<LeadsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/tenants/:id/wines" element={<WinesPage />} />
          <Route path="/tenants/:id/wines/new" element={<WineFormPage />} />
          <Route path="/tenants/:id/wines/:wineId" element={<WineFormPage />} />
        </Routes>
      </div>
    </div>
  );
}
