const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {
    const models = req.app.get("models");
    const { User, Organisation } = models;

    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      include: [
        {
          model: Organisation,
          attributes: ["id", "name"],
        },
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid token. User not found.",
      });
    }

    req.user = user;
    req.organisation_id = user.organisation_id;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({
      success: false,
      error: "Invalid token.",
    });
  }
};

module.exports = authMiddleware;
