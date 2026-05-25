import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import { STATUS_MAP, PRIORITY_MAP } from "../utils";
import "../styles/Dashboard.css";

import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const STATUS_COLORS = ["#ff6b57", "#f2b134", "#22a06b"];
const PRIORITY_COLORS = ["#ca3c66", "#f0b44c", "#4c7cf0"];

const Dashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    async function fetchTickets() {
      try {
        const res = await API.get("/tickets");
        const allTickets = Array.isArray(res.data) ? res.data : [];

        setTickets(allTickets);

        const activityFeed = allTickets
          .map((ticket) => ({
            id: ticket.id,
            title: ticket.title,
            status: ticket.status,
            priority: ticket.priority,
            updated_at: ticket.updated_at || ticket.created_at,
          }))
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
          .slice(0, 5);

        setActivity(activityFeed);
      } catch (err) {
        console.error("Error fetching tickets:", err);
        setTickets([]);
        setActivity([]);
      }
    }

    fetchTickets();
  }, []);

  const total = tickets.length;
  const open = tickets.filter((ticket) => ticket.status === 1).length;
  const inProgress = tickets.filter((ticket) => ticket.status === 2).length;
  const resolved = tickets.filter((ticket) => ticket.status === 3).length;

  const high = tickets.filter((ticket) => ticket.priority === 3).length;
  const medium = tickets.filter((ticket) => ticket.priority === 2).length;
  const low = tickets.filter((ticket) => ticket.priority === 1).length;

  const resolutionRate = total === 0 ? 0 : Math.round((resolved / total) * 100);
  const focusTickets = [...tickets]
    .filter((ticket) => ticket.priority === 3 || ticket.status !== 3)
    .sort((a, b) => {
      const priorityDelta = (b.priority || 0) - (a.priority || 0);
      if (priorityDelta !== 0) {
        return priorityDelta;
      }
      return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
    })
    .slice(0, 4);

  return (
    <div className="dashboard-shell">
      <section className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <span className="dashboard-eyebrow">Support Operations Dashboard</span>
          <h1 className="dashboard-title">What needs attention.</h1>
          <p className="dashboard-subtitle">
            Track open work, watch backlog health, and jump directly into the
            next ticket or user action without digging through tables first.
          </p>

          <div className="dashboard-actions">
            <Link to="/create" className="btn dashboard-primary-action">
              Create Ticket
            </Link>
            <Link to="/tickets" className="btn dashboard-secondary-action">
              View All Tickets
            </Link>
            <Link to="/users/new" className="btn dashboard-tertiary-action">
              Add User
            </Link>
          </div>
        </div>

        <div className="dashboard-hero-panel">
          <div className="dashboard-hero-panel-label">Queue Health</div>
          <div className="dashboard-hero-panel-value">{resolutionRate}%</div>
          <div className="dashboard-hero-panel-text">
            of all tickets are currently resolved.
          </div>

          <div className="dashboard-mini-stats">
            <div className="dashboard-mini-stat">
              <span>Open queue</span>
              <strong>{open}</strong>
            </div>
            <div className="dashboard-mini-stat">
              <span>In progress</span>
              <strong>{inProgress}</strong>
            </div>
            <div className="dashboard-mini-stat">
              <span>High priority</span>
              <strong>{high}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-kpis">
        <article className="dashboard-kpi-card">
          <span className="dashboard-kpi-label">Total Tickets</span>
          <strong className="dashboard-kpi-value">{total}</strong>
          <p className="dashboard-kpi-note">All tickets currently tracked in the system.</p>
        </article>

        <article className="dashboard-kpi-card">
          <span className="dashboard-kpi-label">Open Issues</span>
          <strong className="dashboard-kpi-value">{open}</strong>
          <p className="dashboard-kpi-note">Work waiting to be picked up or triaged.</p>
        </article>

        <article className="dashboard-kpi-card">
          <span className="dashboard-kpi-label">Resolved</span>
          <strong className="dashboard-kpi-value">{resolved}</strong>
          <p className="dashboard-kpi-note">Completed work contributing to closure rate.</p>
        </article>

        <article className="dashboard-kpi-card">
          <span className="dashboard-kpi-label">Critical Focus</span>
          <strong className="dashboard-kpi-value">{high}</strong>
          <p className="dashboard-kpi-note">High-priority tickets that need fast attention.</p>
        </article>
      </section>

      <section className="dashboard-charts">
        <article className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <h2>Status Breakdown</h2>
              <p>See how the queue is distributed across ticket lifecycle stages.</p>
            </div>
          </div>

          <div className="dashboard-chart-wrap dashboard-chart-wrap-pie">
            <Pie
              data={{
                labels: ["Open", "In Progress", "Resolved"],
                datasets: [
                  {
                    data: [open, inProgress, resolved],
                    backgroundColor: STATUS_COLORS,
                    borderWidth: 0,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      usePointStyle: true,
                      boxWidth: 10,
                      padding: 18,
                    },
                  },
                },
              }}
            />
          </div>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <h2>Priority Breakdown</h2>
              <p>Understand the pressure level across your current backlog.</p>
            </div>
          </div>

          <div className="dashboard-chart-wrap">
            <Bar
              data={{
                labels: ["High", "Medium", "Low"],
                datasets: [
                  {
                    label: "Tickets",
                    data: [high, medium, low],
                    backgroundColor: PRIORITY_COLORS,
                    borderRadius: 12,
                    borderSkipped: false,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                scales: {
                  x: {
                    grid: { display: false },
                  },
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0,
                    },
                  },
                },
                plugins: {
                  legend: { display: false },
                },
              }}
            />
          </div>
        </article>
      </section>

      <section className="dashboard-bottom-grid">
        <article className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <h2>Priority Queue</h2>
              <p>The tickets most likely to deserve immediate attention.</p>
            </div>
            <Link to="/tickets" className="dashboard-inline-link">
              View all
            </Link>
          </div>

          {focusTickets.length === 0 ? (
            <div className="dashboard-empty-state">
              No tickets yet. Create the first one to start tracking work.
            </div>
          ) : (
            <div className="dashboard-focus-list">
              {focusTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  to={`/ticket/${ticket.id}`}
                  className="dashboard-focus-item"
                >
                  <div className="dashboard-focus-main">
                    <span className="dashboard-focus-title">{ticket.title}</span>
                    <span className="dashboard-focus-meta">
                      Ticket #{ticket.id}
                    </span>
                  </div>

                  <div className="dashboard-focus-badges">
                    <span className={`dashboard-badge status-${ticket.status}`}>
                      {STATUS_MAP[ticket.status] || "Unknown"}
                    </span>
                    <span className={`dashboard-badge priority-${ticket.priority}`}>
                      {PRIORITY_MAP[ticket.priority] || "Unknown"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <h2>Recent Activity</h2>
              <p>Most recently updated tickets across the workspace.</p>
            </div>
          </div>

          {activity.length === 0 ? (
            <div className="dashboard-empty-state">
              No recent activity yet. Ticket updates will appear here.
            </div>
          ) : (
            <div className="dashboard-activity-list">
              {activity.map((item) => (
                <div key={item.id} className="dashboard-activity-item">
                  <div className="dashboard-activity-marker" />
                  <div className="dashboard-activity-content">
                    <div className="dashboard-activity-header">
                      <strong>{item.title}</strong>
                      <span className={`dashboard-badge status-${item.status}`}>
                        {STATUS_MAP[item.status] || "Unknown"}
                      </span>
                    </div>
                    <small className="dashboard-activity-time">
                      Updated {new Date(item.updated_at).toLocaleString()}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
};

export default Dashboard;
