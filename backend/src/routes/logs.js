const express = require("express");
const { Op } = require("sequelize"); // Import Op directly
const router = express.Router();

// Get logs with filtering (admin only)
router.get("/", async (req, res) => {
  try {
    const models = req.app.get("models");
    const { Log, User, Organisation } = models;

    // Extract query parameters for filtering
    const {
      user_id,
      action,
      start_date,
      end_date,
      page = 1,
      limit = 50,
    } = req.query;

    // Build where conditions
    const whereConditions = {
      organisation_id: req.organisation_id,
    };

    // Add user filter if provided
    if (user_id) {
      whereConditions.user_id = user_id;
    }

    // Add action filter if provided
    if (action) {
      whereConditions.action = {
        [Op.like]: `%${action}%`, // Use LIKE for partial matching
      };
    }

    // Add date range filter if provided
    if (start_date || end_date) {
      whereConditions.timestamp = {};

      if (start_date) {
        whereConditions.timestamp[Op.gte] = new Date(start_date);
      }

      if (end_date) {
        // Set end date to end of day
        const endDate = new Date(end_date);
        endDate.setHours(23, 59, 59, 999);
        whereConditions.timestamp[Op.lte] = endDate;
      }
    }

    const offset = (page - 1) * limit;

    const logs = await Log.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
          required: false,
        },
        {
          model: Organisation,
          attributes: ["id", "name"],
          required: false,
        },
      ],
      order: [["timestamp", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        logs: logs.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(logs.count / limit),
          totalItems: logs.count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get logs error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get log statistics
router.get("/stats", async (req, res) => {
  try {
    const models = req.app.get("models");
    const { Log, User, sequelize } = models; // Add sequelize here

    // Get action counts for the organisation
    const actionStats = await Log.findAll({
      where: {
        organisation_id: req.organisation_id,
      },
      attributes: [
        "action",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["action"],
      order: [[sequelize.fn("COUNT", sequelize.col("id")), "DESC"]],
    });

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await Log.count({
      where: {
        organisation_id: req.organisation_id,
        timestamp: {
          [Op.gte]: sevenDaysAgo,
        },
      },
    });

    // Get top users by activity
    const topUsers = await Log.findAll({
      where: {
        organisation_id: req.organisation_id,
      },
      attributes: [
        "user_id",
        [sequelize.fn("COUNT", sequelize.col("id")), "activity_count"],
      ],
      group: ["user_id"],
      order: [[sequelize.fn("COUNT", sequelize.col("id")), "DESC"]],
      limit: 5,
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
          required: false,
        },
      ],
    });

    res.json({
      success: true,
      data: {
        actionStats,
        recentActivity,
        topUsers,
      },
    });
  } catch (error) {
    console.error("Get log stats error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
