class AppLink {
  /**
   *
   * @param {string} path - path to be used for the corresponding Route
   */
  constructor(path) {
    this.path = path;
  }

  get(...params) {
    const pathParts = this.path.split(/(?<!\\)\//);
    let paramIdx = 0;
    return pathParts.map(part => part.startsWith(':') ? params[paramIdx++] : part).join('/');
  }
}

class RouteConfig {
  static ANY = 'any';

  constructor(appLink, component, {
    isAuthorized = true,
    isVerified = true,
    exact = true
  } = {}) {
    this.path = appLink instanceof AppLink ? appLink.path : appLink;
    this.component = component;
    this.isAuthorized = isAuthorized;
    this.isVerified = isVerified;
    this.exact = exact;
  }

  fits(userState) {
    return ['isAuthorized', 'isVerified'].every(stateField =>
      [userState[stateField], RouteConfig.ANY].includes(this[stateField])
    );
  }
}

export { AppLink, RouteConfig };