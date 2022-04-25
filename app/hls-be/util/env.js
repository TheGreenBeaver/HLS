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
  const protocol = isDev ? 'http' : 'https';
  const host = getVar('SRV_NAME', `localhost:${port}`);
  return `${protocol}://${host}`;
}

const origin = getOrigin();

module.exports = {
  ENVS, getVar, getEnv, origin, port, isDev
};