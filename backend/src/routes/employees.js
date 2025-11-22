const express = require("express");
const router = express.Router();

// Get all employees for organisation
router.get("/", async (req, res) => {
  try {
    const models = req.app.get("models");
    const { Employee, Organisation, Team } = models; // Add Team here

    const employees = await Employee.findAll({
      where: { organisation_id: req.organisation_id },
      include: [
        {
          model: Organisation,
          attributes: ["id", "name"],
        },
        {
          model: Team, // Add this to include teams
          through: { attributes: [] }, // Exclude join table attributes
          attributes: ["id", "name", "description"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      data: employees,
    });
  } catch (error) {
    console.error("Get employees error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch employees",
    });
  }
});

// Get single employee
router.get("/:id", async (req, res) => {
  try {
    const models = req.app.get("models");
    const { Employee, Organisation, Team } = models; // Add Team here

    const employee = await Employee.findOne({
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
          model: Team, // Add this to include teams
          through: { attributes: [] },
          attributes: ["id", "name", "description"],
        },
      ],
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Get employee error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch employee",
    });
  }
});

// Create employee
router.post("/", async (req, res) => {
  try {
    const models = req.app.get("models");
    const { Employee, Log } = models;

    const { first_name, last_name, email, phone } = req.body;

    // Basic validation
    if (!first_name || !last_name) {
      return res.status(400).json({
        success: false,
        error: "First name and last name are required",
      });
    }

    const employee = await Employee.create({
      organisation_id: req.organisation_id,
      first_name,
      last_name,
      email,
      phone,
      created_at: new Date(),
    });

    // Log the action
    await Log.create({
      organisation_id: req.organisation_id,
      user_id: req.user.id,
      action: "EMPLOYEE_CREATED",
      meta: JSON.stringify({
        employee_id: employee.id,
        employee_name: `${first_name} ${last_name}`,
      }),
      timestamp: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employee,
    });
  } catch (error) {
    console.error("Create employee error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create employee",
    });
  }
});

// Update employee
router.put("/:id", async (req, res) => {
  try {
    const models = req.app.get("models");
    const { Employee, Log } = models;

    const { first_name, last_name, email, phone } = req.body;

    const employee = await Employee.findOne({
      where: {
        id: req.params.id,
        organisation_id: req.organisation_id,
      },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    // Update employee
    await employee.update({
      first_name: first_name || employee.first_name,
      last_name: last_name || employee.last_name,
      email: email || employee.email,
      phone: phone || employee.phone,
    });

    // Log the action
    await Log.create({
      organisation_id: req.organisation_id,
      user_id: req.user.id,
      action: "EMPLOYEE_UPDATED",
      meta: JSON.stringify({
        employee_id: employee.id,
        updates: { first_name, last_name, email, phone },
      }),
      timestamp: new Date(),
    });

    res.json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (error) {
    console.error("Update employee error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update employee",
    });
  }
});

// Delete employee
router.delete("/:id", async (req, res) => {
  try {
    const models = req.app.get("models");
    const { Employee, Log } = models;

    const employee = await Employee.findOne({
      where: {
        id: req.params.id,
        organisation_id: req.organisation_id,
      },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    // Log before deletion
    await Log.create({
      organisation_id: req.organisation_id,
      user_id: req.user.id,
      action: "EMPLOYEE_DELETED",
      meta: JSON.stringify({
        employee_id: employee.id,
        employee_name: `${employee.first_name} ${employee.last_name}`,
      }),
      timestamp: new Date(),
    });

    await employee.destroy();

    res.json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("Delete employee error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete employee",
    });
  }
});

module.exports = router;
