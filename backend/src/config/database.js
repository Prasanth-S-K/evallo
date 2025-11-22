const { Sequelize } = require("sequelize");
require("dotenv").config();

// First connect without database to create it
const setupSequelize = new Sequelize(
  "", // No database specified
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: false,
  }
);

const createDatabase = async () => {
  try {
    // Create database if it doesn't exist
    await setupSequelize.query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`
    );
    console.log("✅ Database created or already exists");

    // Now connect with the database
    const sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASS,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "mysql",
        logging: process.env.NODE_ENV === "development" ? console.log : false,
      }
    );

    await sequelize.authenticate();
    console.log("✅ Connected to database successfully");

    return sequelize;
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    throw error;
  }
};

module.exports = createDatabase;
