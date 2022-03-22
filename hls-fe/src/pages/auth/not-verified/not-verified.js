import React from 'react';
import { CenterBox } from '../../../components/layout';
import Typography from '@mui/material/Typography';


function NotVerified() {
  return (
    <CenterBox height='100vh'>
      <Typography>Please verify your email address to proceed</Typography>
    </CenterBox>
  );
}

export default NotVerified;