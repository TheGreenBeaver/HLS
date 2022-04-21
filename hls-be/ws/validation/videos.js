const { ACTIONS } = require('../constants');
const { strictObject, file, entityId, withPagination } = require('./_validators');
const { string, object, boolean } = require('yup');


module.exports = {
  [ACTIONS.uploadVideo]: object({
    name: string().max(50).required(),
    file: file.required(),
    thumbnail: file.optional(),
    description: string().max(1000).optional()
  }).noUnknown(),
  [ACTIONS.listVideos]: object({
    ...withPagination,
    filters: object({
      isStream: boolean().optional(),
      isLiveNow: boolean().optional(),
      author: entityId.optional(),
      q: string().optional()
    }).optional()
  }).noUnknown(),
  [ACTIONS.retrieveVideo]: strictObject({
    id: entityId
  })
}