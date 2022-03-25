import { Route, Switch, Redirect } from 'react-router-dom';
import { omit } from 'lodash';
import { links as authLinks, routes as authRoutes } from './auth/routing';
import { links as videosLinks, routes as videosRoutes } from './videos/routing';
import Loading from '../components/loading';
import { useUserState } from '../store/selectors';


const links = {
  auth: authLinks,
  videos: videosLinks
};

const routes = [
  ...authRoutes,
  ...videosRoutes
];

function getDefaultRoute({ isAuthorized, isVerified }) {
  if (!isAuthorized) {
    return links.auth.signIn.path;
  }

  if (isVerified) {
    return links.videos.list.path;
  }

  return links.auth.notVerified.path;
}

function Routing() {
  const userState = useUserState();

  if (userState.isAuthorized && !userState.isFetched) {
    return <Loading />;
  }

  return (
    <Switch>
      {
        routes
          .filter(routeConfig => routeConfig.fits(userState))
          .map(routeConfig =>
            <Route
              key={routeConfig.component.name}
              {...omit(routeConfig, ['isVerified', 'isAuthorized'])}
            />
          )
      }
      <Redirect to={getDefaultRoute(userState)} />
    </Switch>
  );
}

export { links, getDefaultRoute };
export default Routing;