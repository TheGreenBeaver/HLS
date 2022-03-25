import React, { forwardRef, useState } from 'react';
import Box from '@mui/material/Box';
import ProgressBar from './progress-bar';
import { VIDEO_CONTROLS_ID, VIDEO_DATA_SHAPE } from '../util';
import PlayButton from './play-button';
import Volume from './volume';
import PlaybackSettings from './playback-settings';
import FullScreenButton from './full-screen-button';
import { instanceOf, number, shape, func, bool } from 'prop-types';
import Typography from '@mui/material/Typography';
import { getTimeDisplay } from '../../../util/misc';


function ControlsComponent({
  pausedData, mutedData, currentTimeData, playbackRateData, qualityData, volumeData, fullScreenData,
  loadedTimeRanges, totalDuration,
  showControls, scheduleControlsHide,
  playbackMenuOpen, setPlaybackMenuOpen
}, ref) {
  function getCleanTimeDisplay(valInSeconds) {
    return totalDuration == null ? '--' : getTimeDisplay(valInSeconds);
  }

  return (
    <Box
      id={VIDEO_CONTROLS_ID}
      ref={ref}
      position='absolute'
      left={0}
      bottom={0}
      right={0}
      px={2}
      py={1}
      zIndex={10}
      sx={{
        background: 'linear-gradient(transparent, rgba(0, 0, 0, .7))',
        '& .MuiSvgIcon-fontSizeLarge': {
          fontSize: '1.8rem'
        }
      }}
      onMouseOver={showControls}
      onMouseLeave={() => scheduleControlsHide()}
    >
      <ProgressBar
        currentTimeData={currentTimeData}
        totalDuration={totalDuration}
        loadedTimeRanges={loadedTimeRanges}
      />
      <Box display='flex' alignItems='center' justifyContent='space-between' mt={1}>
        <Box display='flex' alignItems='center' columnGap={1}>
          <PlayButton pausedData={pausedData} />
          <Volume volumeData={volumeData} mutedData={mutedData} />
          <Typography variant='caption' sx={{ color: 'white' }}>
            {getCleanTimeDisplay(currentTimeData.val)} / {getCleanTimeDisplay(totalDuration)}
          </Typography>
        </Box>

        <Box display='flex' alignItems='center' columnGap={1}>
          <PlaybackSettings
            playbackRate={playbackRateData}
            quality={qualityData}
            open={playbackMenuOpen}
            setOpen={setPlaybackMenuOpen}
            scheduleControlsHide={scheduleControlsHide}
          />
          <FullScreenButton fullScreenData={fullScreenData} />
        </Box>
      </Box>
    </Box>
  );
}

const Controls = forwardRef(ControlsComponent);

Controls.propTypes = {
  pausedData: VIDEO_DATA_SHAPE.isRequired,
  volumeData: VIDEO_DATA_SHAPE.isRequired,
  mutedData: VIDEO_DATA_SHAPE.isRequired,
  playbackRateData: VIDEO_DATA_SHAPE.isRequired,
  qualityData: VIDEO_DATA_SHAPE.isRequired,
  fullScreenData: shape({
    toggle: func.isRequired,
    isProcessing: bool.isRequired,
    isFullScreen: bool.isRequired
  }).isRequired,

  loadedTimeRanges: instanceOf(TimeRanges),
  totalDuration: number,

  showControls: func.isRequired,
  scheduleControlsHide: func.isRequired
};

export default Controls;