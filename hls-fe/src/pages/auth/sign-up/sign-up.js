import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import StyledLink from '../../../ui-kit/styled-link';
import { links } from '../routing';
import ws from '../../../ws';
import ACTIONS from '../../../ws/actions';
import { useDispatch } from 'react-redux';
import { signIn } from '../../../store/actions/account';
import PasswordField from '../../../ui-kit/form-builder/fields/password-field';
import SmartForm from '../../../ui-kit/form-builder/smart-form';
import { FIELD_TYPES } from '../../../ui-kit/form-builder/util/validation';
import finishSubmit from '../../../ui-kit/form-builder/util/finish-submit';
import StandardTextField from '../../../ui-kit/form-builder/fields/standard-text-field';


const fieldNames = {
  username: 'username',
  email: 'email',
  password: 'password',
};

function SignUp() {
  const dispatch = useDispatch();

  return (
    <>
      <Typography variant='h4'>
        Sign up
      </Typography>
      <Box mt={3}>
        <SmartForm
          submitText='Sign up'
          initialValues={{
            [fieldNames.username]: '', [fieldNames.email]: '', [fieldNames.password]: ''
          }}
          validationConfig={{
            [fieldNames.username]: [FIELD_TYPES.text, 50, true],
            [fieldNames.email]: [FIELD_TYPES.email, null, true],
            [fieldNames.password]: [FIELD_TYPES.text, 100, true]
          }}
          onSubmit={(values, formikHelpers) => finishSubmit(
            ws.request(ACTIONS.signUp, values).then(({ payload }) =>
              dispatch(signIn(payload.token))
            ), formikHelpers
          )}
        >
          <StandardTextField required name={fieldNames.username} />
          <StandardTextField required name={fieldNames.email} />
          <PasswordField required name={fieldNames.password} autoComplete='new-password' />
        </SmartForm>
        <Box justifyContent='flex-end' display='flex' alignItems='center'>
          <StyledLink to={links.signIn.path} variant='body2'>
            Already have an account? Sign in
          </StyledLink>
        </Box>
      </Box>
    </>
  );
}

export default SignUp;