'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('video', 'description', {
      type: Sequelize.STRING(1000),
      allowNull: false,
      defaultValue: ''
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('video', 'description');
  }
};
