import { decode, encode } from './transformers';
import { omitBy } from 'lodash';


class WsWithQueue extends WebSocket {
  queue = [];
  interceptor = () => true;
  static OK_THRESHOLD = 299;

  constructor(...args) {
    super(...args);

    this.addEventListener('open', async () => {
      for (const enqueued of this.queue) {
        await this.sendMessage(...enqueued);
      }
    });

    this.addEventListener('message', async messageEvent => {
      const { action, status, payload } = await decode(messageEvent.data);
      if (!this.interceptor(payload, status, action)) {
        this.dispatchEvent(new CustomEvent(action, { detail: { payload, status } }));
      }
    });
  }

  async sendMessage(action, payload) {
    if (this.readyState !== this.OPEN) {
      this.queue.push([action, payload]);
      return;
    }

    const toSend = await encode({ action, payload });
    return this.send(toSend);
  }

  async request(action, payload) {
    const responsePromise = new Promise((resolve, reject) => {
      this.addEventListener(action, ({ detail }) => {
        const fn = detail.status > WsWithQueue.OK_THRESHOLD ? reject : resolve;
        fn(detail);
      }, { once: true });
    });
    await this.sendMessage(action, payload);

    return responsePromise;
  }

  subscribe(actionName, handler) {
    const removableHandler = ({ detail: { payload, status } }) => handler(payload, status);
    this.addEventListener(actionName, removableHandler);
    return () => this.removeEventListener(actionName, removableHandler);
  }
}

export default WsWithQueue;