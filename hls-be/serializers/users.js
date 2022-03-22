const { omit } = require('lodash');
const { composeMediaPath } = require('../util/misc');

function serializeUser(user) {
  const serialized = {
    ...omit(user.dataValues, ['password', 'newPassword']),
    avatar: composeMediaPath(user.avatar),
  };
  if ('newPassword' in user) {
    serialized.passwordChangeRequested = !!user.newPassword;
  }

  return serialized;
}

module.exports = { serializeUser };