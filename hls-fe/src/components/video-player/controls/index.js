import React from 'react';
import Box from '@mui/material/Box';
import ProgressBar from './progress-bar';
import { VIDEO_DATA_SHAPE } from '../util';
import PlayButton from './play-button';
import Volume from './volume';
import Playback from './playback';
import FullScreen from './full-screen';
import { instanceOf, number, object, shape } from 'prop-types';
import Typography from '@mui/material/Typography';
import { padStart } from 'lodash';


function Controls({
  pausedData, mutedData, currentTimeData, playbackRateData, qualityData, volumeData,
  containerRef,
  loadedTimeRanges, totalDuration
}) {
  function getTimeDisplay(valInSeconds) {
    if (totalDuration == null) {
      return '--';
    }

    const roundedVal = Math.floor(valInSeconds);
    const sec = roundedVal % 60;
    const min = Math.floor(roundedVal / 60) % 60;
    const h = Math.floor(roundedVal / 60 / 60);

    return `${h ? `${h}:` : ''}${min}:${padStart(`${sec}`, 2, '0')}`
  }

  return (
    <Box
      position='absolute'
      left={0}
      bottom={0}
      right={0}
      px={2}
      py={1}
      zIndex={10}
      sx={{
        background: 'linear-gradient(transparent, rgba(0, 0, 0, .7))'
      }}
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
            {getTimeDisplay(currentTimeData.val)} / {getTimeDisplay(totalDuration)}
          </Typography>
        </Box>

        <Box display='flex' alignItems='center' columnGap={1}>
          <Playback playbackRate={playbackRateData} quality={qualityData} />
          <FullScreen containerRef={containerRef} />
        </Box>
      </Box>
    </Box>
  );
}

Controls.propTypes = {
  pausedData: VIDEO_DATA_SHAPE.isRequired,
  volumeData: VIDEO_DATA_SHAPE.isRequired,
  mutedData: VIDEO_DATA_SHAPE.isRequired,
  playbackRateData: VIDEO_DATA_SHAPE.isRequired,
  qualityData: VIDEO_DATA_SHAPE.isRequired,

  containerRef: shape({ current: object }).isRequired,

  loadedTimeRanges: instanceOf(TimeRanges),
  totalDuration: number
};

export default Controls;