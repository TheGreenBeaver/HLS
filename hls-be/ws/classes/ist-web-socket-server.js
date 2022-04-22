const { WebSocketServer, OPEN } = require('ws');
const { WS_PATH, PORT } = require('../../settings');
const IstWebSocket = require('./ist-web-socket');
const log = require('../../util/logger');
const { EVENTS } = require('../constants');
const { isDev } = require('../../util/env');
const { getHost } = require('../../util/misc');
const Jobs = require('./jobs');


class IstWebSocketServer extends WebSocketServer {
  constructor() {
    const args = [{
      clientTracking: true,
      path: WS_PATH,
      WebSocket: IstWebSocket
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

    this.jobs = new Jobs(this);
  }

  /**
   *
   * @return {Array<IstWebSocket>}
   */
  get openClients() {
    return [...this.clients].filter(client => client.readyState === OPEN);
  }

  /**
   *
   * @param {function(client: IstWebSocket): Promise<Object>} getData
   * @param {(function(client: IstWebSocket): Promise<boolean>)=} shouldSendToClient
   * @return {Promise<boolean>} - `true` if managed to send to all required clients
   */
  async broadcast(getData, shouldSendToClient = () => Promise.resolve(true)) {
    const sendResults = [];
    for (const client of this.openClients) {
      const shouldSend = await shouldSendToClient(client);
      if (shouldSend) {
        const data = await getData(client);
        const idx = sendResults.length;
        sendResults.push(true);
        await client.sendMessage(data, () => sendResults[idx] = false);
      }
    }
    return sendResults.every(Boolean);
  }
}

module.exports = IstWebSocketServer;