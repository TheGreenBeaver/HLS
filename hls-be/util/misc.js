const path = require('path');
const { getVar } = require('./env');
const { PORT, MEDIA_PATH, MEDIA_DIR } = require('../settings');
const { padStart } = require('lodash');


function getFileIsUsable(file, basename) {
  return file.indexOf('.') !== 0 && file !== basename && path.extname(file) === '.js'
}

function getHost() {
  return getVar('HOST', `http://localhost:${PORT}`);
}

function composeMediaPath(file, baseDir = MEDIA_DIR, basePath = MEDIA_PATH) {
  if (!file) {
    return null;
  }

  if (file.startsWith('http')) {
    return file;
  }

  const fixSepPattern = new RegExp('\\' + path.sep, 'g');
  const purePath = path.relative(baseDir, file).replace(fixSepPattern, '/');
  return `${getHost()}${basePath}/${purePath}`;
}

function completeNum(num, len = 2) {
  return padStart(`${num}`, len, '0')
}

function formatTime(now = new Date()) {
  const day = completeNum(now.getDate());
  const month = completeNum(now.getMonth());
  const year = completeNum(now.getFullYear(), 4);
  const date = `${day}/${month}/${year}`;

  const hours = completeNum(now.getHours());
  const minutes = completeNum(now.getMinutes());
  const seconds = completeNum(now.getSeconds());
  const time = `${hours}:${minutes}:${seconds}`;

  return `[${date} ${time}]`;
}

module.exports = {
  getFileIsUsable, getHost, composeMediaPath, formatTime
};