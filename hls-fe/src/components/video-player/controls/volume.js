import React, { useState } from 'react';
import { VIDEO_DATA_SHAPE } from '../util';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { VolumeOff, VolumeUp } from '@mui/icons-material';
import Slider from '@mui/material/Slider';
import Collapse from '@mui/material/Collapse';


function Volume({ volumeData, mutedData }) {
  const { val: currentVolume, set: setCurrentVolume } = volumeData;
  const { val: isMuted, set: setIsMuted } = mutedData;
  const [isSliderVisible, setIsSliderVisible] = useState(false);

  return (
    <Box display='flex' alignItems='center' onMouseLeave={() => setIsSliderVisible(false)}>
      <IconButton
        color='primary'
        onClick={() => setIsMuted(curr => !curr)}
        onMouseEnter={() => setIsSliderVisible(true)}
      >
        {isMuted || currentVolume === 0 ? <VolumeOff /> : <VolumeUp />}
      </IconButton>
      <Collapse in={isSliderVisible} collapsedSize={0} orientation='horizontal'>
        <Box minWidth={80} pl={1} pr={2} display='flex' alignItems='center'>
          <Slider
            sx={{
              '& .MuiSlider-thumb:after': {
                height: 30,
                width: 30
              }
            }}
            size='small'
            onMouseDown={() => setIsMuted(false)}
            onChange={(_, newVolume) => setCurrentVolume(newVolume)}
            value={isMuted ? 0 : currentVolume}
            max={1}
            step={0.1}
            min={0}
          />
        </Box>
      </Collapse>
    </Box>
  );
}

Volume.propTypes = {
  volumeData: VIDEO_DATA_SHAPE.isRequired,
  mutedData: VIDEO_DATA_SHAPE.isRequired,
};

export default Volume;