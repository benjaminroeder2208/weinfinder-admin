import { useState } from "react";
import { login } from "../api/client.js";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      onLogin();
    } catch (err) {
      setError("E-Mail oder Passwort ist falsch.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <h1>Weinfinder Admin</h1>
      {error && <div className="error-box">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>E-Mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Passwort</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="form-actions">
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Anmelden..." : "Anmelden"}
          </button>
        </div>
      </form>
    </div>
  );
}
