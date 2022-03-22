import React from 'react';
import { useProfileModalOpen, useUserData } from '../../../store/selectors';
import { useDispatch } from 'react-redux';
import { closeProfileModal } from '../../../store/actions/general';
import { Form, Formik, useFormikContext } from 'formik';
import { isEmpty, mapValues, pick, pickBy } from 'lodash';
import ws from '../../../ws';
import ACTIONS from '../../../ws/actions';
import { updateUserData } from '../../../store/actions/account';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormActions from './form-actions';
import Box from '@mui/material/Box';
import AvatarField from './avatar-field';
import Typography from '@mui/material/Typography';
import PasswordChange from './password-change';
import { object, string } from 'yup';
import fields from './fields';
import validationMessages from '../../../util/validation-messages';
import UsernameField from './username-field';


function makeInitialValues(data) {
  return {
    ...pick(data, [fields.username, fields.avatar]),
    noAvatar: !data[fields.avatar],
    [fields.password]: '',
    [fields.isChangingPassword]: false
  };
}

function Content() {
  const dispatch = useDispatch();
  const open = useProfileModalOpen();
  const { isSubmitting, resetForm } = useFormikContext();
  const { email } = useUserData();

  function onClose() {
    if (isSubmitting) {
      return;
    }
    resetForm({ status: { isEditing: false } });
    dispatch(closeProfileModal());
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='xs'
      fullWidth
    >
      <DialogTitle>
        Profile
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', columnGap: 2 }}>
        <Box>
          <AvatarField />
        </Box>
        <Box pt={1}>
          <Typography>{email}</Typography>
          <UsernameField />
          <PasswordChange />
        </Box>
      </DialogContent>
      <FormActions onClose={onClose} />
    </Dialog>
  )
}

function ProfileModal() {
  const dispatch = useDispatch();
  const userData = useUserData();

  const initialValues = makeInitialValues(userData);

  return (
    <Formik
      initialValues={initialValues}
      initialStatus={{ isEditing: false }}
      validationSchema={object({
        username: string()
          .required(validationMessages.required)
          .max(50, validationMessages.max),
        password: string()
          .max(100, validationMessages.max)
          .when(fields.isChangingPassword, {
            is: true,
            then: schema => schema.required(validationMessages.required),
            otherwise: schema => schema.notRequired()
          })
      })}
      onSubmit={(values, formikHelpers) => {
        const changed = pickBy(values, (fieldVal, fieldName) =>
          fieldName !== fields.isChangingPassword && initialValues[fieldName] !== fieldVal
        );
        if (isEmpty(changed)) {
          formikHelpers.setStatus({ isEditing: false });
          return;
        }

        formikHelpers.setSubmitting(true);
        ws
          .request(ACTIONS.editUser, changed)
          .then(({ payload }) => {
            dispatch(updateUserData(payload));
            formikHelpers.resetForm({
              values: makeInitialValues(payload),
              status: { isEditing: false }
            });
          })
          .catch(e => {
            const errorsObj = mapValues(e.payload, v => v.join('; '));
            formikHelpers.setErrors(errorsObj);
          })
          .finally(() => formikHelpers.setSubmitting(false));
      }}
    >
      <Form>
        <Content />
      </Form>
    </Formik>
  );
}

export default ProfileModal;