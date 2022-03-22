const { composeArgs, KINDS } = require('./settings');
const childProcess = require('child_process');
const path = require('path');
const fs = require('fs');
const { formatTime } = require('../util/misc');


/**
 *
 * @param {string} tempFileName
 * @param {string} liveStreamDir
 * @return {Promise<{ proc: ChildProcessWithoutNullStreams, masterFileName: string }>}
 */
async function getLiveStreamProc(tempFileName, liveStreamDir) {
  const { args, masterFileName } = await composeArgs(tempFileName, liveStreamDir, KINDS.liveStream);
  const fullArgs = ['-follow 1', ...args];

  const logsFileName = path.join(liveStreamDir, 'ffmpeg-log.txt');
  const logsFile = await fs.promises.open(logsFileName, 'a');

  const proc = childProcess.spawn('ffmpeg', fullArgs, {
    windowsVerbatimArguments: false
  });

  // ffmpeg writes to stderr instead of stdout
  proc.stderr.on('data', async chunk => {
    const toLog = `\n${formatTime()}\n${chunk}\n`;
    await logsFile.appendFile(toLog);
  });

  proc.on('close', async () => {
    await logsFile.close();
    await fs.promises.rm(tempFileName);
  });

  return { proc, masterFileName };
}

/**
 *
 * @param {string} originalFileName
 * @param {string} resultDir
 * @return {Promise<string>}
 */
async function processUploadedFile(originalFileName, resultDir) {
  const { args, masterFileName } = await composeArgs(originalFileName, resultDir, KINDS.video);
  const fullArgs = `ffmpeg ${args.join(' ')}`;

  try {
    await new Promise((resolve, reject) =>
      childProcess.exec(fullArgs, error => error ? reject(error): resolve())
    );
  } finally {
    await fs.promises.rm(originalFileName);
  }

  return masterFileName;
}

module.exports = {
  getLiveStreamProc, processUploadedFile
};