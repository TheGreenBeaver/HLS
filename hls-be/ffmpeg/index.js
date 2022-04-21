const composeArgs = require('./settings');
const childProcess = require('child_process');
const path = require('path');
const fs = require('fs');
const { formatTime, CONTENT_KINDS } = require('../util/misc');
const { LOG_F_NAME, DONE_LOG_F_NAME } = require('../settings');


/**
 *
 * @param {string} tempFileName
 * @param {string} liveStreamDir
 * @return {Promise<{ proc: ChildProcessWithoutNullStreams, masterFileName: string }>}
 */
async function getLiveStreamProc(tempFileName, liveStreamDir) {
  const { args, masterFileName } = await composeArgs(tempFileName, liveStreamDir, CONTENT_KINDS.liveStream);
  const fullArgs = [
    '-follow', '1',
    ...(args.map(a => {
      const spaceIdx = a.indexOf(' ');
      return [a.substring(0, spaceIdx), a.substring(spaceIdx + 1)];
    }).flat().filter(Boolean))
  ];

  const logsFileName = path.join(liveStreamDir, LOG_F_NAME);
  const logsFile = await fs.promises.open(logsFileName, 'a');

  const proc = childProcess.spawn('ffmpeg', fullArgs, {
    windowsVerbatimArguments: true
  });

  // ffmpeg writes to stderr instead of stdout
  proc.stderr.on('data', async chunk => {
    const toLog = `\n${formatTime()}\n${chunk}\n`;
    await logsFile.appendFile(toLog);
  });

  proc.on('close', async () => {
    await logsFile.close();
    await fs.promises.rename(logsFileName, path.join(liveStreamDir, DONE_LOG_F_NAME));
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
  const { args, masterFileName } = await composeArgs(originalFileName, resultDir, CONTENT_KINDS.video);
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