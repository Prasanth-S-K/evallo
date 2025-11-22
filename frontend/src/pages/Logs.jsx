import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import "./Logs.css";

const Logs = () => {
  const [allLogs, setAllLogs] = useState([]); // Store all logs from API
  const [filteredLogs, setFilteredLogs] = useState([]); // Store filtered logs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    user_id: "",
    action: "",
    start_date: "",
    end_date: "",
    employee_id: "",
  });

  // Load all logs on component mount
  useEffect(() => {
    loadAllLogs();
  }, []);

  // Filter logs whenever filters change
  useEffect(() => {
    applyFilters();
  }, [filters, allLogs]);

  // Load all logs from API
  const loadAllLogs = async () => {
    try {
      setLoading(true);
      const result = await api.get("/logs?limit=1000"); // Get more logs initially

      if (result.success) {
        setAllLogs(result.data.logs);
      }
    } catch (err) {
      setError("Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to allLogs
  const applyFilters = () => {
    if (allLogs.length === 0) return;

    let filtered = [...allLogs];

    // Filter by user_id
    if (filters.user_id) {
      filtered = filtered.filter(
        (log) => log.user_id && log.user_id.toString().includes(filters.user_id)
      );
    }

    // Filter by action
    if (filters.action) {
      filtered = filtered.filter((log) =>
        log.action.toLowerCase().includes(filters.action.toLowerCase())
      );
    }

    // Filter by date range
    if (filters.start_date) {
      const startDate = new Date(filters.start_date);
      filtered = filtered.filter((log) => new Date(log.timestamp) >= startDate);
    }

    if (filters.end_date) {
      const endDate = new Date(filters.end_date);
      endDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter((log) => new Date(log.timestamp) <= endDate);
    }

    // Filter by employee_id (in meta data)
    if (filters.employee_id) {
      filtered = filtered.filter((log) => {
        try {
          const meta =
            typeof log.meta === "string" ? JSON.parse(log.meta) : log.meta;
          return (
            meta.employee_id == filters.employee_id ||
            (meta.employee_ids &&
              meta.employee_ids.includes(parseInt(filters.employee_id))) ||
            (meta.assigned_employees &&
              meta.assigned_employees.some(
                (emp) => emp.id == filters.employee_id
              ))
          );
        } catch {
          return false;
        }
      });
    }

    setFilteredLogs(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      user_id: "",
      action: "",
      start_date: "",
      end_date: "",
      employee_id: "",
    });
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const parseMeta = (meta) => {
    try {
      return typeof meta === "string" ? JSON.parse(meta) : meta;
    } catch {
      return { raw: meta };
    }
  };

  const getActionColor = (action) => {
    if (action.includes("CREATE") || action.includes("REGISTER"))
      return "green";
    if (action.includes("UPDATE") || action.includes("EDIT")) return "blue";
    if (action.includes("DELETE") || action.includes("REMOVE")) return "red";
    if (action.includes("LOGIN")) return "purple";
    if (action.includes("ASSIGN")) return "orange";
    return "gray";
  };

  const getEmployeeInfo = (log) => {
    const meta = parseMeta(log.meta);

    if (meta.employee_id) {
      return `Employee ID: ${meta.employee_id}`;
    }

    if (meta.employee_ids && Array.isArray(meta.employee_ids)) {
      return `Employee IDs: ${meta.employee_ids.join(", ")}`;
    }

    if (meta.assigned_employees && Array.isArray(meta.assigned_employees)) {
      return `Assigned: ${meta.assigned_employees
        .map((emp) => `${emp.name} (ID: ${emp.id})`)
        .join(", ")}`;
    }

    return null;
  };

  if (loading) return <div className="loading">Loading logs...</div>;

  return (
    <div className="logs-page">
      <div className="page-header">
        <h2>Audit Logs</h2>
        <div className="help-text">
          <small>
            <strong>User ID:</strong> Who performed the action |
            <strong> Employee ID:</strong> Which employee record was affected |
            <strong> Instant Filtering:</strong> Filters apply immediately
          </small>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <strong>Total Logs:</strong> {allLogs.length}
        </div>
        <div className="stat-item">
          <strong>Filtered:</strong> {filteredLogs.length}
        </div>
        <div className="stat-item">
          <strong>Showing:</strong> {Math.min(filteredLogs.length, 50)} of{" "}
          {filteredLogs.length}
        </div>
      </div>

      {/* Filters */}
      <div className="logs-filters">
        <div className="filter-group">
          <label>User ID (Performer):</label>
          <input
            type="text"
            value={filters.user_id}
            onChange={(e) => handleFilterChange("user_id", e.target.value)}
            placeholder="Filter by user who performed action"
          />
        </div>

        <div className="filter-group">
          <label>Employee ID (Target):</label>
          <input
            type="text"
            value={filters.employee_id}
            onChange={(e) => handleFilterChange("employee_id", e.target.value)}
            placeholder="Filter by employee record affected"
          />
        </div>

        <div className="filter-group">
          <label>Action Type:</label>
          <input
            type="text"
            value={filters.action}
            onChange={(e) => handleFilterChange("action", e.target.value)}
            placeholder="Filter by action type"
          />
        </div>

        <div className="filter-group">
          <label>From Date:</label>
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => handleFilterChange("start_date", e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>To Date:</label>
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => handleFilterChange("end_date", e.target.value)}
          />
        </div>

        <div className="filter-actions">
          <button onClick={clearFilters} className="btn-secondary">
            Clear Filters
          </button>

          <button onClick={loadAllLogs} className="btn-primary">
            Refresh Data
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="logs-table-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Performed By</th>
              <th>Action</th>
              <th>Target Employee(s)</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.slice(0, 50).map((log) => {
              // Show first 50 results
              const meta = parseMeta(log.meta);
              const employeeInfo = getEmployeeInfo(log);

              return (
                <tr key={log.id}>
                  <td className="timestamp">
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td className="user">
                    {log.User ? (
                      <div>
                        <div className="user-name">{log.User.name}</div>
                        <div className="user-email">{log.User.email}</div>
                        <div className="user-id">User ID: {log.User.id}</div>
                      </div>
                    ) : (
                      "System"
                    )}
                  </td>
                  <td className="action">
                    <span
                      className={`action-badge ${getActionColor(log.action)}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="employee-info">
                    {employeeInfo ? (
                      <div className="employee-details">{employeeInfo}</div>
                    ) : (
                      <span className="no-employee">N/A</span>
                    )}
                  </td>
                  <td className="details">
                    <div className="meta-details">
                      {Object.entries(meta).map(([key, value]) => (
                        <div key={key} className="meta-item">
                          <strong>{key}:</strong> {JSON.stringify(value)}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Results Info */}
      {filteredLogs.length > 50 && (
        <div className="results-info">
          <p>
            Showing first 50 of {filteredLogs.length} results. Use filters to
            narrow down results.
          </p>
        </div>
      )}

      {filteredLogs.length === 0 && !loading && (
        <div className="empty-state">
          <p>No logs found matching your filters.</p>
          <button onClick={clearFilters} className="btn-primary">
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Logs;
