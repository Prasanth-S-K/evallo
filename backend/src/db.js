const createDatabase = require("./config/database");
const initModels = require("./models"); // Changed import
const { createSeedData } = require("../seeders/seedData");

const initDB = async () => {
  try {
    const sequelize = await createDatabase();

    // Initialize models
    const models = initModels(sequelize); // Changed this line
    console.log("✅ Models defined");

    // Sync database
    await sequelize.sync({ force: false });
    console.log("✅ Database models synchronized");

    // Create seed data
    await createSeedData(models);

    return { sequelize, models };
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
};

module.exports = { initDB };
