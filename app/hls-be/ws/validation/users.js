const { ACTIONS, CONFIRMABLE } = require('../constants');
const { strictObject, file, ensureEmpty, entityId } = require('./_validators');
const { string, mixed, object } = require('yup');


module.exports = {
  [ACTIONS.confirm]: strictObject({
    uid: string().matches(/[\da-z]+/),
    token: string(),
    confirmedAction: mixed().oneOf(Object.values(CONFIRMABLE))
  }),
  [ACTIONS.signUp]: strictObject({
    username: string().max(50),
    email: string().email(),
    password: string().max(100)
  }),
  [ACTIONS.editUser]: object({
    avatar: file.optional(),
    username: string().max(50).optional(),
    newPassword: string().max(100).optional()
  }).noUnknown(),
  [ACTIONS.dropPasswordChange]: ensureEmpty,
  [ACTIONS.resetPassword]: strictObject({
    email: string().email(),
    newPassword: string().max(100)
  }),
  [ACTIONS.subscribe]: strictObject({
    id: entityId
  }),
  [ACTIONS.listChannels]: ensureEmpty,
  [ACTIONS.retrieveUser]: strictObject({
    id: entityId
  })
};