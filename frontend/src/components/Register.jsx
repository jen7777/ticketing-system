import { Link, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../api";
import { useAuth } from "../authContext.js";
import "../styles/WorkspacePages.css";

const ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "support_engineer", label: "Support Engineer" },
  { value: "software_engineer", label: "Software Engineer" },
  { value: "qa_engineer", label: "QA Engineer" },
  { value: "devops_engineer", label: "DevOps Engineer" },
  { value: "customer", label: "Customer" },
  { value: "admin", label: "Admin" },
];

export default function Register() {
  const navigate = useNavigate();
  const { isAuthenticated, signIn } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
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
      const response = await API.post("/auth/register", form);
      signIn(response.data);
      navigate("/", { replace: true });
    } catch (registerError) {
      setError(registerError.response?.data?.error || "Unable to create account.");
    }
  };

  return (
    <div className="workspace-shell">
      <section className="workspace-hero">
        <div className="workspace-hero-copy">
          <span className="workspace-eyebrow">New Account</span>
          <h1 className="workspace-title">Create your ResolveHub sign-in.</h1>
          <p className="workspace-subtitle">
            Your account also becomes a user record, so tickets can assign and report work to you.
          </p>
        </div>

        <aside className="workspace-hero-panel">
          <span className="workspace-panel-label">Account</span>
          <strong className="workspace-panel-value">Secure</strong>
          <p className="workspace-panel-text">Passwords are stored as hashes on the backend.</p>
        </aside>
      </section>

      <section className="workspace-content-grid">
        <div className="workspace-surface">
          <div className="workspace-surface-header">
            <div>
              <h2>Register</h2>
              <p>Create an account to start using the ticketing system.</p>
            </div>
          </div>

          <form className="workspace-form" onSubmit={handleSubmit}>
            {error ? <div className="workspace-alert">{error}</div> : null}

            <div className="workspace-field-group">
              <label htmlFor="register-name">Name</label>
              <input
                id="register-name"
                name="name"
                type="text"
                className="workspace-input"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="workspace-field-group">
              <label htmlFor="register-email">Email</label>
              <input
                id="register-email"
                name="email"
                type="email"
                className="workspace-input"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="workspace-field-group">
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                name="password"
                type="password"
                className="workspace-input"
                value={form.password}
                onChange={handleChange}
                minLength="6"
                required
              />
            </div>

            <div className="workspace-field-group">
              <label htmlFor="register-role">Role</label>
              <select
                id="register-role"
                name="role"
                className="workspace-select"
                value={form.role}
                onChange={handleChange}
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="workspace-form-actions">
              <button type="submit" className="workspace-btn-primary">
                Create Account
              </button>
              <Link to="/login" className="workspace-btn-secondary">
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
