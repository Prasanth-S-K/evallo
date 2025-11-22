const { defineModels } = require("./index-models");

let models = null;

const initModels = (sequelize) => {
  if (!models) {
    models = defineModels(sequelize);
  }
  return models;
};

// Export the function to initialize models
module.exports = initModels;
