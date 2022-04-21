import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ws from '../../../ws';
import ACTIONS from '../../../ws/actions';
import { updateUserData } from '../../../store/actions/account';
import { useUserData } from '../../../store/selectors';
import { useDispatch } from 'react-redux';
import { Cancel } from '@mui/icons-material';
import fieldNames from './field-names';
import PasswordField from '../../../ui-kit/form-builder/fields/password-field';
import useEditableView from '../../../ui-kit/form-builder/util/use-editable-view';


function PasswordChange() {
  const [isDroppingPasswordChange, setIsDroppingPasswordChange] = useState(false);

  const { passwordChangeRequested } = useUserData();
  const dispatch = useDispatch();
  const { isEditing, isSubmitting, values, setFieldValue } = useEditableView();

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
            },
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
          startIcon={<Cancel sx={{ fontSize: '1.2em !important' }} />}
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

  const isChangingPassword = values[fieldNames.isChangingPassword];
  return (
    <>
      {isChangingPassword && <PasswordField required name={fieldNames.newPassword} />}
      <Button
        sx={{ mt: 0.5 }}
        onClick={() => {
          setFieldValue(fieldNames.isChangingPassword, !isChangingPassword);
          setFieldValue(fieldNames.newPassword, '');
        }}
      >
        {isChangingPassword ? 'Cancel' : 'Change password'}
      </Button>
    </>
  );
}

export default PasswordChange;