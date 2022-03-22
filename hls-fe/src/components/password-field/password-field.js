import React, { useState } from 'react';
import { Field } from 'formik';
import { TextField } from 'formik-mui';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { Visibility, VisibilityOff } from '@mui/icons-material';


function PasswordField(props) {
  const [show, setShow] = useState(false);

  return (
    <Field
      component={TextField}
      InputProps={{
        type: show ? 'text' : 'password',
        endAdornment:
          <InputAdornment position='end'>
            <IconButton
              onClick={() => setShow(curr => !curr)}
              edge='end'
            >
              {show ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
      }}
      {...props}
    />
  );
}

export default PasswordField;