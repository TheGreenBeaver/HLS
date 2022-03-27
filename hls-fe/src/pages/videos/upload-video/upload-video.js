import React from 'react';
import ACTIONS from '../../../ws/actions';
import ws from '../../../ws';
import { Formik, Form, Field } from 'formik';
import { SimpleFileUpload, TextField } from 'formik-mui';
import SubmitButton from '../../../components/submit-button';
import { useSnackbar } from 'notistack';
import { number, object, string } from 'yup';
import validationMessages from '../../../util/validation-messages';
import ThumbnailField from './thumbnail-field';


function UploadVideo() {
  const { enqueueSnackbar } = useSnackbar();

  return (
    <Formik
      initialValues={{
        name: '', file: null, description: '', thumbnail: null
      }}
      onSubmit={(values, { setSubmitting }) => {
        setSubmitting(true);
        ws
          .request(ACTIONS.uploadVideo, values)
          .then(() => enqueueSnackbar('Started processing your video', { variant: 'info' }))
          .catch(console.log) // TODO: Upload Video errors
          .finally(() => setSubmitting(false));
      }}
      validationSchema={object({
        name: string()
          .required()
          .max(50, validationMessages.maxLength),
        file: object({
          size: number().max(1024 * 1024 * 1024, validationMessages.maxSize) // 1GB
        }).required(),
        description: string()
          .max(1000, validationMessages.maxLength),
        thumbnail: object({
          size: number().max(4 * 1024 * 1024, validationMessages.maxSize) // 4MB
        }).notRequired()
      })}
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
        <ThumbnailField />
        <SubmitButton>
          Upload
        </SubmitButton>
      </Form>
    </Formik>
  );
}

export default UploadVideo;