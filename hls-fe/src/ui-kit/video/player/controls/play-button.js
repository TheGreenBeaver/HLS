import React from 'react';
import { VIDEO_DATA_SHAPE } from '../util';
import IconButton from '@mui/material/IconButton';
import { Pause, PlayArrow } from '@mui/icons-material';


function PlayButton({ pausedData }) {
  const { val: isPaused, set: setIsPaused } = pausedData;
  return (
    <IconButton
      color='primary'
      onClick={() => setIsPaused(curr => !curr)}
    >
      {isPaused ? <PlayArrow fontSize='large' /> : <Pause fontSize='large' />}
    </IconButton>
  );
}

PlayButton.propTypes = {
  pausedData: VIDEO_DATA_SHAPE.isRequired
};

export default PlayButton;