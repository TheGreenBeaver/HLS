import React from 'react';
import ACTIONS from '../../../ws/actions';
import ws from '../../../ws';
import { Formik, Form, Field } from 'formik';
import { SimpleFileUpload, TextField } from 'formik-mui';
import SubmitButton from '../../../components/submit-button';
import { useSnackbar } from 'notistack';


function UploadVideo() {
  const { enqueueSnackbar } = useSnackbar();

  return (
    <Formik
      initialValues={{
        name: '', file: null
      }}
      onSubmit={(values, { setSubmitting }) => {
        setSubmitting(true);
        ws
          .request(ACTIONS.uploadVideo, values)
          .then(() => enqueueSnackbar('Started processing your video', { variant: 'info' }))
          .catch(console.log) // TODO: Upload Video errors
          .finally(() => setSubmitting(false));
      }}
    >
      <Form>
        <Field
          component={TextField}
          name='name'
          fullWidth
          label='Name'
          sx={{ mb: 2 }}
        />
        <Field
          component={SimpleFileUpload}
          name='file'
          label='Video File'
          sx={{ mb: 2 }}
        />
        <Field
          component={SimpleFileUpload}
          name='thumbnail'
          label='Thumbnail'
        />

        <SubmitButton>
          Upload
        </SubmitButton>
      </Form>
    </Formik>
  );
}

export default UploadVideo;