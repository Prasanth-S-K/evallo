const express = require("express");
const router = express.Router();

// Get all teams for organisation
router.get("/", async (req, res) => {
  try {
    const models = req.app.get("models");
    const { Team, Organisation, Employee } = models;

    const teams = await Team.findAll({
      where: { organisation_id: req.organisation_id },
      include: [
        {
          model: Organisation,
          attributes: ["id", "name"],
        },
        {
          model: Employee,
          through: { attributes: [] }, // Exclude join table attributes
          attributes: ["id", "first_name", "last_name", "email"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      data: teams,
    });
  } catch (error) {
    console.error("Get teams error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch teams",
    });
  }
});

// Get single team
router.get("/:id", async (req, res) => {
  try {
    const models = req.app.get("models");
    const { Team, Organisation, Employee } = models;

    const team = await Team.findOne({
      where: {
        id: req.params.id,
        organisation_id: req.organisation_id,
      },
      include: [
        {
          model: Organisation,
          attributes: ["id", "name"],
        },
        {
          model: Employee,
          through: { attributes: [] },
          attributes: ["id", "first_name", "last_name", "email"],
        },
      ],
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        error: "Team not found",
      });
    }

    res.json({
      success: true,
      data: team,
    });
  } catch (error) {
    console.error("Get team error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch team",
    });
  }
});

// Create team
router.post("/", async (req, res) => {
  try {
    const models = req.app.get("models");
    const { Team, Log } = models;

    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Team name is required",
      });
    }

    const team = await Team.create({
      organisation_id: req.organisation_id,
      name,
      description,
      created_at: new Date(),
    });

    // Log the action
    await Log.create({
      organisation_id: req.organisation_id,
      user_id: req.user.id,
      action: "TEAM_CREATED",
      meta: JSON.stringify({
        team_id: team.id,
        team_name: name,
      }),
      timestamp: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Team created successfully",
      data: team,
    });
  } catch (error) {
    console.error("Create team error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create team",
    });
  }
});

// Update team
router.put("/:id", async (req, res) => {
  try {
    const models = req.app.get("models");
    const { Team, Log } = models;

    const { name, description } = req.body;

    const team = await Team.findOne({
      where: {
        id: req.params.id,
        organisation_id: req.organisation_id,
      },
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        error: "Team not found",
      });
    }

    // Update team
    await team.update({
      name: name || team.name,
      description: description !== undefined ? description : team.description,
    });

    // Log the action
    await Log.create({
      organisation_id: req.organisation_id,
      user_id: req.user.id,
      action: "TEAM_UPDATED",
      meta: JSON.stringify({
        team_id: team.id,
        updates: { name, description },
      }),
      timestamp: new Date(),
    });

    res.json({
      success: true,
      message: "Team updated successfully",
      data: team,
    });
  } catch (error) {
    console.error("Update team error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update team",
    });
  }
});

// Delete team
router.delete("/:id", async (req, res) => {
  try {
    const models = req.app.get("models");
    const { Team, Log } = models;

    const team = await Team.findOne({
      where: {
        id: req.params.id,
        organisation_id: req.organisation_id,
      },
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        error: "Team not found",
      });
    }

    // Log before deletion
    await Log.create({
      organisation_id: req.organisation_id,
      user_id: req.user.id,
      action: "TEAM_DELETED",
      meta: JSON.stringify({
        team_id: team.id,
        team_name: team.name,
      }),
      timestamp: new Date(),
    });

    await team.destroy();

    res.json({
      success: true,
      message: "Team deleted successfully",
    });
  } catch (error) {
    console.error("Delete team error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete team",
    });
  }
});

// Assign employee to team
router.post("/:teamId/assign", async (req, res) => {
  try {
    const models = req.app.get("models");
    const { Team, Employee, EmployeeTeam, Log } = models;

    const { employeeId, employeeIds } = req.body;
    const teamId = req.params.teamId;

    // Check if team exists and belongs to organisation
    const team = await Team.findOne({
      where: {
        id: teamId,
        organisation_id: req.organisation_id,
      },
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        error: "Team not found",
      });
    }

    const employeeIdsToAssign = employeeIds || [employeeId];

    if (!employeeIdsToAssign.length) {
      return res.status(400).json({
        success: false,
        error: "No employee IDs provided",
      });
    }

    // Check if employees exist and belong to organisation
    const employees = await Employee.findAll({
      where: {
        id: employeeIdsToAssign,
        organisation_id: req.organisation_id,
      },
    });

    if (employees.length !== employeeIdsToAssign.length) {
      return res.status(404).json({
        success: false,
        error: "One or more employees not found",
      });
    }

    // Create assignments
    const assignments = await Promise.all(
      employeeIdsToAssign.map((empId) =>
        EmployeeTeam.findOrCreate({
          where: { employee_id: empId, team_id: teamId },
          defaults: { assigned_at: new Date() },
        })
      )
    );

    // Log the action
    await Log.create({
      organisation_id: req.organisation_id,
      user_id: req.user.id,
      action: "EMPLOYEES_ASSIGNED_TO_TEAM",
      meta: JSON.stringify({
        team_id: teamId,
        employee_ids: employeeIdsToAssign,
      }),
      timestamp: new Date(),
    });

    res.json({
      success: true,
      message: `Successfully assigned ${employeeIdsToAssign.length} employee(s) to team`,
      data: {
        team: team.name,
        assigned_employees: employees.map((emp) => ({
          id: emp.id,
          name: `${emp.first_name} ${emp.last_name}`,
        })),
      },
    });
  } catch (error) {
    console.error("Assign employee error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to assign employee to team",
    });
  }
});

// Unassign employee from team
router.delete("/:teamId/unassign", async (req, res) => {
  try {
    const models = req.app.get("models");
    const { Team, Employee, EmployeeTeam, Log } = models;

    const { employeeId } = req.body;
    const teamId = req.params.teamId;

    // Check if team exists and belongs to organisation
    const team = await Team.findOne({
      where: {
        id: teamId,
        organisation_id: req.organisation_id,
      },
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        error: "Team not found",
      });
    }

    // Check if employee exists and belongs to organisation
    const employee = await Employee.findOne({
      where: {
        id: employeeId,
        organisation_id: req.organisation_id,
      },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    // Remove assignment
    const result = await EmployeeTeam.destroy({
      where: {
        employee_id: employeeId,
        team_id: teamId,
      },
    });

    if (result === 0) {
      return res.status(404).json({
        success: false,
        error: "Employee is not assigned to this team",
      });
    }

    // Log the action
    await Log.create({
      organisation_id: req.organisation_id,
      user_id: req.user.id,
      action: "EMPLOYEE_UNASSIGNED_FROM_TEAM",
      meta: JSON.stringify({
        team_id: teamId,
        employee_id: employeeId,
      }),
      timestamp: new Date(),
    });

    res.json({
      success: true,
      message: "Employee unassigned from team successfully",
    });
  } catch (error) {
    console.error("Unassign employee error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to unassign employee from team",
    });
  }
});

module.exports = router;
