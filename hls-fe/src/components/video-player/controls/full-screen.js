import React from 'react';
import { object, shape } from 'prop-types';
import IconButton from '@mui/material/IconButton';
import { Fullscreen } from '@mui/icons-material';


function FullScreen({ containerRef }) {
  return (
    <IconButton>
      <Fullscreen />
    </IconButton>
  );
}

FullScreen.propTypes = {
  containerRef: shape({ current: object }).isRequired
};

export default FullScreen;