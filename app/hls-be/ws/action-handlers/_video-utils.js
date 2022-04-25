const path = require('path');
const { STREAMS_DIR, TEMP_DIR, VIDEOS_DIR } = require('../../settings');
const fs = require('fs');
const { now } = require('lodash');
const { CONTENT_KINDS } = require('../../util/misc');
const makeThumbnail = require('../../ffmpeg/thumbnails');
const { Op } = require('sequelize');


const OPTIONS = {
  [CONTENT_KINDS.liveStream]: {
    prefix: 'live-stream',
    baseResultDir: STREAMS_DIR
  },
  [CONTENT_KINDS.video]: {
    prefix: 'video',
    baseResultDir: VIDEOS_DIR
  }
}

async function prepareDirs(user, contentKind) {
  const { prefix, baseResultDir } = OPTIONS[contentKind];

  const tempDir = path.join(TEMP_DIR, `user-${user.id}`);
  await fs.promises.mkdir(tempDir, { recursive: true });

  const resultDir = path.join(baseResultDir, `user-${user.id}`, `${prefix}-${now()}`);
  await fs.promises.mkdir(resultDir, { recursive: true });

  return { resultDir, tempDir };
}

async function prepareThumbnail(resultDir, tempDir, { provided, generateFrom }) {
  const fromImage = !!provided;
  let thumbnailInputPath = generateFrom;

  if (fromImage) {
    const providedExt = path.extname(provided.name);
    const thumbnailsDir = path.join(tempDir, 'thumbnails')
    thumbnailInputPath = path.join(thumbnailsDir, `${now()}${providedExt}`);
    await fs.promises.mkdir(thumbnailsDir, { recursive: true });
    await fs.promises.writeFile(thumbnailInputPath, provided.data);
  }

  const thumbnailLocation = await makeThumbnail(thumbnailInputPath, resultDir, fromImage);

  if (fromImage) {
    await fs.promises.rm(thumbnailInputPath);
  }

  return thumbnailLocation;
}

function makeWhereClause(wsRef) {
  const or = [{ location: { [Op.not]: null } }, { plan: { [Op.not]: null } }];
  if (wsRef.userAccessLogic.isAuthorized) {
    or.push({ author_id: wsRef.userAccessLogic.user.id });
  }
  return { [Op.or]: or };
}

module.exports = { prepareDirs, prepareThumbnail, makeWhereClause }