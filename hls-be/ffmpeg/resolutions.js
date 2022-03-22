const childProcess = require('child_process');
const { isInteger } = require('lodash');


const ASPECT_RATIO = { w: 16, h: 9 };
function getWidth(h) {
  const raw = h * ASPECT_RATIO.w / ASPECT_RATIO.h;
  if (isInteger(raw)) {
    return raw;
  }

  const rounded = [Math.floor(raw), Math.ceil(raw)];
  return rounded.find(roundedVal => roundedVal % 2 === 0);
}

const SUPPORTED_RESOLUTIONS = [144, 240, 360, 480, 720, 1080, 2160].map(h => [getWidth(h), h]);

async function discoverDimensions(filePath) {
  return new Promise((resolve, reject) => {
    childProcess.exec(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "${filePath}"`,
      (error, stdout, stderr) => {
        if (error) {
          reject(stderr);
        } else {
          const dimensions = stdout
            .split('x')
            .map(part => parseInt(part.replace(/\D/, '')));
          resolve(dimensions);
        }
      }
    );
  });
}

async function getAchievableResolutions(filePath) {
  const [originalW, originalH] = await discoverDimensions(filePath);
  return SUPPORTED_RESOLUTIONS.filter(([w, h]) => w <= originalW || h <= originalH);
}

const SCALING_SETTINGS = [
  {
    scale: (w, h) => `${w}:${h}`,
    force_original_aspect_ratio: 'decrease'
  },
  {
    setsar: '1:1'
  },
  {
    pad: (w, h) => `${w}:${h}:-1:-1`,
    color: 'black'
  }
];

function composeScalingArgs(w, h) {
  return SCALING_SETTINGS.map(settingsBlock =>
    Object.entries(settingsBlock).map(([name, valueDef]) => {
      const value = typeof valueDef === 'function' ? valueDef(w, h) : valueDef;
      return `${name}=${value}`;
    }).join(':')
  ).join(',');
}

module.exports = { getAchievableResolutions, composeScalingArgs };