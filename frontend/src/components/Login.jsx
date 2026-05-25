import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../api";
import { useAuth } from "../authContext.js";
import "../styles/WorkspacePages.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, signIn } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await API.post("/auth/login", form);
      signIn(response.data);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (loginError) {
      setError(loginError.response?.data?.error || "Unable to sign in.");
    }
  };

  return (
    <div className="workspace-shell">
      <section className="workspace-hero">
        <div className="workspace-hero-copy">
          <span className="workspace-eyebrow">ResolveHub</span>
          <h1 className="workspace-title">Sign in to manage the support queue.</h1>
          <p className="workspace-subtitle">
            Use your account to view tickets, manage users, and keep support work moving.
          </p>
        </div>

        <aside className="workspace-hero-panel">
          <span className="workspace-panel-label">Access</span>
          <strong className="workspace-panel-value">Login</strong>
          <p className="workspace-panel-text">New here? Create an account first.</p>
        </aside>
      </section>

      <section className="workspace-content-grid">
        <div className="workspace-surface">
          <div className="workspace-surface-header">
            <div>
              <h2>Login</h2>
              <p>Enter your email and password.</p>
            </div>
          </div>

          <form className="workspace-form" onSubmit={handleSubmit}>
            {error ? <div className="workspace-alert">{error}</div> : null}

            <div className="workspace-field-group">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                name="email"
                type="email"
                className="workspace-input"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="workspace-field-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                name="password"
                type="password"
                className="workspace-input"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="workspace-form-actions">
              <button type="submit" className="workspace-btn-primary">
                Sign In
              </button>
              <Link to="/register" className="workspace-btn-secondary">
                Create Account
              </Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
