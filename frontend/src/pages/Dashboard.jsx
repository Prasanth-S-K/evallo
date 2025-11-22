import React from "react";
import { Link, useLocation } from "react-router-dom";
import { authService } from "../services/auth";
import "./Dashboard.css";

const Dashboard = ({ onLogout, children }) => {
  const location = useLocation();
  const { user, organisation } = authService.getAuth();

  const handleLogout = () => {
    authService.logout();
    onLogout();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>HRMS - {organisation?.name}</h1>
          <div className="user-info">
            <span>Welcome, {user?.name}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="dashboard-nav">
        <Link
          to="/dashboard"
          className={
            location.pathname === "/dashboard" ? "nav-link active" : "nav-link"
          }
        >
          Dashboard
        </Link>
        <Link
          to="/employees"
          className={
            location.pathname === "/employees" ? "nav-link active" : "nav-link"
          }
        >
          Employees
        </Link>
        <Link
          to="/teams"
          className={
            location.pathname === "/teams" ? "nav-link active" : "nav-link"
          }
        >
          Teams
        </Link>

        <Link
          to="/logs"
          className={
            location.pathname === "/logs" ? "nav-link active" : "nav-link"
          }
        >
          Audit Logs
        </Link>
      </nav>

      <main className="dashboard-main">
        {children || (
          <div className="dashboard-welcome">
            <h2>Welcome to HRMS</h2>
            <p>Manage your employees and teams efficiently.</p>
            <div className="quick-stats">
              <div className="stat-card">
                <h3>Employees</h3>
                <p>Manage your workforce</p>
                <Link to="/employees" className="stat-link">
                  View Employees
                </Link>
              </div>
              <div className="stat-card">
                <h3>Teams</h3>
                <p>Organize by departments</p>
                <Link to="/teams" className="stat-link">
                  View Teams
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
