const ENVS = {
  dev: 'dev',
  prod: 'prod',
};

function getVar(name, defaultVal = '') {
  return process.env[name] || defaultVal;
}

function getEnv() {
  return getVar('REACT_APP_ENV', ENVS.dev).toLowerCase();
}

const isDev = getEnv() === ENVS.dev;

export { getVar, getEnv, isDev };