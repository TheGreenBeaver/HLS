const { ACTIONS, SEARCHABLE } = require('../constants');
const { withPagination } = require('./_validators');
const { string, object, mixed } = require('yup');

module.exports = {
  [ACTIONS.search]: object({
    ...withPagination,
    searchFor: mixed().oneOf(Object.values(SEARCHABLE)).optional(),
    q: string().required()
  }).noUnknown()
};