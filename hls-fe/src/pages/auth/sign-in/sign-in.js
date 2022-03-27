import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import StyledLink from '../../../components/styled-link';
import { links } from '../routing';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-mui';
import ws from '../../../ws';
import ACTIONS from '../../../ws/actions';
import { useDispatch } from 'react-redux';
import { signIn } from '../../../store/actions/account';
import SubmitButton from '../../../components/submit-button';
import { object, string } from 'yup';
import { mapValues } from 'lodash';
import validationMessages from '../../../util/validation-messages';
import PasswordField from '../../../components/password-field';
import { NON_FIELD_ERR } from '../../../util/constants';
import NonFieldErrDisplay from '../../../components/non-field-err-display';


function SignIn() {
  const dispatch = useDispatch();

  return (
    <>
      <Typography component='h1' variant='h5'>
        Sign in
      </Typography>
      <Box sx={{ mt: 1 }}>
        <Formik
          initialValues={{
            email: '',
            password: '',
            [NON_FIELD_ERR]: null
          }}
          validationSchema={object({
            email: string()
              .email(validationMessages.email)
              .required(validationMessages.required),
            password: string()
              .max(100, validationMessages.maxLength)
              .required()
          })}
          onSubmit={(values, { setSubmitting, setErrors }) => {
            setSubmitting(true);
            ws
              .request(ACTIONS.authenticate, values)
              .then(({ payload }) => dispatch(signIn(payload.token)))
              .catch(e => {
                const errorsObj = mapValues(e.payload, v => v.join('; '));
                setErrors(errorsObj);
              })
              .finally(() => setSubmitting(false))
          }}
        >
          <Form>
            <Field
              component={TextField}
              margin='normal'
              required
              fullWidth
              label='Email Address'
              name='email'
              autoComplete='email'
            />
            <PasswordField
              margin='normal'
              required
              fullWidth
              name='password'
              label='Password'
              type='password'
              id='password'
              autoComplete='current-password'
            />
            <SubmitButton
              fullWidth
              variant='contained'
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </SubmitButton>
            <NonFieldErrDisplay />
          </Form>
        </Formik>

        <Grid container>
          <Grid item xs>
            <StyledLink to={links.resetPassword.path} variant='body2'>
              Forgot password?
            </StyledLink>
          </Grid>
          <Grid item>
            <StyledLink to={links.signUp.path} variant='body2'>
              Don't have an account? Sign Up
            </StyledLink>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default SignIn;