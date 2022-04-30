const { omit } = require('lodash');
const { composeMediaPath } = require('../util/misc');

function serializeUser(user, currentUser) {
  const serialized = {
    ...omit(user.dataValues, ['password', 'newPassword', 'subscribers']),
    avatar: composeMediaPath(user.avatar),
  };
  if ('newPassword' in user) {
    serialized.passwordChangeRequested = !!user.newPassword;
  }
  if ('subscribers' in user) {
    serialized.subscribersAmount = user.subscribers.length;
    if (currentUser) {
      serialized.isSubscribed = user.subscribers.some(u => u.id === currentUser.id);
    }
  }

  return serialized;
}

module.exports = { serializeUser };