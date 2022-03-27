const { User } = require('../models');


const DUMMY = { attributes: ['id'] };

const userPublicAttrs = ['id', 'email', 'username', 'avatar'];
const userPrivateAttrs = [...userPublicAttrs, 'password', 'isVerified', 'newPassword'];
const USER_PUBLIC = {
  attributes: userPublicAttrs
};
const USER_PRIVATE = {
  attributes: userPrivateAttrs
};

const videoBasicAttrs = ['id', 'name', 'location', 'thumbnail'];
const videoFullAttrs = [...videoBasicAttrs, 'description'];
const VIDEO_BASIC = {
  attributes: videoBasicAttrs,
  include: [{
    model: User,
    as: 'author',
    attributes: userPublicAttrs
  }]
};
const VIDEO_FULL = { ...VIDEO_BASIC, attributes: videoFullAttrs };

module.exports = {
  DUMMY,

  USER_PUBLIC,
  USER_PRIVATE,

  VIDEO_BASIC,
  VIDEO_FULL
};