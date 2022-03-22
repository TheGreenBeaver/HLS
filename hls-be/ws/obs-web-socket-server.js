const { WebSocketServer, OPEN } = require('ws');
const { WS_PATH, PORT } = require('../settings');
const ObsWebSocket = require('./obs-web-socket');
const log = require('../util/logger');
const { EVENTS } = require('./constants');
const { isDev } = require('../util/env');
const { getHost } = require('../util/misc');


class ObsWebSocketServer extends WebSocketServer {
  constructor() {
    const args = [{
      clientTracking: true,
      path: WS_PATH,
      WebSocket: ObsWebSocket
    }];
    if (isDev) {
      args[0].noServer = true;
    } else {
      args[0].port = PORT;
      const cb = () => log(log.levels.debug, `Server is running on ${getHost()}`);
      args.push(cb);
    }
    super(...args);

    this.on(EVENTS.connection, ws => {
      log(log.levels.debug, 'New WebSocket connection established');
      ws.wsServerRef = this;
    });
  }

  /**
   *
   * @return {Array<ObsWebSocket>}
   */
  get openClients() {
    return [...this.clients].filter(client => client.readyState === OPEN);
  }

  /**
   *
   * @param {function(client: ObsWebSocket): Promise<Object>} getData
   * @param {(function(client: ObsWebSocket): Promise<boolean>)=} shouldSendToClient
   * @return {Promise<boolean>} - `true` if managed to send to all required clients
   */
  async broadcast(getData, shouldSendToClient = () => Promise.resolve(true)) {
    const sendResults = [];
    for (const client of this.openClients) {
      const shouldSend = await shouldSendToClient(client);
      if (shouldSend) {
        const data = await getData(client);
        sendResults.unshift(true);
        await client.sendMessage(data, () => sendResults[0] = false);
      }
    }
    return sendResults.every(Boolean);
  }
}

module.exports = ObsWebSocketServer;