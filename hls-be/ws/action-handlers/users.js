const { User } = require('../../models');
const { parseB36, checkToken, TOKEN_STATUS, hash, generateToken, getB36 } = require('../../util/encrypt');
const { capitalize } = require('lodash');
const { NON_FIELD_ERR, AVATARS_DIR } = require('../../settings');
const httpStatus = require('http-status');
const { getHost } = require('../../util/misc');
const sendMail = require('../../mail');
const { ACTIONS } = require('../constants');
const fs = require('fs');
const path = require('path');
const { serializeUser } = require('../../serializers/users');


const CRYPTO_FIELDS = ['email', 'username'];
const CONFIRM = {
  verify: {
    action: 'verify',
    field: 'isVerified',
    applyChangesAndGetValue: user => {
      user.isVerified = true;
      return true;
    },
  },
  changePassword: {
    action: 'change_password',
    field: 'passwordChangeRequested',
    applyChangesAndGetValue: user => {
      user.password = user.newPassword;
      user.newPassword = null;

      return false;
    },
  },
  resetPassword: {
    action: 'reset_password',
    field: 'passwordChangeRequested',
    applyChangesAndGetValue: (user, wsRef) => {
      wsRef.wsServerRef.openClients.forEach(client => {
        if (client.isAuthorized && client.user.id === user.id) {
          client.logOut();
        }
      });

      user.password = user.newPassword;
      user.newPassword = null;
      user.authToken = null;

      return false;
    },
  }
};

async function sendConfirmationLink(confirmedAction, user, fields = CRYPTO_FIELDS) {
  const verificationToken = generateToken(user, fields);
  const link = `${getHost()}/confirm/${confirmedAction}/${getB36(user.id)}/${verificationToken}`;
  await sendMail(link, user.email);
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
  await sendConfirmationLink(CONFIRM.verify.action, savedUser);
  return wsRef.logIn(savedUser, ACTIONS.signUp);
}

/**
 *
 * @param {Object} payload
 * @param {ObsWebSocket} wsRef
 * @param {function(Object): Promise<void>} respond
 * @return {Promise<void>}
 */
async function editUser(payload, { wsRef, respond }) {
  const { avatar, noAvatar, username, password } = payload;
  const theUser = wsRef.user;

  if (noAvatar) {
    theUser.avatar = null;
  } else if (avatar) {
    await fs.promises.mkdir(AVATARS_DIR, { recursive: true });
    const fName = `user-${theUser.id}${path.extname(avatar.name)}`;
    const location = path.join(AVATARS_DIR, fName);
    await fs.promises.writeFile(location, avatar.data);
    theUser.avatar = location;
  }

  if (username) {
    theUser.username = username;
  }

  if (password) {
    theUser.newPassword = password;
    await sendConfirmationLink(CONFIRM.changePassword.action, theUser);
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
  const theUser = wsRef.user;
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
  const { password, email } = payload;
  const theUser = wsRef.user || (await User.findOne({ where: { email }, rejectOnEmpty: true }));
  theUser.newPassword = password;
  await theUser.validate();

  const encryptedPassword = hash(password);
  theUser.setDataValue('newPassword', encryptedPassword);
  await theUser.save();
  await sendConfirmationLink(CONFIRM.resetPassword.action, theUser);
  return respond({ status: httpStatus.NO_CONTENT });
}

module.exports = {
  confirm, signUp, editUser, dropPasswordChange, resetPassword
};