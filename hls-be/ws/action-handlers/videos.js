const { Video } = require('../../models');
const path = require('path');
const fs = require('fs');
const httpStatus = require('http-status');
const { paginate } = require('../../util/sql');
const { serializeVideo } = require('../../serializers/videos');
const { VIDEO_BASIC, VIDEO_FULL } = require('../../util/query-options');
const { processUploadedFile } = require('../../ffmpeg');
const { ACTIONS } = require('../constants');
const { prepareTempFiles, prepareThumbnail, makeWhereClause } = require('./_video-utils');
const { CONTENT_KINDS } = require('../../util/misc');
const { Op } = require('sequelize');


/**
 *
 * @param {Object} payload
 * @param {function(Object): Promise<void>} respond
 * @param {ObsWebSocket} wsRef
 * @return {Promise<void>}
 */
async function uploadVideo(payload, { respond, wsRef }) {
  const {
    name: videoName,
    file: { name: fileName, data: fileRawBytes },
    thumbnail: providedThumbnail,
    description
  } = payload;
  const theUser = wsRef.userAccessLogic.user;

  const { tempFileName, resultDir, tempDir } =
    await prepareTempFiles(theUser, path.extname(fileName), CONTENT_KINDS.video);

  await fs.promises.writeFile(tempFileName, fileRawBytes);
  const thumbnailLocation = await prepareThumbnail(tempFileName, resultDir, tempDir, providedThumbnail);
  const newVideo = await theUser.createVideo(
    { name: videoName, thumbnail: thumbnailLocation, description }, { returning: ['id', 'name'] }
  );
  await respond({ status: httpStatus.ACCEPTED, payload: { id: newVideo.id } });

  newVideo.location = await processUploadedFile(tempFileName, resultDir);
  await newVideo.save();

  return wsRef.sendMessage({ status: httpStatus.CREATED, payload: newVideo, action: ACTIONS.videoProcessedAck });
}

/**
 *
 * @param {Object} payload
 * @param {function(Object): Promise<void>} respond
 * @param {ObsWebSocket} wsRef
 * @return {Promise<void>}
 */
async function listVideos(payload, { respond, wsRef }) {
  const { page, pageSize, filters } = payload;
  const baseRestriction = makeWhereClause(wsRef);
  let searchRestriction;
  const where = {};
  if (filters) {
    if ('isStream' in filters) {
      where.isStream = filters.isStream;
    }
    if ('isLiveNow' in filters) {
      if (filters.isStream === false) {
        return respond({
          status: httpStatus.BAD_REQUEST,
          payload: { isLiveNow: ['Can\'t apply this restriction to non-streams'] }
        });
      }
      where.isLiveNow = filters.isLiveNow;
    }
    if ('author' in filters) {
      where.author_id = filters.author;
    }
    if ('q' in filters) {
      const like = { [Op.like]: `%${filters.q}%` };
      searchRestriction = { [Op.or]: [{ name: like }, { description: like }] };
    }
  }
  if (searchRestriction) {
    where[Op.and] = [baseRestriction, searchRestriction];
  } else {
    Object.assign(where, baseRestriction);
  }
  const toSend = await paginate(Video, page, pageSize, { where, ...VIDEO_BASIC }, serializeVideo);
  return respond(toSend);
}

/**
 *
 * @param {Object} payload
 * @param {function(Object): Promise<void>} respond
 * @param {ObsWebSocket} wsRef
 * @return {Promise<void>}
 */
async function retrieveVideo(payload, { respond, wsRef }) {
  const { id } = payload;
  const where = makeWhereClause(wsRef);
  const theVideo = await Video.findByPk(id, { where, ...VIDEO_FULL, rejectOnEmpty: true });
  return respond({ payload: serializeVideo(theVideo) });
}

module.exports = {
  uploadVideo, listVideos, retrieveVideo
}