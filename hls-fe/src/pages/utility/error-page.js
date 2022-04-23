import React from 'react';
import { number } from 'prop-types';
import { CenterBox } from '../../ui-kit/layout';
import Typography from '@mui/material/Typography';
import httpStatus from 'http-status';
import notFound from '../../assets/not-found.svg'
import serverError from '../../assets/server-error.svg'
import someError from '../../assets/some-error.svg'
import Box from '@mui/material/Box';


function ErrorPage({ status }) {
  let message;
  let icon;
  if (httpStatus[`${status}_CLASS`] === httpStatus.classes.SERVER_ERROR) {
    message = 'Server error';
    icon = serverError;
  } else if (status === 404) {
    message = 'Not found';
    icon = notFound;
  } else {
    message = httpStatus[`${status}_MESSAGE`];
    icon = someError;
  }

  return (
    <CenterBox height='100vh' width='100vw' columnGap={3} p={6}>
      <img src={icon} alt='error-icon' height={70} width={70} />
      <Box>
        <Typography variant='h4' textTransform='uppercase'>
          Error {status}:
        </Typography>
        <Typography variant='h4' textTransform='uppercase'>
          {message}
        </Typography>
      </Box>
    </CenterBox>
  );
}

ErrorPage.propTypes = {
  status: number.isRequired
};

export default ErrorPage;