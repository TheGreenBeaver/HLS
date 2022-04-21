import React from 'react';
import { useProfileModalOpen, useUserData } from '../../../store/selectors';
import { useDispatch } from 'react-redux';
import { closeProfileModal } from '../../../store/actions/general';
import { Form } from 'formik';
import { isEmpty, pick, pickBy } from 'lodash';
import ws from '../../../ws';
import ACTIONS from '../../../ws/actions';
import { updateUserData } from '../../../store/actions/account';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormActions from './form-actions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PasswordChange from './password-change';
import fieldNames from './field-names';
import SmartForm from '../../../ui-kit/form-builder/smart-form';
import useEditableView, { SWITCHER } from '../../../ui-kit/form-builder/util/use-editable-view';
import { FIELD_TYPES } from '../../../ui-kit/form-builder/util/validation';
import GeneralError from '../../../ui-kit/form-builder/interactions/general-error';
import finishSubmit from '../../../ui-kit/form-builder/util/finish-submit';
import SwitchingTextField from '../../../ui-kit/form-builder/fields/switching-text-field';
import { PhotoCamera } from '@mui/icons-material';
import FileField from '../../../ui-kit/form-builder/fields/file-field';
import Avatar from '@mui/material/Avatar';
import { CenterBox } from '../../../ui-kit/layout';
import { UNITS } from '../../../util/misc';
import { DateTime } from 'luxon';
import { useAlert } from '../../../util/hooks';


function makeInitialValues(data) {
  return {
    ...pick(data, [fieldNames.username, fieldNames.avatar]),
    [fieldNames.newPassword]: '',
    [fieldNames.isChangingPassword]: false
  };
}

function Content() {
  const dispatch = useDispatch();
  const open = useProfileModalOpen();
  const { isSubmitting, resetAndExit } = useEditableView();
  const { email, username, createdAt } = useUserData();

  function onClose() {
    if (isSubmitting) {
      return;
    }
    resetAndExit();
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
      <Form>
        <DialogContent sx={{ display: 'flex', columnGap: 3 }}>
          <Box>
            <FileField
              name={fieldNames.avatar}
              HintIcon={PhotoCamera}
              extraProps={{ sx: { borderRadius: '50%', height: 100, width: 100 } }}
              PreviewComponent={props =>
                <CenterBox>
                  <Avatar {...props} sx={{ height: '100%', width: '100%', fontSize: '3em' }}>
                    {username[0]}
                  </Avatar>
                </CenterBox>
              }
              isImage
            />
          </Box>
          <Box pt={2}>
            <Typography display='block' variant='caption' color='text.secondary'>{email}</Typography>
            <Typography display='block' variant='caption' color='text.secondary' mb={0.5}>
              Since {DateTime.fromISO(createdAt).toFormat('DD')}
            </Typography>
            <SwitchingTextField
              required
              name={fieldNames.username}
              typographyProps={{ variant: 'subtitle1' }}
            />
            <PasswordChange />
          </Box>
          <GeneralError />
        </DialogContent>
        <FormActions onClose={onClose} />
      </Form>
    </Dialog>
  )
}

function ProfileModal() {
  const dispatch = useDispatch();
  const userData = useUserData();
  const showAlert = useAlert();
  const initialValues = makeInitialValues(userData);

  return (
    <SmartForm
      onSubmit={(values, formikHelpers) => {
        const changed = pickBy(values, (fieldVal, fieldName) =>
          fieldName !== fieldNames.isChangingPassword && initialValues[fieldName] !== fieldVal
        );
        if (isEmpty(changed)) {
          formikHelpers.setStatus({ [SWITCHER]: false });
          return;
        }

        finishSubmit(
          ws.request(ACTIONS.editUser, changed).then(({ payload }) => {
            if (payload.passwordChangeRequested) {
              showAlert('Follow the link in the email to confirm password change');
            }
            dispatch(updateUserData(payload));
            formikHelpers.resetForm({
              values: makeInitialValues(payload),
              status: { [SWITCHER]: false }
            });
          }), formikHelpers
        );
      }}
      initialValues={initialValues}
      switching
      validationConfig={{
        [fieldNames.username]: [FIELD_TYPES.text, 50, true],
        [fieldNames.newPassword]: [FIELD_TYPES.text, 100, fieldNames.isChangingPassword],
        [fieldNames.avatar]: [FIELD_TYPES.file, [4, UNITS.MB, true]]
      }}
      doNotPopulate
    >
      <Content />
    </SmartForm>
  );
}

export default ProfileModal;