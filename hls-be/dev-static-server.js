const serveStatic = require('serve-static');
const finalHandler = require('finalhandler');
const httpStatus = require('http-status');
const http = require('http');
const { MEDIA_DIR, FE_HOSTS, MEDIA_PATH, PORT } = require('./settings');
const log = require('./util/logger');
const { getHost } = require('./util/misc');
const { encode } = require('./ws/transformers');
const { EVENTS } = require('./ws/constants');


function startDevStaticServer(wsServer) {
  const serveMw = serveStatic(MEDIA_DIR, {
    setHeaders: res => {
      const reqOrigin = res.req.headers.origin;
      if (!FE_HOSTS.includes(reqOrigin)) {
        return;
      }
      const headers = [
        ['Access-Control-Allow-Origin', reqOrigin],
        ['Vary', 'Origin'],
        ['Access-Control-Allow-Methods', 'OPTIONS, POST, GET'],
        ['Access-Control-Max-Age', 2592000],
      ];
      res.statusCode = res.req.method === 'OPTIONS' ? httpStatus.NO_CONTENT : httpStatus.OK;
      headers.forEach(([name, value]) => res.setHeader(name, value));
    }
  });

  const httpServer = http.createServer((req, res) => {
    if (req.url.startsWith(MEDIA_PATH)) {
      const originalUrl = req.url;

      req.url = req.url.replace(MEDIA_PATH, '');
      serveMw(req, res, (...args) => {
        req.url = originalUrl;
        return finalHandler(req, res)(...args);
      });
    } else {
      res.writeHead(httpStatus.NOT_FOUND);
      res.end();
    }
  });

  httpServer.on(EVENTS.upgrade, (request, socket, head) => {
    log(log.levels.debug, 'New WebSocket connection request...');
    try {
      wsServer.handleUpgrade(request, socket, head, ws => wsServer.emit(EVENTS.connection, ws));
    } catch (e) {
      log(log.levels.error, 'WebSocket connection failed');
      socket.write(encode({ status: httpStatus.INTERNAL_SERVER_ERROR }));
      socket.destroy();
    }
  });

  httpServer.listen(PORT, () => log(log.levels.debug, `Server is running on ${getHost()}`));
}

module.exports = startDevStaticServer;