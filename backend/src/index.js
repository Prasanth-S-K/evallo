const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { initDB } = require("./db");
const authMiddleware = require("./middlewares/authMiddleware");
const employeeRoutes = require("./routes/employees");
const teamRoutes = require("./routes/teams");
const logRoutes = require("./routes/logs");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/employees", authMiddleware, employeeRoutes);
app.use("/api/teams", authMiddleware, teamRoutes);
app.use("/api/logs", authMiddleware, logRoutes);

let db; // Store database instance

// Initialize database on startup
initDB()
  .then((database) => {
    db = database;

    // Make models available to routes
    app.set("models", db.models);

    console.log("✅ HRMS Backend ready!");
  })
  .catch((error) => {
    console.error("❌ Failed to start backend:", error);
  });

// Import routes
const authRoutes = require("./routes/auth");

// Use routes
app.use("/api/auth", authRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({
    message: "HRMS Backend is running!",
    timestamp: new Date().toISOString(),
  });
});

// Test database connection and models
app.get("/api/test", async (req, res) => {
  try {
    const models = req.app.get("models");
    const organisations = await models.Organisation.findAll();
    const users = await models.User.findAll();
    const employees = await models.Employee.findAll();
    const teams = await models.Team.findAll();

    res.json({
      success: true,
      data: {
        organisations: organisations.length,
        users: users.length,
        employees: employees.length,
        teams: teams.length,
      },
      message: "Database test successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Protected test route (requires auth)
app.get("/api/protected-test", async (req, res) => {
  try {
    const authMiddleware = require("./middlewares/authMiddleware");

    // Use auth middleware for this route
    authMiddleware(req, res, () => {
      res.json({
        success: true,
        message: "Access granted to protected route!",
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
        },
        organisation: {
          id: req.organisation_id,
        },
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
