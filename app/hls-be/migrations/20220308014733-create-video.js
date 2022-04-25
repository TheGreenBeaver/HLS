'use strict';
const { underscores } = require('../util/sql');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('video', underscores({
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      isStream: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      location: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }));
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('video');
  }
};