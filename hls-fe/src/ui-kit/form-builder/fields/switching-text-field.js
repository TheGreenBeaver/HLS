import React from 'react';
import { object, string } from 'prop-types';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import useEditableView from '../util/use-editable-view';
import { kebabCase, startCase } from 'lodash';



function SwitchingTextField({ name, typographyProps, ...otherProps }) {
  const { isEditing, values, getFieldProps } = useEditableView();

  if (!isEditing) {
    return <Typography {...typographyProps}>{values[name]}</Typography>;
  }

  const props = {
    label: startCase(name),
    margin: 'normal',
    size: 'small',
    fullWidth: true,
    autoComplete: kebabCase(name),
    ...otherProps,
    ...getFieldProps(name)
  };

  return <TextField {...props} />;
}

SwitchingTextField.propTypes = {
  name: string.isRequired,
  typographyProps: object
};

export default SwitchingTextField;