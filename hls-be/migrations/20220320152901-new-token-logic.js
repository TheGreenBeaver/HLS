'use strict';
const { sequelize } = require('../models');
const { underscores, getFkOperations } = require('../util/sql');


const tokenToUser = getFkOperations('auth_token', 'obs_user', {
  key: 'user_id'
});

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('obs_user', 'auth_token', {
      type: Sequelize.STRING(40),
      allowNull: true
    });
    try {
      await sequelize.query('UPDATE obs_user SET auth_token = a.key FROM auth_token AS a where id = a.user_id;');
    } catch {}
    await tokenToUser.down(queryInterface, Sequelize);
    await queryInterface.dropTable('auth_token');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.createTable('auth_token', underscores({
      key: {
        type: Sequelize.STRING(40),
        allowNull: false,
        primaryKey: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }));
    await tokenToUser.up(queryInterface, Sequelize);
    try {
      await sequelize.query('INSERT INTO auth_token (key, user_id, created_at) SELECT auth_token, id, now() FROM obs_user;');
    } catch {}
    await queryInterface.removeColumn('obs_user', 'auth_token');
  }
};
