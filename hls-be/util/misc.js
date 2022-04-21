const path = require('path');
const { getVar } = require('./env');
const { PORT, MEDIA_PATH, MEDIA_DIR } = require('../settings');
const { padStart } = require('lodash');
const fs = require('fs');


function getFileIsUsable(file, basename) {
  return file.indexOf('.') !== 0 && file !== basename && path.extname(file) === '.js' && !file.startsWith('_');
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

  const purePath = path.relative(baseDir, file).replace(/\\/g, '/');
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

function exportModule(basename, dirname) {
  return fs
    .readdirSync(dirname)
    .filter(f => getFileIsUsable(f, basename))
    .reduce((mod, modFile) => ({
      ...mod,
      ...require(`${dirname}/${path.basename(modFile, '.js')}`)
    }), {});
}

const CONTENT_KINDS = {
  liveStream: 'liveStream',
  video: 'video',
};

module.exports = {
  getFileIsUsable, getHost, composeMediaPath, formatTime, exportModule,
  CONTENT_KINDS
};