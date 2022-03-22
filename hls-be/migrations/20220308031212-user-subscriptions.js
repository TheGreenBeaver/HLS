'use strict';

const { getFkOperations, getUniqueOperations } = require('../util/sql');


const tableName = 'obs_user_subscription'

const subscriberToSubscription = getFkOperations(tableName, 'obs_user', {
  key: 'subscriber_id',
  constraintName: 'subscription_subscriber_id_fkey'
});
const contentMakerToSubscription = getFkOperations(tableName, 'obs_user', {
  key: 'content_maker_id',
  constraintName: 'subscription_content_maker_id_fkey'
});

const unique = getUniqueOperations(tableName, ['subscriber_id', 'content_maker_id']);

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(tableName, {});
    await subscriberToSubscription.up(queryInterface, Sequelize);
    await contentMakerToSubscription.up(queryInterface, Sequelize);
    await unique.up(queryInterface);
  },

  async down (queryInterface, Sequelize) {
    await subscriberToSubscription.down(queryInterface, Sequelize);
    await contentMakerToSubscription.down(queryInterface, Sequelize);
    await unique.down(queryInterface);
    await queryInterface.dropTable(tableName);
  }
};
