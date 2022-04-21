import React from 'react';
import { CenterBox } from '../../ui-kit/layout';
import Preloader from '../../ui-kit/preloader';
import { bool } from 'prop-types';


function Loading({ fullPage }) {
  return (
    <CenterBox
      height={`100${fullPage ? 'vh' : '%'}`}
      width={`100${fullPage ? 'vw' : '%'}`}
    >
      <Preloader size={100} />
    </CenterBox>
  );
}

Loading.propTypes = {
  fullPage: bool
};

export default Loading;