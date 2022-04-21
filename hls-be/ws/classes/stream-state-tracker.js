const { getLiveStreamProc } = require('../../ffmpeg');
const log = require('../../util/logger');
const httpStatus = require('http-status');
const { ACTIONS, ACK_ABLE } = require('../constants');
const { VIDEO_BASIC } = require('../../util/query-options');
const { serializeVideo } = require('../../serializers/videos');
const { isEmpty } = require('lodash');


class ChunksQueue {
  #onFinish = null;
  #writing = false;
  /**
   *
   * @type {Buffer[]}
   */
  #queue = [];
  #inp = null;

  constructor(inp) {
    this.#inp = inp;
  }

  requestFinish(onFinish) {
    this.#onFinish = onFinish;
  }

  #tick() {
    if (isEmpty(this.#queue)) {
      if (typeof this.#onFinish === 'function') {
        log(log.levels.info, 'Queue empty');
        this.#onFinish(() => { this.#onFinish = null; });
      }
      return;
    }

    if (this.#writing) {
      log(log.levels.debug, `${this.#queue.length} chunks waiting in queue`);
      return;
    }

    const nextChunk = this.#queue.pop();
    this.#writing = true;
    this.#inp.write(nextChunk, writeErr => {
      if (writeErr) {
        log(log.levels.error, `Error writing to FFMPEG stdin: ${writeErr.message || writeErr.code}`);
      } else {
        log(log.levels.debug, 'Read next chunk');
      }

      this.#writing = false;
      this.#tick();
    });
  }

  /**
   *
   * @param {Buffer} chunk
   */
  append(chunk) {
    this.#queue.unshift(chunk);
    this.#tick();
  }
}


class StreamStateTracker {
  #dbRecord = null;
  #wsRef;
  /**
   * @type {ChunksQueue}
   */
  #queue;
  /**
   * @type {ChildProcessWithoutNullStreams}
   */
  streamTransformerProc = null;
  isLive = false;

  /**
   *
   * @param {ObsWebSocket} wsRef
   */
  constructor(wsRef) {
    this.#wsRef = wsRef;
  }

  /**
   *
   * @param {Buffer} chunk
   */
  handleChunk(chunk) {
    if (this.isLive) {
      this.#queue.append(chunk);
    }
  }

  async #pingStreamer(liveStreamId) {
    const theUser = this.#wsRef.userAccessLogic.user;
    const theStream = (await theUser.getVideos(liveStreamId, { ...VIDEO_BASIC }))[0];
    return this.#wsRef.sendMessage({
      action: ACTIONS.streamPlannedReminder,
      payload: serializeVideo(theStream)
    });
  }

  async startLiveStream(dbRecord, resultDir, plan) {
    const theUser = this.#wsRef.userAccessLogic.user;
    if (plan) {
      this.#wsRef.wsServerRef.jobs.planForUser(theUser.id, dbRecord.id, plan, this.#pingStreamer, [dbRecord.id]);
      return;
    }

    this.#dbRecord = dbRecord;

    const { proc, masterFileName } = await getLiveStreamProc(resultDir);

    this.#dbRecord.location = masterFileName;
    await this.#dbRecord.save();

    const subscribers = await theUser.getSubscribers();
    proc.on('error', async err => {
      // TODO: Try continuing the same stream
      log(log.levels.error, `Error processing stream from User#${theUser.id}: ${err.message}`);
      const updatedRecord = await this.finishLiveStream();
      await this.#wsRef.wsServerRef.broadcast(
        () => Promise.resolve({
          status: httpStatus.INTERNAL_SERVER_ERROR,
          action: ACTIONS.streamStateAck,
          payload: { video: serializeVideo(updatedRecord), state: ACK_ABLE.crashed }
        }),
        client => Promise.resolve(client === this.#wsRef || subscribers.includes(client.userAccessLogic.user))
      );
    });

    this.#queue = new ChunksQueue(proc.stdin);
    this.streamTransformerProc = proc;

    await this.#wsRef.wsServerRef.broadcast(
      () => Promise.resolve({
        action: ACTIONS.streamStateAck, payload: { video: serializeVideo(this.dbRecord), state: ACK_ABLE.started }
      }), client => Promise.resolve(subscribers.includes(client.user))
    );

    this.isLive = true;
  }

  async finishLiveStream() {
    this.#dbRecord.isLiveNow = false;
    await this.#dbRecord.save();

    return new Promise(resolve => {
      this.#queue.requestFinish(cb => {
        this.streamTransformerProc.kill();

        this.streamTransformerProc.once('close', () => {
          this.isLive = false;
          cb();
          resolve(this.#dbRecord);
        });
      });
    });
  }
}

module.exports = StreamStateTracker;