import { Switch, Redirect, Route } from 'react-router-dom';
import { links as authLinks, routes as authRoutes } from './auth/routing';
import { links as videosLinks, routes as videosRoutes } from './videos/routing';
import { links as channelsLinks, routes as channelsRoutes } from './channels/routing';


const links = {
  auth: authLinks,
  videos: videosLinks,
  channels: channelsLinks
};

const routes = [
  ...authRoutes,
  ...videosRoutes,
  ...channelsRoutes
];

function Routing() {
  return (
    <Switch>
      {routes.map((routeConfig) => <Route key={routeConfig.component.name} {...routeConfig} />)}
      <Redirect to={links.videos.list.path} />
    </Switch>
  );
}

export { links };
export default Routing;