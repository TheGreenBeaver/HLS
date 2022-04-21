const path = require('path');


const PORT = 8000;
const FE_HOSTS = ['http://127.0.0.1:3000', 'http://localhost:3000'];

const WS_PATH = '/ws';
const MEDIA_PATH = '/media';

const ROOT_DIR = __dirname;
const TEMP_DIR = path.join(ROOT_DIR, '_temp_');
const MEDIA_DIR = path.join(ROOT_DIR, 'media');
const STREAMS_DIR = path.join(MEDIA_DIR, 'streams');
const VIDEOS_DIR = path.join(MEDIA_DIR, 'videos');
const AVATARS_DIR = path.join(MEDIA_DIR, 'user-avatars');

const NON_FIELD_ERR = 'nonFieldErr';
const EXPIRATION_TIME = 60 * 60 * 24 * 5; // 5 days
const DEFAULT_PAGE_SIZE = 30;

const LOG_F_NAME = 'ffmpeg-log.txt';
const DONE_LOG_F_NAME = 'ffmpeg-log.done.txt';

module.exports = {
  PORT,
  FE_HOSTS,

  WS_PATH,
  MEDIA_PATH,

  ROOT_DIR,
  TEMP_DIR,
  MEDIA_DIR,
  STREAMS_DIR,
  VIDEOS_DIR,
  AVATARS_DIR,

  NON_FIELD_ERR,
  EXPIRATION_TIME,
  DEFAULT_PAGE_SIZE,

  LOG_F_NAME,
  DONE_LOG_F_NAME
};