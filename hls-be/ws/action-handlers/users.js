const { User } = require('../../models');
const { parseB36, checkToken, TOKEN_STATUS, hash, generateToken, getB36 } = require('../../util/encrypt');
const { capitalize } = require('lodash');
const { NON_FIELD_ERR, AVATARS_DIR } = require('../../settings');
const httpStatus = require('http-status');
const { getHost } = require('../../util/misc');
const sendMail = require('../../mail');
const templates = require('../../mail/templates');
const { ACTIONS, CONFIRMABLE } = require('../constants');
const fs = require('fs');
const path = require('path');
const { serializeUser } = require('../../serializers/users');
const { USER_PUBLIC, USER_OTHER } = require('../../util/query-options');


const CRYPTO_FIELDS = ['email', 'username'];
const CONFIRM = {
  [CONFIRMABLE.verify]: {
    action: 'verify',
    field: 'isVerified',
    subject: 'inSight: account verification',
    applyChangesAndGetValue: user => {
      user.isVerified = true;
      return true;
    },
  },
  [CONFIRMABLE.changePassword]: {
    action: 'change_password',
    field: 'passwordChangeRequested',
    subject: 'inSight: password changed',
    applyChangesAndGetValue: user => {
      user.password = user.newPassword;
      user.newPassword = null;

      return false;
    },
  },
  [CONFIRMABLE.resetPassword]: {
    action: 'reset_password',
    field: 'passwordChangeRequested',
    subject: 'inSight: password reset',
    applyChangesAndGetValue: (user, wsRef) => {
      wsRef.wsServerRef.openClients.forEach(client => {
        if (client.userAccessLogic.matches(user)) {
          client.userAccessLogic.logOut();
        }
      });

      user.password = user.newPassword;
      user.newPassword = null;
      user.authToken = null;

      return false;
    },
  }
};

async function sendConfirmationLink(confirmed, user, fields = CRYPTO_FIELDS) {
  const { action, subject } = CONFIRM[CONFIRMABLE.verify];
  const verificationToken = generateToken(user, fields);
  const link = `${getHost()}/confirm/${action}/${getB36(user.id)}/${verificationToken}`;
  await sendMail({ subject, html: templates[confirmed](link) }, user.email);
}

/**
 *
 * @param {Object} payload
 * @param {ObsWebSocket} wsRef
 * @param {function(Object): Promise<void>} respond
 * @return {Promise<void>}
 */
async function confirm(payload, { wsRef, respond }) {
  const { uid, token, confirmedAction } = payload;
  const user = await User.findByPk(parseB36(uid), { rejectOnEmpty: false });
  const status = checkToken(user, token, CRYPTO_FIELDS);

  if (status === TOKEN_STATUS.OK) {
    const { applyChangesAndGetValue, field } = CONFIRM[confirmedAction];
    const value = applyChangesAndGetValue(user, wsRef);
    await user.save();
    const toSend = { payload: { [field]: value } };
    return respond(toSend);
  }

  return respond({
    status: httpStatus.BAD_REQUEST,
    payload: { [NON_FIELD_ERR]: [`${capitalize(status)} Link`] }
  });
}

/**
 *
 * @param {Object} payload
 * @param {ObsWebSocket} wsRef
 * @param {function(Object): Promise<void>} respond
 * @return {Promise<void>}
 */
async function signUp(payload, { wsRef, respond }) {
  const { password } = payload;
  const newUser = User.build(payload);
  await newUser.validate();

  const encryptedPassword = hash(password);
  newUser.setDataValue('password', encryptedPassword);

  const savedUser = await newUser.save();
  await sendConfirmationLink(CONFIRMABLE.verify, savedUser);
  return wsRef.userAccessLogic.logIn(savedUser, ACTIONS.signUp);
}

/**
 *
 * @param {Object} payload
 * @param {ObsWebSocket} wsRef
 * @param {function(Object): Promise<void>} respond
 * @return {Promise<void>}
 */
