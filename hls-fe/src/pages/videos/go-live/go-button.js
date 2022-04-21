import React from 'react';
import fieldNames from './field-names';
import { useField } from 'formik';
import SubmitButton from '../../../ui-kit/form-builder/interactions/submit-button';


function GoButton() {
  const [, { value }] = useField(fieldNames.plan);

  return (
    <SubmitButton
      fullWidth
      variant='contained'
      sx={{ mt: 3, mb: 2 }}
    >
      {value ? 'Plan livestream' : 'Go live'}
    </SubmitButton>
  );
}

export default GoButton;