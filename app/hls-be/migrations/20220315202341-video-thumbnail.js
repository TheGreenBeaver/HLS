'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('video', 'thumbnail', {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: 'https://via.placeholder.com/1920x1080.png/008000C?text=No+Thumbnail+Specified'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('video', 'thumbnail');
  }
};
