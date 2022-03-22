import React from 'react';
import { useFormikContext, Field } from 'formik';
import { TextField } from 'formik-mui';
import Typography from '@mui/material/Typography';
import fields from './fields';


function UsernameField() {
  const { status: { isEditing }, values } = useFormikContext();

  if (!isEditing) {
    return <Typography>{values[fields.username]}</Typography>;
  }

  return (
    <Field
      component={TextField}
      margin='normal'
      label='Username'
      required
      size='small'
      name={fields.username}
      autoComplete='username'
    />
  );
}

export default UsernameField;