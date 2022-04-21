import React from 'react';
import { bool, number, oneOfType, string } from 'prop-types';
import { CenterBox } from '../layout';
import { ReactComponent as LogoMin } from '../../assets/logo-min.svg';
import './preloader.styles.css';


function Preloader({ size: _size, contrast }) {
  const size = typeof _size === 'number' ? `${_size}px` : _size;
  const innerSize = `calc(${size} / 1.8)`;
  return (
    <CenterBox height={size} width={size}>
      <CenterBox
        width={innerSize}
        height={innerSize}
        className='obs-preloader'
        sx={{ '& .angle': { fill: theme => theme.palette.primary[contrast ? 'light' : 'main'] } }}
      >
        <LogoMin />
      </CenterBox>
    </CenterBox>
  );
}

Preloader.propTypes = {
  size: oneOfType([number, string]).isRequired,
  contrast: bool
};

export default Preloader;