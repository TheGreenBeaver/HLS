const fs = require('fs');
const { getLiveStreamProc } = require('../../ffmpeg');
const log = require('../../util/logger');
const httpStatus = require('http-status');
const { ACTIONS, ACK_ABLE } = require('../constants');
const { VIDEO_BASIC } = require('../../util/query-options');
const { serializeVideo } = require('../../serializers/videos');
const { HLS_SEGMENT_DUR } = require('../../settings');
const { Video } = require('../../models');

class StreamStateTracker {
  static STATE = {
    notStreaming: 'notStreaming',
    started: 'started',
    activating: 'activating',
    activelyStreaming: 'activelyStreaming'
  };

  /**
   * @type {FileHandle}
   */
  streamCollectorFile = null;
  /**
   *
   * @type {string | null}
   */
  streamCollectorFilePath = null;
  state = StreamStateTracker.STATE.notStreaming;
  dbRecord = null;
  /**
   * @type {ChildProcessWithoutNullStreams}
   */
  streamTransformerProc = null;
  /**
   *
   * @type {string | null}
   */
  resultDir = null;

  /**
   *
   * @param {ObsWebSocket} wsRef
   */
  constructor(wsRef) {
    this.wsRef = wsRef;
  }

  get isLive() {
    return this.state !== StreamStateTracker.STATE.notStreaming;
  }

  /**
   *
   * @param {Buffer} chunk
   * @return {Promise<void>}
   */
  async handleChunk(chunk) {
    if (this.state === StreamStateTracker.STATE.notStreaming) {
      return;
    }
    await this.streamCollectorFile.appendFile(chunk);
    if (this.state === StreamStateTracker.STATE.started) {
      this.state = StreamStateTracker.STATE.activating;
      await this.activateLiveStream();
      this.state = StreamStateTracker.STATE.activelyStreaming;
    }
  }

  async _pingStreamer(liveStreamId) {
    const theStream = await Video.findByPk(liveStreamId, { ...VIDEO_BASIC });
    return this.wsRef.sendMessage({
      action: ACTIONS.streamPlannedReminder,
      payload: serializeVideo(theStream)
    });
  }

  async _start(tempFileName, liveStreamId, resultDir) {
    const theUser = this.wsRef.userAccessLogic.user;
    this.dbRecord = (await theUser.getVideos({ where: { id: liveStreamId }, ...VIDEO_BASIC }))[0];
    this.streamCollectorFile = await fs.promises.open(tempFileName, 'a');
    this.streamCollectorFilePath = tempFileName;
    this.resultDir = resultDir;
    this.state = StreamStateTracker.STATE.started;
  }

  async startLiveStream(tempFileName, liveStreamId, resultDir, plan) {
    if (plan) {
      const theUser = this.wsRef.userAccessLogic.user;
      this.wsRef.wsServerRef.jobs.planForUser(theUser.id, liveStreamId, plan, this._pingStreamer, [liveStreamId]);
      await fs.promises.rm(tempFileName);
    } else {
      await this._start(tempFileName, liveStreamId, resultDir);
    }
  }

  async activateLiveStream() {
    const theUser = this.wsRef.userAccessLogic.user;
    const { proc, masterFileName } = await getLiveStreamProc(this.streamCollectorFilePath, this.resultDir);
    this.resultDir = null;
    this.streamTransformerProc = proc;

    this.dbRecord.location = masterFileName;
    this.dbRecord.isLiveNow = true;
    await this.dbRecord.save();

    const subscribers = await theUser.getSubscribers();
    proc.on('error', async err => {
      // TODO: Try continuing the same stream
      log(log.levels.error, `Error processing stream from User#${theUser.id}: ${err.message}`);
      await this.finishLiveStream();
      await this.wsRef.wsServerRef.broadcast(
        () => Promise.resolve({
          status: httpStatus.INTERNAL_SERVER_ERROR,
          action: ACTIONS.streamStateAck,
          payload: { video: serializeVideo(this.dbRecord), state: ACK_ABLE.crashed }
        }),
        client => Promise.resolve(client === this.wsRef || subscribers.includes(client.userAccessLogic.user))
      );
    });

    await this.wsRef.wsServerRef.broadcast(
      () => Promise.resolve({
        action: ACTIONS.streamStateAck, payload: { video: serializeVideo(this.dbRecord), state: ACK_ABLE.started }
      }), client => Promise.resolve(subscribers.includes(client.user))
    );
  }

  async finishLiveStream(streamedDuration) {
    if (streamedDuration) {
      await new Promise(resolve =>
        this.streamTransformerProc.stderr.on('data', chunk => {
          const chunkAsStr = chunk.toString();
          const timeInfo = chunkAsStr.split(' ').find(info => info.startsWith('time='));
          if (!timeInfo) {
            return;
          }

          const processedTimeAsStr = timeInfo.replace('time=', '');
          const processedTime = processedTimeAsStr.split(':').reduce((dur, strTime, idx) => {
            const numTime = +strTime;
            const pow = 2 - idx;
            return dur + Math.pow(60, pow) * numTime * 1000;
          }, 0);
          if (Math.abs(processedTime - streamedDuration) <= 1000 * HLS_SEGMENT_DUR) {
            resolve();
          }
        })
      );
    }

    this.streamTransformerProc.kill();

    await new Promise(resolve => {
      this.streamTransformerProc.once('close', resolve);
    });
    this.streamTransformerProc = null;

    await this.streamCollectorFile.close();
    this.streamCollectorFile = null;

    await fs.promises.rm(this.streamCollectorFilePath, { recursive: true });
    this.streamCollectorFilePath = null;

    this.dbRecord.isLiveNow = false;
    await this.dbRecord.save();

    this.state = StreamStateTracker.STATE.notStreaming;

    return this.dbRecord;
  }
}

module.exports = StreamStateTracker;