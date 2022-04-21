const { exportModule } = require('../../util/misc');
const path = require('path');
module.exports = exportModule(path.basename(__filename), __dirname);