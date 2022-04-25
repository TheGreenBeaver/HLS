const { ACTIONS } = require('../constants');
const { file, strictObject, entityId, ensureEmpty } = require('./_validators');
const { string, object, date, boolean } = require('yup');


module.exports = {
  [ACTIONS.startStream]: object({
    name: string().max(50).required(),
    description: string().max(1000).optional(),
    thumbnail: file.required(),
    plan: date().min(new Date()).optional()
  }).noUnknown(),
  [ACTIONS.endStream]: ensureEmpty,
  [ACTIONS.confirmPlan]: strictObject({
    willStream: boolean(),
    id: entityId
  })
};