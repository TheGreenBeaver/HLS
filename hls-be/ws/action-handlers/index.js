const fs = require('fs');
const { getFileIsUsable } = require('../../util/misc');
const path = require('path');

const basename = path.basename(__filename);
module.exports = fs
  .readdirSync(__dirname)
  .filter(f => getFileIsUsable(f, basename))
  .reduce((allHandlers, fileWithHandlers) => ({
    ...allHandlers,
    ...require(`./${path.basename(fileWithHandlers, '.js')}`)
  }), {});