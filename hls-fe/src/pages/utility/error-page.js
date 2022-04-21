import React from 'react';
import { number } from 'prop-types';
import { CenterBox } from '../../ui-kit/layout';
import Typography from '@mui/material/Typography';
import httpStatus from 'http-status';


function ErrorPage({ status }) {
  const message = httpStatus[`${status}_CLASS`] === httpStatus.classes.SERVER_ERROR
    ? 'Server error'
    : httpStatus[`${status}_MESSAGE`];

  return (
    <CenterBox height='100vh' width='100vw'>
      <Typography variant='h3' textTransform='uppercase'>
        Error {status}: {message}
      </Typography>
    </CenterBox>
  );
}

ErrorPage.propTypes = {
  status: number.isRequired
};

export default ErrorPage;