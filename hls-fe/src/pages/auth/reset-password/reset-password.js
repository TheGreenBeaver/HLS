import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { ref } from 'yup';
import ws from '../../../ws';
import ACTIONS from '../../../ws/actions';
import { pick } from 'lodash';
import PasswordField from '../../../ui-kit/form-builder/fields/password-field';
import SmartForm from '../../../ui-kit/form-builder/smart-form';
import { FIELD_TYPES } from '../../../ui-kit/form-builder/util/validation';
import finishSubmit from '../../../ui-kit/form-builder/util/finish-submit';
import StandardTextField from '../../../ui-kit/form-builder/fields/standard-text-field';
import { useReturnToApp } from '../../access-control';
import { useAlert } from '../../../util/hooks';


const fieldNames = {
  newPassword: 'newPassword',
  passwordCopy: 'passwordCopy',
  email: 'email',
};

function ResetPassword() {
  const showAlert = useAlert();
  const returnToApp = useReturnToApp();

  return (
    <>
      <Typography variant='h5'>
        Reset password
      </Typography>
      <Box mt={3}>
        <SmartForm
          submitText='Reset'
          initialValues={{ [fieldNames.newPassword]: '', [fieldNames.passwordCopy]: '', [fieldNames.email]: '' }}
          validationConfig={{
            [fieldNames.newPassword]: [FIELD_TYPES.text, 100, true],
            [fieldNames.passwordCopy]: [
              FIELD_TYPES.text, 100, true,
              schema => schema.oneOf([ref(fieldNames.newPassword), null], 'Passwords don\'t match')
            ],
            [fieldNames.email]: [FIELD_TYPES.email, null, true]
          }}
          onSubmit={(values, formikHelpers) => {
            const toSend = pick(values, [fieldNames.newPassword, fieldNames.email]);
            finishSubmit(
              ws.request(ACTIONS.resetPassword, toSend).then(() => {
                showAlert('A confirmation email was sent to the provided address');
                returnToApp(); // no auth / verification changes happens here, so need to redirect manually
              }), formikHelpers
            );
          }}
        >
          <StandardTextField name={fieldNames.email} required />
          <PasswordField name={fieldNames.newPassword} required />
          <PasswordField name={fieldNames.passwordCopy} required autoComplete='false' />
        </SmartForm>
      </Box>
    </>
  );
}

export default ResetPassword;