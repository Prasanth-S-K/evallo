const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createLog } = require("../utils/logger");

const router = express.Router();

// Organisation Registration
router.post("/register", async (req, res) => {
  try {
    const models = req.app.get("models");
    const { Organisation, User, Log } = models;

    const { orgName, adminName, email, password } = req.body;

    // Validate input
    if (!orgName || !adminName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "All fields are required: orgName, adminName, email, password",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User with this email already exists",
      });
    }

    // Create organisation
    const organisation = await Organisation.create({
      name: orgName,
      created_at: new Date(),
    });

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      organisation_id: organisation.id,
      email,
      password_hash: hashedPassword,
      name: adminName,
      created_at: new Date(),
    });

    // Create log entry
    // await Log.create({
    //   organisation_id: organisation.id,
    //   user_id: user.id,
    //   action: "ORGANISATION_CREATED",
    //   meta: JSON.stringify({
    //     organisation_name: orgName,
    //     admin_email: email,
    //   }),
    //   timestamp: new Date(),
    // });
    // replaced the above code with below part
    await createLog(models, {
      organisation_id: organisation.id,
      user_id: user.id,
      action: "ORGANISATION_REGISTERED",
      meta: {
        organisation_name: orgName,
        admin_email: email,
        organisation_id: organisation.id,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        orgId: user.organisation_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(201).json({
      success: true,
      message: "Organisation and admin user created successfully",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        organisation: {
          id: organisation.id,
          name: organisation.name,
        },
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error during registration",
    });
  }
});

// User Login
// User Login
router.post("/login", async (req, res) => {
  try {
    const models = req.app.get("models");
    const { Organisation, User } = models;
    const { createLog } = require("../utils/logger"); // Add this import

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    // Find user with organisation
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Organisation,
          attributes: ["id", "name"],
        },
      ],
    });

    if (!user) {
      // Log failed login attempt (user not found)
      await createLog(models, {
        organisation_id: null,
        user_id: null,
        action: "USER_LOGIN_FAILED",
        meta: {
          attempted_email: email,
          reason: "User not found",
          ip: req.ip || req.connection.remoteAddress,
        },
      });

      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      // Log failed login attempt (wrong password)
      await createLog(models, {
        organisation_id: user.organisation_id,
        user_id: user.id,
        action: "USER_LOGIN_FAILED",
        meta: {
          attempted_email: email,
          reason: "Invalid password",
          ip: req.ip || req.connection.remoteAddress,
        },
      });

      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Log successful login
    await createLog(models, {
      organisation_id: user.organisation_id,
      user_id: user.id,
      action: "USER_LOGIN_SUCCESS",
      meta: {
        email: email,
        ip: req.ip || req.connection.remoteAddress,
        user_agent: req.get("User-Agent"),
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        orgId: user.organisation_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        organisation: {
          id: user.Organisation.id,
          name: user.Organisation.name,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error during login",
    });
  }
});

module.exports = router;
