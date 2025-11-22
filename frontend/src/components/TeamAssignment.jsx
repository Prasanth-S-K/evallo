import React, { useState, useEffect } from "react";

const TeamAssignment = ({ employee, teams, onSubmit, onCancel }) => {
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Pre-select teams that the employee is already assigned to
    if (employee && employee.Teams) {
      const assignedTeamIds = employee.Teams.map((team) => team.id);
      setSelectedTeams(assignedTeamIds);
    }
  }, [employee]);

  const handleTeamToggle = (teamId) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(employee.id, selectedTeams);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-modal">
      <h3>
        Assign Teams to {employee.first_name} {employee.last_name}
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="team-selection">
          <label>Select Teams:</label>
          <div className="teams-checklist">
            {teams.map((team) => (
              <div key={team.id} className="checkbox-item">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedTeams.includes(team.id)}
                    onChange={() => handleTeamToggle(team.id)}
                  />
                  <span className="checkmark"></span>
                  {team.name}
                  {team.description && (
                    <span className="team-description">
                      {" "}
                      - {team.description}
                    </span>
                  )}
                </label>
              </div>
            ))}
          </div>
        </div>

        {teams.length === 0 && (
          <p className="no-teams">No teams available. Create teams first.</p>
        )}

        <div className="form-actions">
          <button type="button" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || teams.length === 0}
            className="btn-primary"
          >
            {loading ? "Assigning..." : "Assign Teams"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeamAssignment;
