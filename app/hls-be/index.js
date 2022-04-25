const IstWebSocketServer = require('./ws/classes/ist-web-socket-server');
const { isDev } = require('./util/env');

const wsServer = new IstWebSocketServer();
if (isDev) {
  const startDevStaticServer = require('./dev-static-server');
  startDevStaticServer(wsServer);
}