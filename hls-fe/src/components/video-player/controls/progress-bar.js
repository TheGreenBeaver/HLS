import React, { useRef } from 'react';
import Box from '@mui/material/Box';
import { VIDEO_DATA_SHAPE } from '../util';
import { instanceOf, number } from 'prop-types';


function ProgressBar({ loadedTimeRanges, totalDuration, currentTimeData }) {
  const barRef = useRef(null);
  const { set: setCurrentTime, val: currentTime } = currentTimeData;

  const loadedFragments = loadedTimeRanges
    ? [...Array(loadedTimeRanges.length)].map((_, rangeIdx) => {
      const start = loadedTimeRanges.start(rangeIdx);
      const end = loadedTimeRanges.end(rangeIdx);
      const duration = end - start;
      return { start, duration };
    })
    : [];

  return (
    <Box
      position="relative"
      height={3}
      sx={{ background: 'rgba(0, 0, 0, 0.2)' }}
      onClick={e => {
        const fullDurationAsPixels = barRef.current.getBoundingClientRect().width;
        const newTimeAsPixels = e.offsetX;
        const newTimeAsFraction = newTimeAsPixels / fullDurationAsPixels;
        const newTimeAsSeconds = newTimeAsFraction * totalDuration;
        setCurrentTime(newTimeAsSeconds);
      }}
      ref={barRef}
    >
      {loadedFragments.map((frag, idx) =>
        <Box
          key={idx}
          position='absolute'
          width={`${frag.duration / totalDuration * 100}%`}
          left={`${frag.start / totalDuration * 100}%`}
          top={0}
          bgcolor='primary.light'
          bottom={0}
        />
      )}
      <Box
        position='absolute'
        left={totalDuration == null ? 0 : `${currentTime / totalDuration * 100}%`}
        bgcolor='primary.main'
        sx={{
          transform: 'translateX(-50%)',
          cursor: 'pointer',
          width: 7,
          top: -3,
          bottom: -3,

          '&:hover': {
            width: 9,
            top: -5,
            bottom: -5
          }
        }}
      />
    </Box>
  );
}

ProgressBar.propTypes = {
  currentTimeData: VIDEO_DATA_SHAPE.isRequired,
  loadedTimeRanges: instanceOf(TimeRanges),
  totalDuration: number
};

export default ProgressBar;