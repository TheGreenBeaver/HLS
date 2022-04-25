'use strict';
const { underscores, getFkOperations } = require('../util/sql');


const tokenToUser = getFkOperations('auth_token', 'insight_user', {
  key: 'user_id'
});

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('insight_user', 'auth_token', {
      type: Sequelize.STRING(40),
      allowNull: true
    });
    await queryInterface.sequelize.query('UPDATE insight_user SET auth_token = a.key FROM auth_token AS a where id = a.user_id;');
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
    await queryInterface.sequelize.query('INSERT INTO auth_token (key, user_id, created_at) SELECT auth_token, id, now() FROM insight_user;');
    await queryInterface.removeColumn('insight_user', 'auth_token');
  }
};
