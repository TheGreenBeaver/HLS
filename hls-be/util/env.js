const ENVS = {
  dev: 'development',
  test: 'test',
  prod: 'production'
};

function getVar(name, defaultVal = '') {
  try {
    require('dotenv').config();
  } catch {}
  return process.env[name] || defaultVal;
}

function getEnv() {
  return getVar('ENVIRONMENT', ENVS.dev);
}

const isOnWindows = process.platform === 'win32';
const isDev = getEnv() === ENVS.dev;

module.exports = {
  ENVS,
  getVar,
  getEnv,

  isOnWindows,
  isDev
};