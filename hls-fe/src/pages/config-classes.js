import { withAccessControl } from './access-control';
import queryString from 'query-string';
import { last } from 'lodash';


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
    const withPathParams = pathParts.map(part => part.startsWith(':') ? params[paramIdx++] : part).join('/');
    if (paramIdx >= params.length) {
      return withPathParams;
    }

    return `${withPathParams}/?${queryString.stringify(last(params))}`;
  }
}

class RouteConfig {
  static ANY = 'any';

  constructor(appLink, component, {
    isAuthorized = RouteConfig.ANY,
    isVerified = RouteConfig.ANY,
    exact = true,
    narrow = false
  } = {}) {
    this.path = appLink instanceof AppLink ? appLink.path : appLink;
    this.component = withAccessControl(
      component, narrow, userState => this.fits({ isAuthorized, isVerified }, userState)
    );
    this.exact = exact;
  }

  fits(requiredState, userState) {
    return ['isAuthorized', 'isVerified'].every(stateField =>
      [userState[stateField], RouteConfig.ANY].includes(requiredState[stateField])
    );
  }
}

export { AppLink, RouteConfig };