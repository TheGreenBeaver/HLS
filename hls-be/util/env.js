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
  return getVar('NODE_ENV', ENVS.dev);
}

const isDev = getEnv() === ENVS.dev;

function getPort() {
  return parseInt(getVar('INTERNAL_PORT', '8000'));
}

const port = getPort();

function getOrigin() {
  return getVar('HOST', `http://localhost:${port}`);
}

const origin = getOrigin();


module.exports = {
  ENVS, getVar, origin, port, isDev
};