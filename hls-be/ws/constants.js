const ACTIONS = {
  startStream: 'startStream',
  endStream: 'endStream',

  streamStartAck: 'streamStartAck',
  streamEndAck: 'streamEndAck',

  signUp: 'signUp',
  confirm: 'confirm',

  authenticate: 'authenticate',
  me: 'me',
  logOut: 'logOut',
  editUser: 'editUser',
  dropPasswordChange: 'dropPasswordChange',
  resetPassword: 'resetPassword',

  uploadVideo: 'uploadVideo',
  videoProcessedAck: 'videoProcessedAck',
  listVideos: 'listVideos',
  retrieveVideo: 'retrieveVideo',
};

const EVENTS = {
  connection: 'connection',
  message: 'message',
  upgrade: 'upgrade',
};

module.exports = {
  ACTIONS, EVENTS
}