import React, { forwardRef } from 'react';
import { node, shape, number, elementType, object } from 'prop-types';
import Box from '@mui/material/Box';


const STANDARD_RATIO = { w: 16, h: 9 };

function RatioBoxComponent({ children, ratio, width, Component, style, ...props }, ref) {
  const fullStyle = {
    ...style,
    width: `${width}%`,
    height: 0,
    position: 'relative',
    display: 'block',
    paddingBottom: `${ratio.h / ratio.w * width}%`
  };
  return (
    <Component style={fullStyle} ref={ref} {...props}>
      <Box position='absolute' top={0} left={0} bottom={0} right={0}>
        {children}
      </Box>
    </Component>
  );
}

const RatioBox = forwardRef(RatioBoxComponent);

RatioBox.propTypes = {
  children: node,
  ratio: shape({ w: number.isRequired, h: number.isRequired }),
  width: number,
  style: object,
  Component: elementType,
};

RatioBox.defaultProps = {
  ratio: STANDARD_RATIO,
  width: 100,
  Component: Box,
  style: {}
};

export default RatioBox;