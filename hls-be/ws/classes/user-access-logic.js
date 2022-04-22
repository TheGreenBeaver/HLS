const { ACTIONS } = require('../constants');
const Permission = require('./permission');
const httpStatus = require('http-status');
const { NON_FIELD_ERR } = require('../../settings');

class UserAccessLogic {
  static permissions = {
    [ACTIONS.startStream]: new Permission({ isAuthorized: true, isVerified: true }),
    [ACTIONS.endStream]: new Permission({ isAuthorized: true, isVerified: true }),
    [ACTIONS.streamStateAck]: new Permission({ srv: true }),
    [ACTIONS.confirmPlan]: new Permission({ isAuthorized: true, isVerified: true }),
    [ACTIONS.streamPlannedReminder]: new Permission({ srv: true }),

    [ACTIONS.signUp]: new Permission({ isAuthorized: false }),
    [ACTIONS.confirm]: new Permission(),

    [ACTIONS.authenticate]: new Permission({ isAuthorized: false }),
    [ACTIONS.me]: new Permission(),
    [ACTIONS.logOut]: new Permission({ isAuthorized: true }),
    [ACTIONS.editUser]: new Permission({ isAuthorized: true, isVerified: true }),
    [ACTIONS.dropPasswordChange]: new Permission({ isAuthorized: true, isVerified: true }),
    [ACTIONS.resetPassword]: new Permission({ isAuthorized: false }),
    [ACTIONS.subscribe]: new Permission({ isAuthorized: true, isVerified: true }),
    [ACTIONS.listChannels]: new Permission({ isAuthorized: true, isVerified: true }),
    [ACTIONS.retrieveUser]: new Permission(),

    [ACTIONS.uploadVideo]: new Permission({ isAuthorized: true, isVerified: true }),
    [ACTIONS.videoProcessedAck]: new Permission({ srv: true }),
    [ACTIONS.listVideos]: new Permission(),
    [ACTIONS.retrieveVideo]: new Permission(),

    [ACTIONS.search]: new Permission()
  };

  /**
   * @type {User}
   */
  user = null;

  /**
   *
   * @param {IstWebSocket} wsRef
   */
  constructor(wsRef) {
    this.wsRef = wsRef;
  }

  get isAuthorized() {
    return !!this.user;
  }

  get isVerified() {
    return !!this.user && this.user.isVerified;
  }

  matches(user) {
    return this.isAuthorized && this.user.id === user.id;
  }

  async logIn(user, action) {
    const loggedInUser = await user.logInWithToken();
    this.user = user;
    await this.wsRef.sendMessage({ payload: { token: loggedInUser.authToken }, action });
  }

  logOut() {
    this.user = null;
  }

  async getIsAllowed(action) {
    const permission = UserAccessLogic.permissions[action];
    if (!permission) {
      await this.wsRef.sendMessage({
        status: httpStatus.NOT_FOUND,
        payload: { [NON_FIELD_ERR]: [`Unknown action ${action}`] }
      });
      return false;
    }

    const accessErr = permission.getAccessErr(this);
    if (accessErr) {
      const toSend = typeof accessErr === 'number'
        ? { status: accessErr }
        : { status: httpStatus.FORBIDDEN, payload: { [NON_FIELD_ERR]: [accessErr] } };
      await this.wsRef.sendMessage({ ...toSend, action });
      return false;
    }

    return true;
  }
}

module.exports = UserAccessLogic;