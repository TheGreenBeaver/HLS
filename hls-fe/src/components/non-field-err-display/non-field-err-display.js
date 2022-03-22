import React from 'react';
import { useField } from 'formik';
import { NON_FIELD_ERR } from '../../util/constants';
import { FormHelperText } from '@mui/material';


function NonFieldErrDisplay(props) {
  const [, meta] = useField(NON_FIELD_ERR);

  return (
    <FormHelperText error {...props}>
      {meta.error}
    </FormHelperText>
  );
}

export default NonFieldErrDisplay;