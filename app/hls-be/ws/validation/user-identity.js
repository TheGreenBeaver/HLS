const { ACTIONS } = require('../constants');
const { string } = require('yup');
const { ensureEmpty, strictObject } = require('./_validators');


module.exports = {
  [ACTIONS.me]: strictObject({
    token: string().length(40)
  }),
  [ACTIONS.logOut]: ensureEmpty,
  [ACTIONS.authenticate]: strictObject({
    email: string().email(),
    password: string().max(100)
  })
}