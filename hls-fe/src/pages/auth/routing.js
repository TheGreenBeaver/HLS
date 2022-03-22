import { AppLink, RouteConfig } from '../config-classes';
import SignUp from './sign-up';
import SignIn from './sign-in';
import Confirm from './confirm';
import NotVerified from './not-verified';
import ResetPassword from './reset-password';
import confirmableActions from './confirm/confirmable-actions';
import { snakeCase } from 'lodash';


const confirmableActionsPattern = Object.values(confirmableActions).map(a => snakeCase(a)).join('|');
const links = {
  signIn: new AppLink('/sign_in'),
  signUp: new AppLink('/sign_up'),
  confirm: new AppLink(`/confirm/:confirmedAction(${confirmableActionsPattern})/:uid/:token`),
  notVerified: new AppLink('/not_verified'),
  resetPassword: new AppLink('/reset_password')
};

const routes = [
  new RouteConfig(links.signIn, SignIn, {
    isAuthorized: false,
    isVerified: RouteConfig.ANY
  }),
  new RouteConfig(links.signUp, SignUp, {
    isAuthorized: false,
    isVerified: RouteConfig.ANY
  }),
  new RouteConfig(links.confirm, Confirm, {
    isAuthorized: RouteConfig.ANY,
    isVerified: RouteConfig.ANY
  }),
  new RouteConfig(links.notVerified, NotVerified, {
    isVerified: false
  }),
  new RouteConfig(links.resetPassword, ResetPassword, {
    isAuthorized: false,
    isVerified: RouteConfig.ANY
  })
];

export { links, routes };