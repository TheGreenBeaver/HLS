import React from 'react';
import { shape, func, bool } from 'prop-types';
import IconButton from '@mui/material/IconButton';
import { Fullscreen, FullscreenExit } from '@mui/icons-material';


function FullScreenButton({ fullScreenData: { isFullScreen, isProcessing, toggle } }) {
  return (
    <IconButton
      color='primary'
      onClick={toggle}
      disabled={isProcessing}
    >
      {isFullScreen ? <FullscreenExit fontSize='large' /> : <Fullscreen fontSize='large' />}
    </IconButton>
  );
}

FullScreenButton.propTypes = {
  fullScreenData: shape({
    toggle: func.isRequired,
    isProcessing: bool.isRequired,
    isFullScreen: bool.isRequired
  }).isRequired,
};

export default FullScreenButton;