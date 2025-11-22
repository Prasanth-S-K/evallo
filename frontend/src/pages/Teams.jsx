import React, { useState, useEffect } from "react";
import { teamService } from "../services/teamService";
import TeamForm from "../components/TeamForm";
import "./Management.css";

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const result = await teamService.getAll();
      if (result.success) setTeams(result.data);
    } catch (err) {
      setError("Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (teamData) => {
    try {
      const result = await teamService.create(teamData);
      if (result.success) {
        setShowForm(false);
        loadTeams();
      }
    } catch (err) {
      setError(err.message || "Failed to create team");
    }
  };

  const handleUpdate = async (teamData) => {
    try {
      const result = await teamService.update(editingTeam.id, teamData);
      if (result.success) {
        setShowForm(false);
        setEditingTeam(null);
        loadTeams();
      }
    } catch (err) {
      setError(err.message || "Failed to update team");
    }
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm("Are you sure you want to delete this team?")) return;

    try {
      const result = await teamService.delete(teamId);
      if (result.success) {
        loadTeams();
      }
    } catch (err) {
      setError(err.message || "Failed to delete team");
    }
  };

  // FIX: Handle edit button click
  const handleEditClick = (team) => {
    setEditingTeam(team);
    setShowForm(true);
  };

  // FIX: Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTeam(null);
  };

  if (loading) return <div className="loading">Loading teams...</div>;

  return (
    <div className="management-page">
      <div className="page-header">
        <h2>Teams Management</h2>
        <button
          className="btn-primary"
          onClick={() => {
            setEditingTeam(null);
            setShowForm(true);
          }}
        >
          Add Team
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="items-grid">
        {teams.map((team) => (
          <div key={team.id} className="item-card">
            <div className="item-header">
              <h3>{team.name}</h3>
              <div className="item-actions">
                <button
                  className="btn-secondary"
                  onClick={() => handleEditClick(team)} // Use fixed handler
                >
                  Edit
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(team.id)}
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="item-details">
              <p>
                <strong>Description:</strong>{" "}
                {team.description || "No description"}
              </p>
              <p>
                <strong>Employees:</strong>{" "}
                {team.Employees ? team.Employees.length : 0} members
              </p>
              {team.Employees && team.Employees.length > 0 && (
                <div className="employee-list">
                  <strong>Team Members:</strong>
                  <ul>
                    {team.Employees.map((employee) => (
                      <li key={employee.id}>
                        {employee.first_name} {employee.last_name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="empty-state">
          <p>No teams found. Create your first team!</p>
        </div>
      )}

      {/* Team Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <TeamForm
              team={editingTeam}
              onSubmit={editingTeam ? handleUpdate : handleCreate}
              onCancel={handleFormCancel} // Use fixed cancel handler
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
