const { composeMediaPath } = require('../util/misc');

function serializeVideo(video) {
  let createdAt;
  if (!video.plan) {
    createdAt = video.createdAt;
  } else {
    createdAt = video.location ? video.plan : null;
  }

  const result = {
    ...video.dataValues,
    location: composeMediaPath(video.location),
    thumbnail: composeMediaPath(video.thumbnail),
    createdAt
  };
  if (video.author) {
    result.author = {
      ...video.author.dataValues,
      avatar: composeMediaPath(video.author.avatar)
    };
  }
  return result;
}

module.exports = {
  serializeVideo
};