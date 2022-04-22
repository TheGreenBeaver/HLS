'use strict';

const { getFkOperations } = require('../util/sql');


const tokenToUser = getFkOperations('auth_token', 'insight_user', {
  key: 'user_id'
});
const videoToUser = getFkOperations('video', 'insight_user', {
  key: 'author_id'
});

module.exports = {
  async up (...args) {
    await tokenToUser.up(...args);
    await videoToUser.up(...args);
  },

  async down (...args) {
    await tokenToUser.down(...args);
    await videoToUser.down(...args);
  }
};
