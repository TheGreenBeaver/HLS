const { mixed, object, number, string } = require('yup');
const { mapValues } = require('lodash');


const ensureEmpty = mixed().test({
  name: 'isEmpty',
  message: '${path} must be empty',
  test: value => value == null
});

function strictObject(spec) {
  return object(mapValues(spec, f => f.required())).noUnknown();
}

const niceNumber = number().positive().integer();
const entityId = number().integer().min(1);

const file = strictObject({
  name: string().matches(/.+\.\w+/),
  data: mixed().test(d => d instanceof Buffer),
  size: niceNumber,
  type: string().matches(/[\w-]+\/[\w-]/)
}).nullable();

const withPagination = {
  page: niceNumber.optional(),
  pageSize: niceNumber.optional(),
};

module.exports = { ensureEmpty, strictObject, niceNumber, file, entityId, withPagination };