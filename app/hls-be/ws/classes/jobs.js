const schedule = require('node-schedule');
const { ACK_ABLE, ACTIONS } = require('../constants');
const { Video } = require('../../models');
const { VIDEO_BASIC } = require('../../util/query-options');
const httpStatus = require('http-status');
const { serializeVideo } = require('../../serializers/videos');
const fs = require('fs');
const path = require('path');
const { STREAMS_DIR, DONE_LOG_F_NAME } = require('../../settings');


class Jobs {
  #planned = {};
  #wsServerRef;
  #logsRotation;

  /**
   *
    * @param {IstWebSocketServer} wsServerRef
   */
  constructor(wsServerRef) {
    this.#wsServerRef = wsServerRef;
    this.#logsRotation = this.#planLogsRotation();
  }

  #planLogsRotation() {
    return schedule.scheduleJob('59 23 * * *', async function() {
      try {
        const allUserDirs = await fs.promises.readdir(STREAMS_DIR);
        for (const userDir of allUserDirs) {
          const allStreamDirs = await fs.promises.readdir(userDir);
          for (const streamDir of allStreamDirs) {
            try {
              await fs.promises.rm(path.join(streamDir, DONE_LOG_F_NAME));
            } catch {}
          }
        }
      } catch {}
    });
  }

  planForUser(userId, liveStreamId, dt, fn, argsToUse) {
    if (!this.#planned[userId]) {
      this.#planned[userId] = {};
    }
    this.#planned[userId][liveStreamId] = schedule.scheduleJob(dt, async function(wsServerRef, ...args) {
      const activeClientForUser = wsServerRef.openClients.find(c => c.userAccessLogic.user?.id === userId);
      if (
        !activeClientForUser ||
        !activeClientForUser.userAccessLogic.isAuthorized ||
        activeClientForUser.streamStateTracker.isLive
      ) {
        const theStream = await Video.findByPk(liveStreamId, { ...VIDEO_BASIC });
        const subscribers = await theStream.author.getSubscribers();
        await wsServerRef.broadcast(
          () => Promise.resolve({
            status: httpStatus.OK,
            action: ACTIONS.streamStateAck,
            payload: { video: serializeVideo(theStream), state: ACK_ABLE.cancelled }
          }),
          client => Promise.resolve(subscribers.includes(client.userAccessLogic.user))
        );
        return theStream.destroy();
      }

      fn.call(activeClientForUser.streamStateTracker, ...args);
    }.bind(null, this.#wsServerRef, ...argsToUse));
  }
}

module.exports = Jobs;