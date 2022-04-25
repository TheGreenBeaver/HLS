import React from 'react';
import { CenterBox } from '../../../ui-kit/layout';
import Typography from '@mui/material/Typography';


function NotVerified() {
  // TODO: resend
  return (
    <CenterBox flex={1}>
      <Typography>
        We've sent an email to the address you provided. Please follow the link in the letter to verify your account.
      </Typography>
    </CenterBox>
  );
}

export default NotVerified;