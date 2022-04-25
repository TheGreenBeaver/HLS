const { User } = require('../../models');
const { USER_PRIVATE } = require('../../util/query-options');
const httpStatus = require('http-status');
const { compareHashed } = require('../../util/encrypt');
const { NON_FIELD_ERR } = require('../../settings');
const { ACTIONS } = require('../constants');
const { serializeUser } = require('../../serializers/users');


/**
 *
 * @param {Object} payload
 * @param {IstWebSocket} wsRef
 * @param {function(data: Object): Promise<void>} respond
 * @return {Promise<void>}
 */
async function me(payload, { wsRef, respond }) {
  const { token } = payload;
  try {
    const user = await User.findOne({
      where: { authToken: token },
      ...USER_PRIVATE,
      rejectOnEmpty: true
    });
    wsRef.userAccessLogic.user = user;
    return respond({ payload: serializeUser(user) });
  } catch (e) {
    return respond({ status: httpStatus.BAD_REQUEST, payload: { [NON_FIELD_ERR]: ['Authorization failed'] } });
  }
}

/**
 *
 * @param _
 * @param {IstWebSocket} wsRef
 * @param {function(data: Object): Promise<void>} respond
 * @return {Promise<void>}
 */
async function logOut(_, { wsRef, respond }) {
  wsRef.userAccessLogic.logOut();
  return respond({ status: httpStatus.NO_CONTENT });
}

/**
 *
 * @param {Object} payload
 * @param {IstWebSocket} wsRef
 * @param {function(data: Object): Promise<void>} respond
 * @return {Promise<*>}
 */
async function authenticate(payload , { wsRef, respond }) {
  const { email, password } = payload;
  const user = await User.findOne({
    where: { email },
    ...USER_PRIVATE,
    rejectOnEmpty: false
  });

  if (!user || !compareHashed(password, user.password)) {
    return respond({
      status: httpStatus.BAD_REQUEST,
      payload: { [NON_FIELD_ERR]: ['Invalid credentials'] }
    });
  }

  return wsRef.userAccessLogic.logIn(user, ACTIONS.authenticate);
}

module.exports = {
  me, authenticate, logOut
};