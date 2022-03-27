import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { CenterBox } from '../layout';


function Loading() {
  return (
    <CenterBox height='100%'>
      <CircularProgress size={100} thickness={5} />
    </CenterBox>
  );
}

export default Loading;