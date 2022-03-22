const path = require('path');
const fs = require('fs');
const { TEMP_DIR, TEMP_EXT, NON_FIELD_ERR, STREAMS_DIR } = require('../../settings');
const { now } = require('lodash');
const log = require('../../util/logger');
const httpStatus = require('http-status');
const { ACTIONS } = require('../constants');
const { composeMediaPath } = require('../../util/misc');
const { getLiveStreamProc } = require('../../ffmpeg');

/**
 *
 * @param {Object} payload
 * @param {ObsWebSocket} wsRef
 * @param {function(data: Object): Promise<void>} respond
 * @return {Promise<any>}
 */
async function startStream(payload, { wsRef, respond }) {
  const theUser = wsRef.user;
  const userIsLive = wsRef.wsServerRef.openClients.some(client => client.user.id === theUser.id && client.isLive);
  if (userIsLive) {
    return respond({
      status: httpStatus.CONFLICT,
      payload: { [NON_FIELD_ERR]: ['You are already live'] }
    });
  }

  const tempDir = path.join(TEMP_DIR, `user-${theUser.id}`);
  await fs.promises.mkdir(tempDir, { recursive: true });
  const tempFileName = path.join(tempDir, `${now()}${TEMP_EXT}`);

  const streamDir = path.join(STREAMS_DIR, `user-${theUser.id}`, `live-stream-${now()}`);
  await fs.promises.mkdir(streamDir, { recursive: true });

  wsRef.streamCollectorFile = await fs.promises.open(tempFileName, 'a');
  const { proc, masterFileName } = await getLiveStreamProc(tempFileName, streamDir);
  wsRef.streamTransformerProc = proc;

  wsRef.streamTransformerProc.on('error', async err => {
    log(log.levels.error, `Error processing stream from User#${theUser.id}: ${err.message}`);
    await wsRef.finishLiveStream();
    await wsRef.wsServerRef.broadcast(
      client => Promise.resolve({
        status: httpStatus.INTERNAL_SERVER_ERROR,
        action: ACTIONS.streamEndAck,
        payload: {
          [NON_FIELD_ERR]: [
            client === wsRef ? 'Encountered a fatal error while processing your stream' : 'The stream has crashed'
          ]
          // TODO: Continue the same stream
        }
      }),
      client => Promise.resolve(client === wsRef || subscribers.includes(client.user))
    );
  });

  const subscribers = await theUser.getSubscribers();
  await wsRef.wsServerRef.broadcast(
    client => {
      const data = { action: ACTIONS.streamStartAck };
      if (client !== wsRef) {
        data.payload = { streamer: theUser, streamLocation: composeMediaPath(masterFileName) };
      }
      return Promise.resolve(data);
    },
    client => Promise.resolve(client === wsRef || subscribers.includes(client.user))
  );

  log(log.levels.info, `User#${theUser.id} has started a stream`);
}

/**
 *
 * @param {Object} payload
 * @param {ObsWebSocket} wsRef
 * @param {function(data: Object): Promise<void>} respond
 * @return {Promise<void>}
 */
async function endStream(payload, { wsRef, respond }) {
  const theUser = wsRef.user;
  await wsRef.finishLiveStream();

  const subscribers = await theUser.getSubscribers();
  await wsRef.wsServerRef.broadcast(
    client => {
      const data = { action: ACTIONS.streamEndAck };
      if (client !== wsRef) {
        data.payload = { streamer: theUser };
      }
      return Promise.resolve(data);
    },
    client => Promise.resolve(client === wsRef || subscribers.includes(client.user))
  );

  log(log.levels.info, `User#${wsRef.user.id} has ended the stream`);

}

module.exports = {
  startStream, endStream
};