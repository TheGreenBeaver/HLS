import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Form, Formik, Field } from 'formik';
import { object, string, ref } from 'yup';
import validationMessages from '../../../util/validation-messages';
import ws from '../../../ws';
import ACTIONS from '../../../ws/actions';
import { mapValues, pick } from 'lodash';
import SubmitButton from '../../../components/submit-button';
import PasswordField from '../../../components/password-field';
import { useUserState } from '../../../store/selectors';
import { TextField } from 'formik-mui';


function ResetPassword() {
  const { isAuthorized } = useUserState();

  return (
    <>
      <Typography component='h1' variant='h5'>
        Reset password
      </Typography>
      <Box mt={3}>
        <Formik
          initialValues={{ password: '', passwordCopy: '', email: '' }}
          validationSchema={object({
            password: string()
              .required(validationMessages.required)
              .max(100, validationMessages.max),
            passwordCopy: string()
              .required(validationMessages.required)
              .oneOf([ref('password'), null], 'Passwords don\'t match'),
            email: string()
              .email(validationMessages.email)
              .test('email', validationMessages.required, v => isAuthorized ? true : !!v)
          })}
          onSubmit={(values, formikHelpers) => {
            formikHelpers.setSubmitting(true);
            const toPick = ['password'];
            if (!isAuthorized) {
              toPick.push('email');
            }
            const toSend = pick(values, toPick);
            ws
              .request(ACTIONS.resetPassword, toSend)
              .catch(e => {
                const errorsObj = mapValues(e.payload, v => v.join('; '));
                formikHelpers.setErrors(errorsObj);
              })
              .finally(() => formikHelpers.setSubmitting(false));
          }}
        >
          <Form>
            {
              !isAuthorized &&
              <Field
                name='email'
                component={TextField}
                required
                fullWidth
                label='Email'
                autoComplete='email'
                margin='normal'
              />
            }
            <PasswordField
              required
              fullWidth
              label='New password'
              name='password'
              autoComplete='new-password'
              margin='normal'
            />
            <PasswordField
              required
              margin='normal'
              fullWidth
              label='Repeat new password'
              name='passwordCopy'
            />

            <SubmitButton
              fullWidth
              variant='contained'
              sx={{ mt: 3, mb: 2 }}
            >
              Reset
            </SubmitButton>
          </Form>
        </Formik>
      </Box>
    </>
  );
}

export default ResetPassword;