import React from 'react';
import { node } from 'prop-types';
import Box from '@mui/material/Box';


function CenterBox({ children, ...otherProps }) {
  const props = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...otherProps
  };
  return (
    <Box {...props}>
      {children}
    </Box>
  );
}

CenterBox.propTypes = {
  children: node
};

export default CenterBox;