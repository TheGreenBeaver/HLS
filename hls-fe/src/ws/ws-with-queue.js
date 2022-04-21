import { decode, encode } from './transformers';


class WsWithQueue extends WebSocket {
  queue = [];
  interceptor = () => true;
  static OK_THRESHOLD = 299;

  constructor(...args) {
    super(...args);

    this.addEventListener('open', async () => {
      for (const enqueued of this.queue) {
        if (enqueued instanceof Blob) {
          await this.sendStreamChunk(enqueued);
        } else {
          await this.sendMessage(...enqueued);
        }
      }
    });

    this.addEventListener('message', async messageEvent => {
      const { action, status, payload } = await decode(messageEvent.data);
      if (!this.interceptor(payload, status, action)) {
        this.dispatchEvent(new CustomEvent(action, { detail: { payload, status } }));
      }
    });
  }

  /**
   *
   * @param {Blob} chunk
   * @return {Promise<void>}
   */
  async sendStreamChunk(chunk) {
    if (this.readyState !== this.OPEN) {
      this.queue.push(chunk);
      return;
    }

    const toSend = await encode(chunk);
    return this.send(toSend);
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
    return new Promise((resolve, reject) => {
      this.addEventListener(action, ({ detail }) => {
        const fn = detail.status > WsWithQueue.OK_THRESHOLD ? reject : resolve;
        fn(detail);
      }, { once: true });

      this.sendMessage(action, payload);
    });
  }

  subscribe(actionName, handler) {
    const removableHandler = ({ detail: { payload, status } }) => handler(payload, status);
    this.addEventListener(actionName, removableHandler);
    return () => this.removeEventListener(actionName, removableHandler);
  }
}

export default WsWithQueue;