import React, { useState, useEffect } from "react";
import { employeeService } from "../services/employeeService";
import { teamService } from "../services/teamService";
import EmployeeForm from "../components/EmployeeForm";
import TeamAssignment from "../components/TeamAssignment";
import "./Management.css";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showTeamAssignment, setShowTeamAssignment] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [employeesRes, teamsRes] = await Promise.all([
        employeeService.getAll(),
        teamService.getAll(),
      ]);

      if (employeesRes.success) setEmployees(employeesRes.data);
      if (teamsRes.success) setTeams(teamsRes.data);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (employeeData) => {
    try {
      const result = await employeeService.create(employeeData);
      if (result.success) {
        setShowForm(false);
        loadData();
      }
    } catch (err) {
      setError(err.message || "Failed to create employee");
    }
  };

  const handleUpdate = async (employeeData) => {
    try {
      const result = await employeeService.update(
        editingEmployee.id,
        employeeData
      );
      if (result.success) {
        setShowForm(false);
        setEditingEmployee(null);
        loadData();
      }
    } catch (err) {
      setError(err.message || "Failed to update employee");
    }
  };

  const handleDelete = async (employeeId) => {
    if (!window.confirm("Are you sure you want to delete this employee?"))
      return;

    try {
      const result = await employeeService.delete(employeeId);
      if (result.success) {
        loadData();
      }
    } catch (err) {
      setError(err.message || "Failed to delete employee");
    }
  };

  const handleTeamAssignment = async (employeeId, teamIds) => {
    try {
      // For each team assignment, call the assign endpoint
      const assignments = teamIds.map((teamId) =>
        teamService.assignEmployee(teamId, employeeId)
      );

      await Promise.all(assignments);
      setShowTeamAssignment(null);
      loadData(); // Refresh data to show updated assignments
    } catch (err) {
      setError(err.message || "Failed to assign teams");
    }
  };

  // FIX: Handle edit button click - open form and set employee to edit
  const handleEditClick = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  // FIX: Handle form cancel - reset both states
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  if (loading) return <div className="loading">Loading employees...</div>;

  return (
    <div className="management-page">
      <div className="page-header">
        <h2>Employees Management</h2>
        <button
          className="btn-primary"
          onClick={() => {
            setEditingEmployee(null); // Clear any editing employee
            setShowForm(true); // Open form for new employee
          }}
        >
          Add Employee
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="items-grid">
        {employees.map((employee) => (
          <div key={employee.id} className="item-card">
            <div className="item-header">
              <h3>
                {employee.first_name} {employee.last_name}
              </h3>
              <div className="item-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setShowTeamAssignment(employee)}
                >
                  Assign Teams
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => handleEditClick(employee)} // Use fixed handler
                >
                  Edit
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(employee.id)}
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="item-details">
              <p>
                <strong>Email:</strong> {employee.email}
              </p>
              <p>
                <strong>Phone:</strong> {employee.phone}
              </p>
              <p>
                <strong>Teams:</strong>
                {employee.Teams && employee.Teams.length > 0
                  ? employee.Teams.map((team) => team.name).join(", ")
                  : "No teams assigned"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {employees.length === 0 && (
        <div className="empty-state">
          <p>No employees found. Create your first employee!</p>
        </div>
      )}

      {/* Employee Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <EmployeeForm
              employee={editingEmployee}
              onSubmit={editingEmployee ? handleUpdate : handleCreate}
              onCancel={handleFormCancel} // Use fixed cancel handler
            />
          </div>
        </div>
      )}

      {/* Team Assignment Modal */}
      {showTeamAssignment && (
        <div className="modal-overlay">
          <div className="modal">
            <TeamAssignment
              employee={showTeamAssignment}
              teams={teams}
              onSubmit={handleTeamAssignment}
              onCancel={() => setShowTeamAssignment(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
