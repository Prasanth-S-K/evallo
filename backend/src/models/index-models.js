const { DataTypes } = require("sequelize");

const defineModels = (sequelize) => {
  const Organisation = sequelize.define(
    "Organisation",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "organisations",
      timestamps: false,
    }
  );

  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "users",
      timestamps: false,
    }
  );

  const Employee = sequelize.define(
    "Employee",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      first_name: {
        type: DataTypes.STRING(100),
      },
      last_name: {
        type: DataTypes.STRING(100),
      },
      email: {
        type: DataTypes.STRING(255),
      },
      phone: {
        type: DataTypes.STRING(50),
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "employees",
      timestamps: false,
    }
  );

  const Team = sequelize.define(
    "Team",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "teams",
      timestamps: false,
    }
  );

  const EmployeeTeam = sequelize.define(
    "EmployeeTeam",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      assigned_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "employee_teams",
      timestamps: false,
    }
  );

  const Log = sequelize.define(
    "Log",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      action: {
        type: DataTypes.STRING(255),
      },
      meta: {
        type: DataTypes.JSON,
      },
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "logs",
      timestamps: false,
    }
  );

  // Define relationships
  Organisation.hasMany(User, { foreignKey: "organisation_id" });
  User.belongsTo(Organisation, { foreignKey: "organisation_id" });

  Organisation.hasMany(Employee, { foreignKey: "organisation_id" });
  Employee.belongsTo(Organisation, { foreignKey: "organisation_id" });

  Organisation.hasMany(Team, { foreignKey: "organisation_id" });
  Team.belongsTo(Organisation, { foreignKey: "organisation_id" });

  Organisation.hasMany(Log, { foreignKey: "organisation_id" });
  Log.belongsTo(Organisation, { foreignKey: "organisation_id" });

  User.hasMany(Log, { foreignKey: "user_id" });
  Log.belongsTo(User, { foreignKey: "user_id" });

  // Many-to-many relationship
  Employee.belongsToMany(Team, {
    through: EmployeeTeam,
    foreignKey: "employee_id",
    otherKey: "team_id",
  });
  Team.belongsToMany(Employee, {
    through: EmployeeTeam,
    foreignKey: "team_id",
    otherKey: "employee_id",
  });

  return {
    Organisation,
    User,
    Employee,
    Team,
    EmployeeTeam,
    Log,
  };
};

module.exports = { defineModels };
