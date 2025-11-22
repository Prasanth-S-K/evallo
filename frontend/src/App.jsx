import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { authService } from "./services/auth";
import Login from "./pages/Login";
import RegisterOrganisation from "./pages/RegisterOrganisation";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Teams from "./pages/Teams";
import "./App.css";
import Logs from "./pages/Logs";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on app load
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <Login onLogin={() => setIsAuthenticated(true)} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/register"
            element={
              !isAuthenticated ? (
                <RegisterOrganisation
                  onRegister={() => setIsAuthenticated(true)}
                />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <Dashboard onLogout={() => setIsAuthenticated(false)} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/employees"
            element={
              isAuthenticated ? (
                <Dashboard onLogout={() => setIsAuthenticated(false)}>
                  <Employees />
                </Dashboard>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/teams"
            element={
              isAuthenticated ? (
                <Dashboard onLogout={() => setIsAuthenticated(false)}>
                  <Teams />
                </Dashboard>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/logs"
            element={
              isAuthenticated ? (
                <Dashboard onLogout={() => setIsAuthenticated(false)}>
                  <Logs />
                </Dashboard>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
