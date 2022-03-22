const ObsWebSocketServer = require('./ws/obs-web-socket-server');
const { isDev } = require('./util/env');

const wsServer = new ObsWebSocketServer();
if (isDev) {
  const startDevStaticServer = require('./dev-static-server');
  startDevStaticServer(wsServer);
}