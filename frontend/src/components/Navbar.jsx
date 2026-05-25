import "../styles/Navbar.css";

import { NavLink } from "react-router-dom";
import { useAuth } from "../authContext.js";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg custom-navbar px-3">
      <NavLink className="navbar-brand" to="/">
        <span className="navbar-brand-badge">
          <img
            src="/resolvehub-icon.png"
            alt="ResolveHub icon"
            className="navbar-brand-logo"
          />
        </span>
        <span className="navbar-brand-copy">
          <span className="navbar-brand-name">ResolveHub</span>
          <span className="navbar-brand-tagline">From Incident to Insight</span>
        </span>
      </NavLink>

      <button
        className="navbar-toggler custom-navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav ms-auto">
          {!isAuthenticated ? (
            <>
              <li className="nav-item">
                <NavLink className="nav-link" to="/login">
                  Login
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link" to="/register">
                  Register
                </NavLink>
              </li>
            </>
          ) : (
            <>

              <li className="nav-item">
                <NavLink className="nav-link" to="/">
                  Dashboard
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link" to="/tickets">
                  Tickets
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link" to="/create">
                  New Ticket
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link" to="/users">
                  Users
                </NavLink>
              </li>

              <li className="nav-item">
                <span className="nav-link">{user?.name}</span>
              </li>

              <li className="nav-item">
                <button className="nav-link navbar-logout-btn" onClick={logout}>
                  Logout
                </button>
              </li>
            </>
          )}

        </ul>
      </div>
    </nav>
  );
}
