const { NON_FIELD_ERR } = require('../../settings');
const log = require('../../util/logger');
const httpStatus = require('http-status');
const { ACTIONS, ACK_ABLE } = require('../constants');
const { prepareDirs, prepareThumbnail } = require('./_video-utils');
const { CONTENT_KINDS } = require('../../util/misc');
const { serializeVideo } = require('../../serializers/videos');
const { VIDEO_BASIC } = require('../../util/query-options');

/**
 *
 * @param {object} payload
 * @param {ObsWebSocket} wsRef
 * @param {function(data: Object): Promise<void>} respond
 * @return {Promise<any>}
 */
async function startStream(payload, { wsRef, respond }) {
  const { name, description, thumbnail, plan } = payload;
  const theUser = wsRef.userAccessLogic.user;
  const userIsLive = wsRef.wsServerRef.openClients.some(client =>
    client.userAccessLogic.matches(theUser) && client.streamStateTracker.isLive
  );
  if (userIsLive) {
    return respond({
      status: httpStatus.CONFLICT,
      payload: { [NON_FIELD_ERR]: ['You are already live'] }
    });
  }

  const { resultDir, tempDir } = await prepareDirs(theUser, CONTENT_KINDS.liveStream);
  const thumbnailLocation = await prepareThumbnail(resultDir, tempDir, { provided: thumbnail });
  const newVideo = await theUser.createVideo({
    isStream: true,
    name,
    thumbnail: thumbnailLocation,
    description,
    plan
  });
  await newVideo.reload({ ...VIDEO_BASIC });

  await wsRef.streamStateTracker.startLiveStream(newVideo, resultDir, plan);

  log(log.levels.info, `User#${theUser.id} has ${
    plan
      ? `planned a stream for ${plan.toISOString()}`
      : 'started a stream'
  }`);

  return respond({ status: httpStatus.CREATED, payload: serializeVideo(newVideo) });
}

/**
 *
 * @param {Object} payload
 * @param {ObsWebSocket} wsRef
 * @param {function(data: Object): Promise<void>} respond
 * @return {Promise<void>}
 */
async function endStream(payload, { wsRef, respond }) {
  const theUser = wsRef.userAccessLogic.user;

  await respond({ status: httpStatus.ACCEPTED });
  log(log.levels.info, `User#${theUser.id} has ended the stream`);

  const dbRecord = await wsRef.streamStateTracker.finishLiveStream();
  log(log.levels.info, `Finished processing User#${theUser.id}'s last stream`);

  const subscribers = await theUser.getSubscribers();
  await wsRef.wsServerRef.broadcast(
    () => Promise.resolve({
      action: ACTIONS.streamStateAck,
      payload: { video: serializeVideo(dbRecord), state: ACK_ABLE.gracefullyEnded }
    }),
    client => Promise.resolve(subscribers.includes(client.userAccessLogic.user))
  );
}

/**
 *
 * @param {Object} payload
 * @param {ObsWebSocket} wsRef
 * @param {function(data: Object): Promise<void>} respond
 * @return {Promise<void>}
 */
async function confirmPlan(payload, { wsRef, respond }) {
  const theUser = wsRef.userAccessLogic.user;
  const { willStream, id } = payload;
  const theStream = (await theUser.getVideos({ where: { id }, rejectOnEmpty: true }))[0];
  if (willStream) {
    const { resultDir } = await prepareDirs(theUser, CONTENT_KINDS.liveStream);
    await wsRef.streamStateTracker.startLiveStream(theStream.id, resultDir);
    log(log.levels.info, `User#${theUser.id} has started a planned stream`);
  } else {
    const subscribers = await theUser.getSubscribers();
    await wsRef.wsServerRef.broadcast(
      () => Promise.resolve({
        action: ACTIONS.streamStateAck,
        payload: { video: serializeVideo(theStream), state: ACK_ABLE.cancelled }
      }),
      client => Promise.resolve(subscribers.includes(client.userAccessLogic.user))
    );
    await theStream.destroy();
  }
  return respond({ status: httpStatus.ACCEPTED, payload: { willStream } });
}

module.exports = {
  startStream, endStream, confirmPlan
};