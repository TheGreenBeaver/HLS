const { composeMediaPath } = require('../util/misc');

function serializeVideo(video) {
  return {
    ...video.dataValues,
    location: composeMediaPath(video.location),
    thumbnail: composeMediaPath(video.thumbnail)
  };
}

module.exports = {
  serializeVideo
};