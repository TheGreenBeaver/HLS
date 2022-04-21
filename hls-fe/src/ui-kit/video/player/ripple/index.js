import React from 'react';
import { oneOf, func, elementType } from 'prop-types';
import { CenterBox } from '../../../layout';
import { Pause, PlayArrow } from '@mui/icons-material';
import './ripple.styles.css';


const STATE = {
  none: 'none',
  becamePaused: 'becamePaused',
  becamePlaying: 'becamePlaying',
};

function RippleIcon({ IconComponent, setRippleState }) {
  return (
    <CenterBox
      borderRadius='50%'
      height={60}
      width={60}
      sx={{ background: theme => theme.palette.grey[800] }}
      onAnimationEnd={() => setRippleState(STATE.none)}
      className='obs-ripple'
    >
      <IconComponent fontSize='large' sx={{ color: 'white' }} />
    </CenterBox>
  );
}

RippleIcon.propTypes = {
  IconComponent: elementType.isRequired,
  setRippleState: func.isRequired
};

function Ripple({ rippleState, setRippleState }) {
  if (rippleState === STATE.none) {
    return null;
  }

  return (
    <CenterBox
      sx={{ background: 'transparent', pointerEvents: 'none' }}
      position='absolute'
      zIndex={6}
      top={0}
      left={0}
      right={0}
      bottom={0}
    >
      {
        rippleState === STATE.becamePaused &&
        <RippleIcon setRippleState={setRippleState} IconComponent={Pause} />
      }
      {
        rippleState === STATE.becamePlaying &&
        <RippleIcon setRippleState={setRippleState} IconComponent={PlayArrow} />
      }
    </CenterBox>
  );
}

Ripple.propTypes = {
  rippleState: oneOf([...Object.values(STATE)]).isRequired,
  setRippleState: func.isRequired
};

Ripple.STATE = STATE;

export default Ripple;