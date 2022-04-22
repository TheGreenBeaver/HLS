import React from 'react';
import { number, oneOfType, string } from 'prop-types';
import Box from '@mui/material/Box';
import './pulse-dot.styles.css';
import { red } from '@mui/material/colors';


function PulseDot({ size }) {
  return (
    <Box
      width={size}
      height={size}
      borderRadius='50%'
      sx={{
        background: red[500],

        '&:before': {
          background: red[600]
        }
      }}
      position='relative'
      className='ist-pulse-dot'
    />
  );
}

PulseDot.propTypes = {
  size: oneOfType([string, number])
};

PulseDot.defaultProps = {
  size: '1rem'
};

export default PulseDot;