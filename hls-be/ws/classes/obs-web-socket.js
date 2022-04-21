const { WebSocket } = require('ws');
const { encode, decode } = require('../transformers');
const httpStatus = require('http-status');
const log = require('../../util/logger');
const { EVENTS } = require('../constants');
const { ValidationError: SqlValidationError, UniqueConstraintError, EmptyResultError } = require('sequelize');
const { ValidationError: YupValidationError } = require('yup');
const { isDev } = require('../../util/env');
const { set } = require('lodash');
const models = require('../../models');
const UserAccessLogic = require('./user-access-logic');
const StreamStateTracker = require('./stream-state-tracker');
const { NON_FIELD_ERR } = require('../../settings');


class ObsWebSocket extends WebSocket {
  /**
   * @type {ObsWebSocketServer}
   */
  wsServerRef = null;

  constructor(...args) {
    super(...args);
    this.userAccessLogic = new UserAccessLogic(this);
    this.streamStateTracker = new StreamStateTracker(this);

    this.on(EVENTS.message, async rawData => {
      const { data, isStream } = decode(rawData);
      if (isStream) {
        await this.streamStateTracker.handleChunk(data);
      } else {
        const { action, payload } = data;
        const isAllowed = this.userAccessLogic.getIsAllowed(action);
        if (!isAllowed) {
          return;
        }
        const respond = async d => this.sendMessage({ action, ...d });
        const validator = require('../validation')[action];
        const handle = require('../action-handlers')[action];
        try {
          await validator.validate(payload, { abortEarly: false, strict: true });
          await handle(payload, { wsRef: this, respond });
        } catch (err) {
          await respond(this.#getErrorResponse(err));
        }
      }
    });
  }

  /**
   *
   * @param {Error} err
   * @return {Object}
   */
  #getErrorResponse(err) {
    if (isDev) {
      // Printing the error as it is to find its origin in the code
      console.log(err);
    }

    let payload;
    if (err instanceof YupValidationError) {
      payload = {};
      err.inner.forEach(innerErr => {
        set(payload, innerErr.path || NON_FIELD_ERR, innerErr.errors);
      });
    } else if (err instanceof SqlValidationError) {
      payload = err.errors.reduce((acc, err) => {
        if (acc[err.path] == null) {
          acc[err.path] = [];
        }
        acc[err.path].push(err.message);
        return acc;
      }, {});
    } else if (err instanceof UniqueConstraintError) {
      const { parent } = err;
      const failedUnique = parent.constraint
        .replace(`${parent.table}_`, '')
        .replace('_key', '');
      const failedModel = Object.entries(models).find(([, model]) => model.getTableName() === parent.table)[0];
      payload = { [failedUnique]: [`${failedModel} with such ${failedUnique} already exists`] };
    } else if (err instanceof EmptyResultError) {
      return { status: httpStatus.NOT_FOUND };
    }

    return payload
      ? { status: httpStatus.BAD_REQUEST, payload }
      : { status: httpStatus.INTERNAL_SERVER_ERROR };
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