const childProcess = require('child_process');
const path = require('path');
const { getAchievableResolutions, composeScalingArgs } = require('./resolutions');
const { last } = require('lodash');


const THUMBNAIL_FRAME = 1;
const THUMBNAIL_NAME = 'thumbnail';
const DEFAULT_THUMBNAIL_EXT = '.png';

async function getBestResolution(inputPath) {
  const achievableResolutions = await getAchievableResolutions(inputPath);
  return last(achievableResolutions);
}

async function composeBestScalingArgs(inputPath) {
  const bestResolution = await getBestResolution(inputPath);
  return `-vf "${composeScalingArgs(...bestResolution)}"`;
}

async function composeCommand(output, inputPath, extra) {
  const scalingArgs = await composeBestScalingArgs(inputPath);
  const input = `ffmpeg -i "${inputPath}"`;
  return [input, extra, scalingArgs, `"${output}"`].filter(Boolean).join(' ');
}

/**
 *
 * @param {string} inputPath
 * @param {string} outputDir
 * @param {boolean} fromImage
 * @return {Promise<string>}
 */
async function makeThumbnail(inputPath, outputDir, fromImage) {
  const extra = fromImage ? null : `-vf "select=eq(n\\,${THUMBNAIL_FRAME})" -vframes 1`;
  const outputExt = fromImage ? path.extname(inputPath) : DEFAULT_THUMBNAIL_EXT;
  const output = path.join(outputDir, `${THUMBNAIL_NAME}${outputExt}`);
  const command = await composeCommand(output, inputPath, extra);
  return new Promise((resolve, reject) =>
    childProcess.exec(command, error => error ? reject(error) : resolve(output))
  );
}

module.exports = makeThumbnail