const { User } = require('../models');


const DUMMY = { attributes: ['id'] };

const userPublicAttrs = ['id', 'email', 'username', 'avatar', 'createdAt'];
const userPrivateAttrs = [...userPublicAttrs, 'password', 'isVerified', 'newPassword'];
const USER_PUBLIC = {
  attributes: userPublicAttrs
};
const USER_PRIVATE = {
  attributes: userPrivateAttrs
};
const USER_OTHER = {
  attributes: userPublicAttrs,
  include: [{
    model: User,
    as: 'subscribers',
    through: { attributes: [] }
  }]
};

const videoBasicAttrs = ['id', 'name', 'location', 'thumbnail', 'createdAt', 'isStream', 'isLiveNow', 'plan'];
const videoFullAttrs = [...videoBasicAttrs, 'description'];
const VIDEO_BASIC = {
  attributes: videoBasicAttrs,
  include: [{
    model: User,
    as: 'author',
    attributes: userPublicAttrs
  }],
  order: [['createdAt', 'DESC']]
};
const VIDEO_FULL = { ...VIDEO_BASIC, attributes: videoFullAttrs };

module.exports = {
  DUMMY,

  USER_PUBLIC,
  USER_PRIVATE,
  USER_OTHER,

  VIDEO_BASIC,
  VIDEO_FULL
};