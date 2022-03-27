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
import validationMessages from '../../../util/validation-messages';
import { mapValues } from 'lodash';
import PasswordField from '../../../components/password-field';


function SignUp() {
  const dispatch = useDispatch();

  return (
    <>
      <Typography component='h1' variant='h5'>
        Sign up
      </Typography>
      <Box mt={3}>
        <Formik
          initialValues={{
            username: '', email: '', password: ''
          }}
          validationSchema={object({
            username: string()
              .required(validationMessages.required)
              .max(50, validationMessages.maxLength),
            email: string()
              .email(validationMessages.email)
              .required(validationMessages.required),
            password: string()
              .required(validationMessages.required)
              .max(100, validationMessages.maxLength)
          })}
          onSubmit={(values, { setSubmitting, setErrors }) => {
            setSubmitting(true);
            ws
              .request(ACTIONS.signUp, values)
              .then(({ payload }) => dispatch(signIn(payload.token)))
              .catch(e => {
                const errorsObj = mapValues(e.payload, v => v.join('; '));
                setErrors(errorsObj);
              })
              .finally(() => setSubmitting(false))
          }}
        >
          <Form>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Field
                  component={TextField}
                  required
                  fullWidth
                  label='Username'
                  name='username'
                  autoComplete='username'
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  component={TextField}
                  required
                  fullWidth
                  label='Email Address'
                  name='email'
                  autoComplete='email'
                />
              </Grid>
              <Grid item xs={12}>
                <PasswordField
                  required
                  fullWidth
                  name='password'
                  label='Password'
                  type='password'
                  autoComplete='new-password'
                />
              </Grid>
            </Grid>
            <SubmitButton
              fullWidth
              variant='contained'
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </SubmitButton>
          </Form>
        </Formik>
        <Grid container justifyContent='flex-end'>
          <Grid item>
            <StyledLink to={links.signIn.path} variant='body2'>
              Already have an account? Sign in
            </StyledLink>
          </Grid>
        </Grid>
      </Box>
    </>);
}

export default SignUp;