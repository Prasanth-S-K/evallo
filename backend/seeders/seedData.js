const bcrypt = require("bcrypt");

const createSeedData = async (models) => {
  const { Organisation, User, Employee, Team, EmployeeTeam, Log } = models;

  try {
    console.log("🌱 Checking for existing seed data...");

    // Check if data already exists
    const existingOrg = await Organisation.findOne({
      where: { name: "Evallo Tutoring" },
    });
    if (existingOrg) {
      console.log("✅ Seed data already exists, skipping seed creation");
      return;
    }

    console.log("🌱 Starting seed data creation...");

    // Create Organisation
    const organisation = await Organisation.create({
      name: "Evallo Tutoring",
      created_at: new Date(),
    });
    console.log("✅ Organisation created");

    // Create Admin User
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const adminUser = await User.create({
      organisation_id: organisation.id,
      email: "admin@evallo.com",
      password_hash: hashedPassword,
      name: "System Administrator",
      created_at: new Date(),
    });
    console.log("✅ Admin user created");

    // Create Employees
    const employees = await Employee.bulkCreate([
      {
        organisation_id: organisation.id,
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@evallo.com",
        phone: "+1234567890",
        created_at: new Date(),
      },
      {
        organisation_id: organisation.id,
        first_name: "Jane",
        last_name: "Smith",
        email: "jane.smith@evallo.com",
        phone: "+1234567891",
        created_at: new Date(),
      },
      {
        organisation_id: organisation.id,
        first_name: "Mike",
        last_name: "Johnson",
        email: "mike.johnson@evallo.com",
        phone: "+1234567892",
        created_at: new Date(),
      },
    ]);
    console.log("✅ Employees created");

    // Create Teams
    const teams = await Team.bulkCreate([
      {
        organisation_id: organisation.id,
        name: "Math Tutors",
        description: "Mathematics tutoring team",
        created_at: new Date(),
      },
      {
        organisation_id: organisation.id,
        name: "Science Tutors",
        description: "Science and research team",
        created_at: new Date(),
      },
      {
        organisation_id: organisation.id,
        name: "Administration",
        description: "Administrative staff",
        created_at: new Date(),
      },
    ]);
    console.log("✅ Teams created");

    // Assign Employees to Teams (Many-to-Many)
    await EmployeeTeam.bulkCreate([
      {
        employee_id: employees[0].id,
        team_id: teams[0].id,
        assigned_at: new Date(),
      },
      {
        employee_id: employees[0].id,
        team_id: teams[2].id,
        assigned_at: new Date(),
      },
      {
        employee_id: employees[1].id,
        team_id: teams[1].id,
        assigned_at: new Date(),
      },
      {
        employee_id: employees[2].id,
        team_id: teams[0].id,
        assigned_at: new Date(),
      },
      {
        employee_id: employees[2].id,
        team_id: teams[1].id,
        assigned_at: new Date(),
      },
    ]);
    console.log("✅ Employee-Team assignments created");

    // Create some log entries
    await Log.bulkCreate([
      {
        organisation_id: organisation.id,
        user_id: adminUser.id,
        action: "USER_LOGIN",
        meta: JSON.stringify({ email: "admin@evallo.com", ip: "127.0.0.1" }),
        timestamp: new Date(),
      },
      {
        organisation_id: organisation.id,
        user_id: adminUser.id,
        action: "ORGANISATION_CREATED",
        meta: JSON.stringify({ organisation_name: "Evallo Tutoring" }),
        timestamp: new Date(),
      },
    ]);
    console.log("✅ Log entries created");

    console.log("🎉 Seed data completed successfully!");
    console.log("📧 Admin login: admin@evallo.com / admin123");
  } catch (error) {
    console.error("❌ Seed data failed:", error);
    throw error;
  }
};

module.exports = { createSeedData };
