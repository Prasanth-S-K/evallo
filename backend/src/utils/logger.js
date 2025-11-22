const createLog = async (models, logData) => {
  try {
    const { Log } = models;

    await Log.create({
      organisation_id: logData.organisation_id,
      user_id: logData.user_id,
      action: logData.action,
      meta:
        typeof logData.meta === "string"
          ? logData.meta
          : JSON.stringify(logData.meta),
      timestamp: logData.timestamp || new Date(),
    });

    console.log(`📝 Log created: ${logData.action} by user ${logData.user_id}`);
  } catch (error) {
    console.error("Failed to create log:", error);
  }
};

module.exports = { createLog };
