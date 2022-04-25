const ACTIONS = {
  startStream: 'startStream',  // a = true, v = true
  endStream: 'endStream', // a = true, v = true
  confirmPlan: 'confirmPlan', // a = true, v = true
  streamStateAck: 'streamStateAck', // srv
  streamPlannedReminder: 'streamPlannedReminder', //srv

  signUp: 'signUp', // a = false, v = ?
  confirm: 'confirm', // a = ?, v = ?

  authenticate: 'authenticate', // a = false, v = ?
  me: 'me', // a = true, v = ?
  logOut: 'logOut', // a = true, v = ?
  editUser: 'editUser',  // a = true, v = true
  dropPasswordChange: 'dropPasswordChange', // a = true, v = true
  resetPassword: 'resetPassword', // a = false, v = ?
  subscribe: 'subscribe',
  listChannels: 'listChannels',
  retrieveUser: 'retrieveUser', // a = ?, v = ?

  uploadVideo: 'uploadVideo', // a = true, v = true
  videoProcessedAck: 'videoProcessedAck', // srv
  listVideos: 'listVideos', // a = ?, v = ?
  retrieveVideo: 'retrieveVideo', // a = ?, v = ?

  search: 'search' // a = ?, v = ?
};

const EVENTS = {
  connection: 'connection',
  message: 'message',
  upgrade: 'upgrade',
};

const CONFIRMABLE = {
  verify: 'verify',
  changePassword: 'changePassword',
  resetPassword: 'resetPassword',
};
const SEARCHABLE = {
  video: 'video',
  user: 'user',
};
const ACK_ABLE = {
  started: 'started',
  gracefullyEnded: 'gracefullyEnded',
  cancelled: 'cancelled',
  crashed: 'crashed',
};

module.exports = {
  ACTIONS, EVENTS, CONFIRMABLE, SEARCHABLE, ACK_ABLE
}