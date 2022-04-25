const path = require('path');
const { mapValues, takeRight } = require('lodash');
const { getAchievableResolutions, composeScalingArgs, SUPPORTED_RESOLUTIONS } = require('./resolutions');
const { CONTENT_KINDS } = require('../util/misc');

// --- --- ENUMS --- --- //
const BLOCKS = {
  audio: 'audio',
  video: 'video',
  general: 'general',
};
const SPLITTING_TYPES = {
  none: 'none',
  sameForEach: 'sameForEach',
  full: 'full',
};

// --- --- SETTINGS --- --- //
const N_BEST = 3;
const HOW_TO_SPLIT = {
  [BLOCKS.audio]: SPLITTING_TYPES.sameForEach,
  [BLOCKS.video]: SPLITTING_TYPES.full,
  [BLOCKS.general]: SPLITTING_TYPES.none
};
// ffmpeg inserts the mapping index in place of %v and current timestamp in place of %d
const OUT_FILES = {
  segment: 'version-%v/fragment-%02d.ts',
  index: 'version-%v/index.m3u8',
  master: 'master.m3u8'
};
const ENCODING_SETTINGS = {
  [CONTENT_KINDS.video]: {
    [BLOCKS.video]: {
      'c:v': 'libx264', // codec
      crf: 17, // quality (1 - best, 51 - worst, 17 is at the top of the recommended "sane range")
      preset: 'slow',
      sc_threshold: 0, // more precise scene detection
    },

    [BLOCKS.audio]: {
      'c:a': 'aac', // codec
      'b:a': '128k', // bitrate
      ac: 2, // audio channels amt
    },

    [BLOCKS.general]: {
      f: 'hls', // format
      hls_time: 4, // duration of a fragment in seconds
      hls_playlist_type: 'vod',
      hls_flags: 'independent_segments',
      hls_segment_type: 'mpegts',
    }
  },

  [CONTENT_KINDS.liveStream]: {
    [BLOCKS.video]: {
      'c:v': 'libx264', // codec
      crf: 28, // quality (1 - best, 51 - worst, 28 is at the bottom of the recommended "sane range")
      preset: 'ultrafast',
      tune: 'zerolatency',
      sc_threshold: 0, // more precise scene detection
    },

    [BLOCKS.audio]: {
      'c:a': 'copy', // codec
      'b:a': '128k', // bitrate
      ac: 2 // audio channels amt
    },

    [BLOCKS.general]: {
      vsync: 'vfr',
      fflags: '+igndts',
      framerate: 25,
      f: 'hls', // format
      hls_time: 4, // duration of a fragment in seconds
      hls_playlist_type: 'event', // save all fragments
      hls_flags: 'independent_segments',
      hls_segment_type: 'mpegts',
    }
  }
};

// --- --- SETTING-TO-STRING TRANSFORMERS --- --- //
function getStringRepresentation(settingName, settingVal, streamIdx) {
  const fullSettingName = settingName.includes(':') && streamIdx != null ? `${settingName}:${streamIdx}` : settingName;
  return `-${fullSettingName}${typeof settingVal === 'boolean' ? '' : ` ${settingVal}`}`;
}

function getFilenames(outDir) {
  return mapValues(OUT_FILES, raw => path.join(outDir, raw));
}

// --- --- COMPOSERS --- --- //
function composeArgsForBlock(blockName, settingsInBlock, streamIdx) {
  const splittingType = HOW_TO_SPLIT[blockName];
  const blockIdf = blockName[0];
  const args = Object.entries(settingsInBlock).map(([settingName, settingVal]) =>
    getStringRepresentation(settingName, settingVal, streamIdx)
  );
  switch (splittingType) {
    case SPLITTING_TYPES.none:
      return args;
    case SPLITTING_TYPES.full:
      return [`-map [${blockIdf}${streamIdx + 1}out]`, ...args];
    case SPLITTING_TYPES.sameForEach:
      return [`-map ${blockIdf}:0`, ...args];
  }
}

function composeDirIndependentArgs(resolutionsAmt, kind) {
  const settingsObj = ENCODING_SETTINGS[kind];
  return Object
    .entries(settingsObj)
    .map(([blockName, settingsInBlock]) => HOW_TO_SPLIT[blockName] === SPLITTING_TYPES.none
      ? composeArgsForBlock(blockName, settingsInBlock)
      : [...Array(resolutionsAmt)].map((_, streamIdx) => composeArgsForBlock(blockName, settingsInBlock, streamIdx))
    )
    .flat(2);
}

async function composeArgs(outDir, kind, inpFile) {
  const indefinite = !inpFile;

  const achievableResolutions = indefinite
    ? takeRight(SUPPORTED_RESOLUTIONS, N_BEST)
    : await getAchievableResolutions(inpFile);
  const resolutionsAmt = achievableResolutions.length;

  const streamNames = achievableResolutions.map((_, streamIdx) => `[v${streamIdx + 1}]`).join('');
  const splitDefinition = `${resolutionsAmt}${streamNames}`;
  const streamScales = achievableResolutions
    .map(([w, h], streamIdx) => `[v${streamIdx + 1}]${composeScalingArgs(w, h, indefinite)}[v${streamIdx + 1}out]`)
    .join('; ');
  const splittingCommand = `-filter_complex "[0:v]split=${splitDefinition}; ${streamScales}"`;

  const streamOutMap = achievableResolutions.map((_, streamIdx) => `v:${streamIdx},a:${streamIdx}`).join(' ');
  const streamOutMapCommand = `-var_stream_map "${streamOutMap}"`;

  const dirIndependentArgs = composeDirIndependentArgs(resolutionsAmt, kind);
  const { segment, index, master } = getFilenames(outDir);

  const inpArg = indefinite ? '-i -' : `-i "${inpFile}"`;
  const args = [
    inpArg,
    splittingCommand,
    ...dirIndependentArgs,
    `-hls_segment_filename "${segment}"`,
    `-master_pl_name ${OUT_FILES.master}`,
    streamOutMapCommand,
    `"${index}"`
  ];
  return { args, masterFileName: master };
}

module.exports = composeArgs;