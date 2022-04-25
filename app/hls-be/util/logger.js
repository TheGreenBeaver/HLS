const colors = require('colors/safe');
const { formatTime } = require('./misc');

const levels = {
  error: 'error',
  warn: 'warn',
  info: 'info',
  success: 'success',
  debug: 'debug',
};

colors.setTheme({
  [levels.error]: 'red',
  [levels.warn]: 'yellow',
  [levels.info]: 'cyan',
  [levels.success]: 'green',
  [levels.debug]: 'grey',

  default: 'white'
});

function log(level, message) {
  const theLevel = level in levels ? level : 'default';
  console.log(colors[theLevel](`${formatTime()} -- ${message}`));
}

log.levels = levels;

module.exports = log;