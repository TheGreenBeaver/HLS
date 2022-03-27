const { Video } = require('../../models');
const path = require('path');
const { VIDEOS_DIR, TEMP_DIR } = require('../../settings');
const fs = require('fs');
const httpStatus = require('http-status');
const { paginate } = require('../../util/sql');
const { serializeVideo } = require('../../serializers/videos');
const { VIDEO_BASIC, VIDEO_FULL } = require('../../util/query-options');
const { now } = require('lodash');
const { processUploadedFile } = require('../../ffmpeg');
const { Op } = require('sequelize');
const { ACTIONS } = require('../constants');
const makeThumbnail = require('../../ffmpeg/thumbnails');


/**
 *
 * @param {Object} payload
 * @param {function(Object): Promise<void>} respond
 * @param {ObsWebSocket} wsRef
 * @return {Promise<void>}
 */
async function uploadVideo(payload, { respond, wsRef }) {
  const { name: videoName, file: { name: fileName, data: fileRawBytes }, thumbnail: providedThumbnail } = payload;
  const theUser = wsRef.user;

  const tempDir = path.join(TEMP_DIR, `user-${theUser.id}`);
  await fs.promises.mkdir(tempDir, { recursive: true });
  const ext = path.extname(fileName);
  const tempFileName = path.join(tempDir, `${now()}${ext}`);
  await fs.promises.writeFile(tempFileName, fileRawBytes);

  const resultDir = path.join(VIDEOS_DIR, `user-${wsRef.user.id}`, `video-${now()}`);
  await fs.promises.mkdir(resultDir, { recursive: true });

  const newVideo = await wsRef.user.createVideo(
    { name: videoName },
    { returning: ['id', 'name'] }
  );
  await respond({ status: httpStatus.ACCEPTED, payload: newVideo });

  let thumbnailInputPath = tempFileName;
  const fromImage = !!providedThumbnail;

  if (fromImage) {
    const providedExt = path.extname(providedThumbnail.name);
    const thumbnailsDir = path.join(tempDir, 'thumbnails')
    thumbnailInputPath = path.join(thumbnailsDir, `${now()}${providedExt}`);
    await fs.promises.mkdir(thumbnailsDir, { recursive: true });
    await fs.promises.writeFile(thumbnailInputPath, providedThumbnail.data);
  }

  newVideo.thumbnail = await makeThumbnail(thumbnailInputPath, resultDir, fromImage);

  if (fromImage) {
    await fs.promises.rm(thumbnailInputPath);
  }

  newVideo.location = await processUploadedFile(tempFileName, resultDir);
  await newVideo.save();
  return wsRef.sendMessage({ status: httpStatus.CREATED, payload: newVideo, action: ACTIONS.videoProcessedAck });
}

/**
 *
 * @param {Object} payload
 * @param {function(Object): Promise<void>} respond
 * @return {Promise<void>}
 */
async function listVideos(payload, { respond }) {
  const { page, pageSize, filters } = payload;
  const where = { ...filters, location: { [Op.not]: null } };
  const toSend = await paginate(Video, page, pageSize, { where, ...VIDEO_BASIC }, serializeVideo);
  return respond({ payload: toSend });
}

/**
 *
 * @param {Object} payload
 * @param {function(Object): Promise<void>} respond
 * @return {Promise<void>}
 */
async function retrieveVideo(payload, { respond }) {
  const { id } = payload;
  const theVideo = await Video.findByPk(id, { ...VIDEO_FULL, rejectOnEmpty: true });
  return respond({ payload: serializeVideo(theVideo) });
}

module.exports = {
  uploadVideo, listVideos, retrieveVideo
}