import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ws from '../../../ws';
import ACTIONS from '../../../ws/actions';
import { updateUserData } from '../../../store/actions/account';
import { useUserData } from '../../../store/selectors';
import { useDispatch } from 'react-redux';
import { useFormikContext } from 'formik';
import { Cancel } from '@mui/icons-material';
import fields from './fields';
import PasswordField from '../../password-field';


function PasswordChange() {
  const [isDroppingPasswordChange, setIsDroppingPasswordChange] = useState(false);

  const { passwordChangeRequested } = useUserData();
  const dispatch = useDispatch();
  const { status: { isEditing }, isSubmitting, values, setFieldValue } = useFormikContext();

  if (passwordChangeRequested) {
    return (
      <>
        <Typography color='error.main' sx={{ mt: 1 }}>Password change has been requested</Typography>
        <Button
          sx={{
            px: 0.25,
            py: 0.5,
            background: 'transparent !important',
            '&:hover': {
              color: 'error.light'
            }
          }}
          disableRipple
          disabled={isDroppingPasswordChange || isSubmitting}
          onClick={() => {
            setIsDroppingPasswordChange(true);
            ws
              .request(ACTIONS.dropPasswordChange)
              .then(({ payload }) => dispatch(updateUserData(payload)))
              .finally(() => setIsDroppingPasswordChange(false));
          }}
          startIcon={<Cancel />}
          color='error'
        >
          Cancel
        </Button>
      </>
    );
  }

  if (!isEditing) {
    return null;
  }

  const isChangingPassword = values[fields.isChangingPassword];
  return (
    <>
      {
        isChangingPassword &&
        <PasswordField
          size='small'
          label='New password'
          required
          name={fields.password}
        />
      }
      <Button
        sx={{ mt: 0.5 }}
        onClick={() => {
          setFieldValue(fields.isChangingPassword, !isChangingPassword);
          setFieldValue(fields.password, '');
        }}
      >
        {isChangingPassword ? 'Cancel' : 'Change password'}
      </Button>
    </>
  );
}

export default PasswordChange;