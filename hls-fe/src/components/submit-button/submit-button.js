import React from 'react';
import Button from '@mui/material/Button';
import { node, object } from 'prop-types';
import { useFormikContext } from 'formik';
import { CircularProgress } from '@mui/material';


function SubmitButton({ children, sx, ...props }) {
  const { isSubmitting } = useFormikContext();

  return (
    <Button
      type='submit'
      disabled={isSubmitting}
      sx={{ display: 'flex', columnGap: 1, ...sx }}
      {...props}
    >
      {isSubmitting && <CircularProgress size='1em' />}
      {children}
    </Button>
  );
}

SubmitButton.propTypes = {
  children: node,
  sx: object
};

export default SubmitButton;