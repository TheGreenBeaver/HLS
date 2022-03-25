import React, { useState } from 'react';
import { object, shape } from 'prop-types';
import IconButton from '@mui/material/IconButton';
import { Fullscreen, FullscreenExit } from '@mui/icons-material';


function FullScreenButton({ containerRef }) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  return (
    <IconButton
      color='primary'
      onClick={() =>
        isFullScreen
          ? document.exitFullscreen().then(() => setIsFullScreen(false))
          : containerRef.current?.requestFullscreen().then(() => setIsFullScreen(true))
      }
    >
      {isFullScreen ? <FullscreenExit fontSize='large' /> : <Fullscreen fontSize='large' />}
    </IconButton>
  );
}

FullScreenButton.propTypes = {
  containerRef: shape({ current: object }).isRequired
};

export default FullScreenButton;