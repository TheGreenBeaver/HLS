import React from 'react';
import Button from '@mui/material/Button';
import { node, object } from 'prop-types';
import { useFormikContext } from 'formik';
import Preloader from '../../preloader';


function SubmitButton({ children, sx, ...props }) {
  const { isSubmitting } = useFormikContext();

  return (
    <Button
      type='submit'
      disabled={isSubmitting}
      sx={{ display: 'flex', columnGap: 1, ...sx }}
      {...props}
    >
      {isSubmitting && <Preloader size='1em' contrast />}
      {children}
    </Button>
  );
}

SubmitButton.propTypes = {
  children: node,
  sx: object
};

export default SubmitButton;