async function editUser(payload, { wsRef, respond }) {
  const { avatar, username, newPassword } = payload;
  const theUser = wsRef.userAccessLogic.user;

  if (avatar) {
    await fs.promises.mkdir(AVATARS_DIR, { recursive: true });
    const fName = `user-${theUser.id}${path.extname(avatar.name)}`;
    const location = path.join(AVATARS_DIR, fName);
    await fs.promises.writeFile(location, avatar.data);
    theUser.avatar = location;
  } else if (typeof avatar !== 'undefined') {
    theUser.avatar = null;
  }

  if (username) {
    theUser.username = username;
  }

  if (newPassword) {
    theUser.newPassword = hash(newPassword);
    await sendConfirmationLink(CONFIRMABLE.changePassword, theUser);
  }

  await theUser.save();
  return respond({ payload: serializeUser(theUser) });
}

/**
 *
 * @param {Object} _
 * @param {ObsWebSocket} wsRef
 * @param {function(Object): Promise<void>} respond
 * @return {Promise<void>}
 */
async function dropPasswordChange(_, { wsRef, respond }) {
  const theUser = wsRef.userAccessLogic.user;
  theUser.newPassword = null;
  await theUser.save();
  return respond({ payload: serializeUser(theUser) });
}

/**
 *
 * @param {Object} payload
 * @param {ObsWebSocket} wsRef
 * @param {function(Object): Promise<void>} respond
 * @return {Promise<void>}
 */
async function resetPassword(payload, { wsRef, respond }) {
  const { newPassword, email } = payload;
  const theUser = wsRef.userAccessLogic.user || (await User.findOne({ where: { email }, rejectOnEmpty: true }));
  theUser.newPassword = newPassword;
  await theUser.validate();

  theUser.newPassword = hash(newPassword);
  await theUser.save();
  await sendConfirmationLink(CONFIRMABLE.resetPassword, theUser);
  return respond({ status: httpStatus.NO_CONTENT });
}

/**
 *
 * @param {Object} payload
 * @param {ObsWebSocket} wsRef
 * @param {function(Object): Promise<void>} respond
 * @return {Promise<void>}
 */
async function subscribe(payload, { wsRef, respond }) {
  const { id } = payload;
  if (id === wsRef.userAccessLogic.user.id) {
    return respond({
      status: httpStatus.BAD_REQUEST,
      payload: { id: ['Can not subscribe to yourself'] }
    });
  }
  let contentMaker;
  try {
    contentMaker = await User.findByPk(id, { ...USER_PUBLIC, rejectOnEmpty: true });
  } catch (e) {
    return respond({
      status: httpStatus.BAD_REQUEST,
      payload: { id: ['No such streamer'] }
    });
  }

  await wsRef.userAccessLogic.user.addSubscribedTo(contentMaker);
  return respond({ status: httpStatus.NO_CONTENT });
}

/**
 *
 * @param _
 * @param {ObsWebSocket} wsRef
 * @param {function(Object): Promise<void>} respond
 * @return {Promise<void>}
 */
async function listChannels(_, { wsRef, respond }) {
  const theUser = wsRef.userAccessLogic.user;
  const channels = await theUser.getSubscribedTo({ ...USER_PUBLIC, through: { attributes: [] } });
  return respond({ payload: channels.map(serializeUser) });
}

/**
 *
 * @param {object} payload
 * @param {ObsWebSocket} wsRef
 * @param {function(Object): Promise<void>} respond
 * @return {Promise<void>}
 */
async function retrieveUser(payload, { wsRef, respond }) {
  const opts = wsRef.userAccessLogic.isAuthorized ? USER_OTHER : USER_PUBLIC;
  const u = await User.findByPk(payload.id, { ...opts, rejectOnEmpty: true });
  return respond({ payload: serializeUser(u, wsRef.userAccessLogic.user) });
}

module.exports = {
  confirm, signUp, editUser, dropPasswordChange, resetPassword, subscribe, listChannels, retrieveUser
};