import { AppLink, RouteConfig } from '../config-classes';
import VideosList from './videos-list';
import UploadVideo from './upload-video';
import GoLive from './go-live';
import SingleVideo from './single-video';


const links = {
  list: new AppLink('/videos'),
  single: new AppLink('/videos/:id(\\d+)'),
  upload: new AppLink('/videos/upload'),
  goLive: new AppLink('/videos/go_live'),
};

const routes = [
  new RouteConfig(links.list, VideosList),
  new RouteConfig(links.single, SingleVideo),
  new RouteConfig(links.upload, UploadVideo, {
    isAuthorized: true,
    isVerified: true
  }),
  new RouteConfig(links.goLive, GoLive, {
    isAuthorized: true,
    isVerified: true
  })
];

export { links, routes };