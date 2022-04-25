const httpStatus = require('http-status');

class Permission {
  static ANY = 'any';
  constructor({ isAuthorized = Permission.ANY, isVerified = Permission.ANY, srv = false } = {}) {
    this.isAuthorized = isAuthorized;
    this.isVerified = isVerified;
    this.srv = srv;
  }

  /**
   *
   * @param {UserAccessLogic} userAccessLogic
   */
  getAccessErr(userAccessLogic) {
    if (this.srv) {
      return 'This action can only be used by server';
    }

    if (this.isAuthorized === true && !userAccessLogic.isAuthorized) {
      return httpStatus.UNAUTHORIZED;
    }

    if (this.isAuthorized === false && userAccessLogic.isAuthorized) {
      return 'Only allowed for non-authorized users';
    }

    if (this.isVerified === true && !userAccessLogic.isVerified) {
      return 'Only allowed for verified users';
    }

    return null;
  }
}

module.exports = Permission;