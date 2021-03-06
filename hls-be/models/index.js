'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const { getFileIsUsable } = require('../util/misc');
const { getEnv } = require('../util/env');
const allConfigs = require(__dirname + '/../config/config.json')


const env = getEnv();
const config = allConfigs[env];
let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const basename = path.basename(__filename);
const db = {};
fs
  .readdirSync(__dirname)
  .filter(file => getFileIsUsable(file, basename))
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;

module.exports = db;
