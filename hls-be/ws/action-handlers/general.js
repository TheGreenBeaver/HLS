const { User, Video } = require('../../models');
const { Op } = require('sequelize');
const { USER_PUBLIC, VIDEO_BASIC } = require('../../util/query-options');
const { makeWhereClause } = require('./_video-utils');
const { SEARCHABLE } = require('../constants');
const httpStatus = require('http-status');
const { NON_FIELD_ERR, DEFAULT_PAGE_SIZE } = require('../../settings');
const { serializeVideo } = require('../../serializers/videos');
const { serializeUser } = require('../../serializers/users');


/**
 *
 * @param {Object} payload
 * @param {function(Object): Promise<void>} respond
 * @param {ObsWebSocket} wsRef
 * @return {Promise<void>}
 */
async function search(payload, { respond, wsRef }) {
  const { q, page, pageSize: _pageSize, searchFor } = payload;
  const pageSize = _pageSize || DEFAULT_PAGE_SIZE;
  const like = { [Op.like]: `%${q}%` };

  const allResults = [];

  if (searchFor === SEARCHABLE.user || !searchFor) {
    const whereUsers = { username: like };
    if (wsRef.userAccessLogic.isAuthorized) {
      whereUsers.id = { [Op.not]: wsRef.userAccessLogic.user.id };
    }
    const matchingUsers = await User.findAll({ where: whereUsers, ...USER_PUBLIC });
    allResults.push(...matchingUsers.map(u => ({
      mainData: serializeUser(u), kind: SEARCHABLE.user
    })));
  }

  if (searchFor === SEARCHABLE.video || !searchFor) {
    const videoRestrictions = makeWhereClause(wsRef);
    const whereVideos = {
      [Op.and]: [videoRestrictions, { [Op.or]: [{ name: like }, { description: like }] }]
    };
    const matchingVideos = await Video.findAll({ where: whereVideos, ...VIDEO_BASIC });
    allResults.push(...matchingVideos.map(v => ({
      mainData: serializeVideo(v), kind: SEARCHABLE.video
    })));
  }

  const count = allResults.length;
  if ((page - 1) * pageSize >= count && count > 0) {
    return respond({
      status: httpStatus.BAD_REQUEST,
      payload: { [NON_FIELD_ERR]: [`No such page: ${page}`] }
    });
  }

  const results = allResults.slice((page - 1) * pageSize, page * pageSize);
  return respond({
    payload: {
      results, count,
      next: page * pageSize < count ? page + 1 : null, prev: (page - 1) || null
    }
  });
}

module.exports = { search };