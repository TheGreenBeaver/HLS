const { omit } = require('lodash');
const { composeMediaPath } = require('../util/misc');

function serializeUser(user) {
  const serialized = {
    ...omit(user.dataValues, ['password', 'newPassword', 'subscribers']),
    avatar: composeMediaPath(user.avatar),
  };
  if ('newPassword' in user) {
    serialized.passwordChangeRequested = !!user.newPassword;
  }
  if ('subscribers' in user) {
    serialized.isSubscribed = !!user.subscribers.length;
  }

  return serialized;
}

module.exports = { serializeUser };