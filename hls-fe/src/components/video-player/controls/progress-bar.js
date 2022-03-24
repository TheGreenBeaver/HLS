import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { VIDEO_DATA_SHAPE } from '../util';
import { instanceOf, number } from 'prop-types';
import { useDelayedFn } from '../../../util/hooks';
import { getTimeDisplay } from '../../../util/misc';
import { Tooltip } from '@mui/material';


function ProgressBar({ loadedTimeRanges, totalDuration, currentTimeData }) {
  const barRef = useRef(null);
  const { set: setCurrentTime, val: currentTime } = currentTimeData;

  const [tempThumbPosition, setTempThumbPosition] = useState(0);
  const [ghostThumb, setGhostThumb] = useState(null);
  const [isSeeking, setIsSeeking] = useState(false);

  const updateTempThumbPosition = useDelayedFn(setTempThumbPosition, 250, 'throttle');
  const updateGhostThumb = useDelayedFn(setGhostThumb, 250, 'throttle');

  const loadedFragments = loadedTimeRanges
    ? [...Array(loadedTimeRanges.length)].map((_, rangeIdx) => {
      const start = loadedTimeRanges.start(rangeIdx);
      const end = loadedTimeRanges.end(rangeIdx);
      const duration = end - start;
      return { start, duration };
    })
    : [];

  useEffect(() => {
    const seekerFn = e => {
      const offsetData = getOffset(e);
      updateTempThumbPosition(offsetData.newTimeAsPixels / offsetData.fullDurationAsPixels * 100);
      setCurrentTime(getTime(offsetData));
    }
    const finisherFn = () => setIsSeeking(false);
    if (isSeeking) {
      setGhostThumb(null);
      document.addEventListener('mousemove', seekerFn);
      document.addEventListener('mouseup', finisherFn);
    }

    return () => {
      document.removeEventListener('mousemove', seekerFn);
      document.removeEventListener('mouseup', finisherFn);
    }
  }, [isSeeking])

  function getOffset(e) {
    const barBox = barRef.current.getBoundingClientRect();
    const fullDurationAsPixels = barBox.width;
    const newTimeAsPixels = e.clientX - barBox.left;
    return { fullDurationAsPixels, newTimeAsPixels };
  }

  function getTime({ newTimeAsPixels, fullDurationAsPixels }) {
    const newTimeAsFraction = newTimeAsPixels / fullDurationAsPixels;
    return newTimeAsFraction * totalDuration;
  }

  function getThumbPosition() {
    if (totalDuration == null) {
      return 0;
    }

    return `${isSeeking ? tempThumbPosition : currentTime / totalDuration * 100}%`;
  }

  return (
    <Box
      position='relative'
      sx={{
        background: 'rgba(150, 150, 150, 0.3)',
        cursor: 'pointer',
        height: 3
      }}
      onClick={e => {
        if (!isSeeking) {
          setCurrentTime(getTime(getOffset(e)));
        }
      }}
      onMouseMove={e => {
        if (!isSeeking) {
          const offsetData = getOffset(e);
          const time = getTime(offsetData);
          updateGhostThumb({ timeLabel: getTimeDisplay(time), x: offsetData.newTimeAsPixels });
        }
      }}
      onMouseLeave={() => updateGhostThumb(null)}
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
      {
        !!ghostThumb &&
        <Tooltip title={ghostThumb.timeLabel} placement='top'>
          <Box
            position='absolute'
            left={ghostThumb.x}
            bgcolor='primary.main'
            sx={{
              transform: 'translateX(-50%)',
              cursor: 'pointer',
              width: 7,
              top: -3,
              bottom: -3,
              opacity: 0.6
            }}
          />
        </Tooltip>
      }
      <Tooltip title={getTimeDisplay(currentTime)} placement='top'>
        <Box
          onMouseDown={() => setIsSeeking(true)}
          position='absolute'
          left={getThumbPosition()}
          bgcolor='primary.main'
          sx={{
            transform: 'translateX(-50%)',
            cursor: 'pointer',
            width: 7,
            top: -3,
            bottom: -3,

            '&:hover': {
              width: 9,
              top: -4,
              bottom: -4
            }
          }}
        />
      </Tooltip>
    </Box>
  );
}

ProgressBar.propTypes = {
  currentTimeData: VIDEO_DATA_SHAPE.isRequired,
  loadedTimeRanges: instanceOf(TimeRanges),
  totalDuration: number
};

export default ProgressBar;