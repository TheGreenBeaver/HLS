'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('obs_user', 'new_password', {
      type: Sequelize.STRING(100),
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('obs_user', 'new_password');
  }
};
