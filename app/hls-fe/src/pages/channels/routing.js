import { AppLink, RouteConfig } from '../config-classes';
import Search from './search';
import SingleChannel from './single-channel';

const links = {
  search: new AppLink('/search'),
  single: new AppLink('/channel/:id(\\d+)'),
};

const routes = [
  new RouteConfig(links.search, Search),
  new RouteConfig(links.single, SingleChannel)
];

export { links, routes };