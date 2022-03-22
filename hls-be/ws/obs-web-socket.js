const { WebSocket } = require('ws');
const { encode, decode } = require('./transformers');
const httpStatus = require('http-status');
const log = require('../util/logger');
const { NON_FIELD_ERR } = require('../settings');
const { ACTIONS, EVENTS } = require('./constants');
const { ValidationError, UniqueConstraintError } = require('sequelize');
const { isDev } = require('../util/env');


class ObsWebSocket extends WebSocket {
  static permissions = {
    notAuthorized: [
      ACTIONS.signUp,
      ACTIONS.confirm,
      ACTIONS.resetPassword,

      ACTIONS.authenticate,
      ACTIONS.me
    ],
    notVerified: [
      ACTIONS.signUp,
      ACTIONS.confirm,
      ACTIONS.resetPassword,

      ACTIONS.authenticate,
      ACTIONS.me,
      ACTIONS.logOut
    ]
  };

  /**
   *
   * @type {User}
   */
  user = null;
  /**
   *
   * @type {ObsWebSocketServer}
   */
  wsServerRef = null;
  /**
   *
   * @type {FileHandle}
   */
  streamCollectorFile = null;
  /**
   *
   * @type {ChildProcessWithoutNullStreams}
   */
  streamTransformerProc = null;

  constructor(...args) {
    super(...args);

    this.on(EVENTS.message, async rawData => {
      const { data, isStream } = decode(rawData);
      if (isStream) {
        await this.streamCollectorFile.appendFile(data);
      } else {
        const { action, payload } = data;

        const respond = async data => this.sendMessage({ action, ...data });

        if (!this.isAuthorized && !ObsWebSocket.permissions.notAuthorized.includes(action)) {
          return respond({ status: httpStatus.UNAUTHORIZED });
        }

        if (this.isAuthorized && !this.user.isVerified && !ObsWebSocket.permissions.notVerified.includes(action)) {
          return respond({
            status: httpStatus.FORBIDDEN,
            payload: { [NON_FIELD_ERR]: ['Only allowed for verified users'] }
          });
        }

        const handle = require('./action-handlers')[action];
        // Some actions are send-only, easier to check this way then to search in ACTIONS
        if (!handle) {
          return respond({ status: httpStatus.NOT_IMPLEMENTED });
        }

        try {
          await handle(payload, { wsRef: this, respond });
        } catch (err) {
          await respond(this.getErrorResponse(err));
        }
      }
    });
  }

  /**
   *
   * @return {boolean}
   */
  get isLive() {
    return !!(this.streamTransformerProc && this.streamCollectorFile);
  }

  /**
   *
   * @return {boolean}
   */
  get isAuthorized() {
    return !!this.user;
  }

  /**
   *
   * @param {Error} err
   * @return {Object}
   */
  getErrorResponse(err) {
    if (isDev) {
      // Printing the error as it is to find its origin in the code
      console.log(err);
    }

    if (err instanceof ValidationError) {
      // TODO: ValidationError
      return { status: httpStatus.BAD_REQUEST, payload: {} };
    }

    if (err instanceof UniqueConstraintError) {
      // TODO: UniqueConstraintError
      return { status: httpStatus.BAD_REQUEST, payload: {} };
    }

    return { status: httpStatus.INTERNAL_SERVER_ERROR };
  }

  /**
   *
   * @param {User} user
   * @param {string} action
   * @return {Promise<void>}
   */
  async logIn(user, action) {
    const loggedInUser = await user.logInWithToken();
    this.user = user;
    await this.sendMessage({ payload: { token: loggedInUser.authToken }, action });
  }

  logOut() {
    this.user = null;
  }

  async finishLiveStream() {
    await this.streamCollectorFile.close();
    this.streamCollectorFile = null;

    this.streamTransformerProc.disconnect();
    await new Promise(resolve => {
      this.streamTransformerProc.once('disconnect', resolve);
    });
    this.streamTransformerProc = null;
  }

  /**
   *
   * @param {Object} data
   * @param {function(Error)=} onError
   * @return {Promise<void>}
   */
  async sendMessage(data, onError = () => {}) {
    const toSend = { status: httpStatus.OK, ...data };
    try {
      await new Promise(
        (resolve, reject) => this.send(encode(toSend), {}, err => err ? reject(err) : resolve())
      );

      let level;
      switch (httpStatus[`${toSend.status}_CLASS`]) {
        case httpStatus.classes.CLIENT_ERROR:
          level = log.levels.warn;
          break;
        case httpStatus.classes.SERVER_ERROR:
          level = log.levels.error;
          break;
        case httpStatus.classes.INFORMATIONAL:
          level = log.levels.debug;
          break;
        case httpStatus.classes.SUCCESSFUL:
          level = log.levels.success;
          break;
        case httpStatus.classes.REDIRECTION:
          level = log.levels.info;
          break;
      }
      log(level, `${toSend.action}: ${toSend.status} (${httpStatus[toSend.status]})`);
    } catch (e) {
      log(log.levels.error, `Error sending message to client: ${e.message}`);
      onError(e);
    }
  }
}

module.exports = ObsWebSocket;