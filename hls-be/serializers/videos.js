const { composeMediaPath } = require('../util/misc');

function serializeVideo(video) {
  let createdAt;
  if (!video.plan) {
    createdAt = video.createdAt;
  } else {
    createdAt = video.location ? video.plan : null;
  }

  return {
    ...video.dataValues,
    author: {
      ...video.author.dataValues,
      avatar: composeMediaPath(video.author.avatar)
    },
    location: composeMediaPath(video.location),
    thumbnail: composeMediaPath(video.thumbnail),
    createdAt
  };
}

module.exports = {
  serializeVideo
};