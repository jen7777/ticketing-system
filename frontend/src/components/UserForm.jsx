import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../api";
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

const UserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    password: "",
  });
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await API.get(`/users/${id}`);
        setFormData({ ...response.data, password: "" });
        setError("");
      } catch (fetchError) {
        console.error("Error fetching user:", fetchError);
        setError("Unable to load this user.");
      } finally {
        setLoading(false);
      }
    }

    if (isEditMode) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [id, isEditMode]);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (isEditMode) {
        await API.put(`/users/${id}`, formData);
      } else {
        await API.post("/users", formData);
      }

      navigate("/users");
    } catch (submitError) {
      console.error("Error saving user:", submitError);
      setError(submitError.response?.data?.error || "Unable to save user.");
    }
  };

  if (loading) {
    return <div className="workspace-shell">Loading user...</div>;
  }

  return (
    <div className="workspace-shell">
      <section className="workspace-hero">
        <div className="workspace-hero-copy">
          <span className="workspace-eyebrow">{isEditMode ? "Edit User" : "New User"}</span>
          <h1 className="workspace-title">
            {isEditMode ? "Update the teammate profile and keep ownership clean." : "Add a teammate so tickets can be routed properly."}
          </h1>
          <p className="workspace-subtitle">
            User records power ticket ownership, reporting, and assignment, so a
            clean directory makes every workflow feel more intentional.
          </p>

          <div className="workspace-actions">
            <Link to="/users" className="workspace-btn-secondary">
              Back to Users
            </Link>
            <Link to="/tickets" className="workspace-btn-tertiary">
              View Tickets
            </Link>
          </div>

          <div className="workspace-badge-row">
            <span className="workspace-stat-chip">
              Mode <strong>{isEditMode ? "Edit" : "Create"}</strong>
            </span>
            <span className="workspace-stat-chip">
              Role <strong>{ROLE_OPTIONS.find((role) => role.value === formData.role)?.label}</strong>
            </span>
          </div>
        </div>

        <aside className="workspace-hero-panel">
          <span className="workspace-panel-label">Profile Summary</span>
          <strong className="workspace-panel-value">{formData.name || "New"}</strong>
          <p className="workspace-panel-text">This profile will appear anywhere tickets reference team members.</p>

          <div className="workspace-panel-list">
            <div className="workspace-panel-item">
              <span>Email</span>
              <strong>{formData.email || "Pending"}</strong>
            </div>
            <div className="workspace-panel-item">
              <span>Role</span>
              <strong>{ROLE_OPTIONS.find((role) => role.value === formData.role)?.label}</strong>
            </div>
          </div>
        </aside>
      </section>

      <section className="workspace-content-grid">
        <div className="workspace-surface">
          <div className="workspace-surface-header">
            <div>
              <h2>{isEditMode ? "Edit User" : "Create User"}</h2>
              <p>Capture the core details that will be reused throughout the app.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="workspace-form">
            {error ? <div className="workspace-alert">{error}</div> : null}

            <div className="workspace-field-group">
              <label htmlFor="user-name">Name</label>
              <input
                id="user-name"
                type="text"
                name="name"
                className="workspace-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="workspace-field-group">
              <label htmlFor="user-email">Email</label>
              <input
                id="user-email"
                type="email"
                name="email"
                className="workspace-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="workspace-field-group">
              <label htmlFor="user-role">Role</label>
              <select
                id="user-role"
                name="role"
                className="workspace-select"
                value={formData.role}
                onChange={handleChange}
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="workspace-field-group">
              <label htmlFor="user-password">
                {isEditMode ? "New Password" : "Password"}
              </label>
              <input
                id="user-password"
                type="password"
                name="password"
                className="workspace-input"
                value={formData.password}
                onChange={handleChange}
                minLength="6"
                required={!isEditMode}
                placeholder={isEditMode ? "Leave blank to keep current password" : ""}
              />
            </div>

            <div className="workspace-form-actions">
              <button type="submit" className="workspace-btn-primary">
                {isEditMode ? "Save User" : "Create User"}
              </button>
              <button
                type="button"
                className="workspace-btn-secondary"
                onClick={() => navigate("/users")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <aside className="workspace-surface">
          <div className="workspace-surface-header">
            <div>
              <h3>Role Guide</h3>
              <p>Use roles consistently so the directory feels intentional.</p>
            </div>
          </div>

          <div className="workspace-tip-list">
            <div className="workspace-tip-card">
              <strong>Support Engineer</strong>
              <p>Best for teammates who actively triage and resolve incoming issues.</p>
            </div>
            <div className="workspace-tip-card">
              <strong>Software, QA, and DevOps</strong>
              <p>Use these for delivery teams when the ticket belongs with engineering, testing, or platform support.</p>
            </div>
            <div className="workspace-tip-card">
              <strong>Customer, Admin, or User</strong>
              <p>These work well for requesters, managers, and general system participants who are not default queue owners.</p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default UserForm;
