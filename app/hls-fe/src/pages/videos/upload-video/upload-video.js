import React from 'react';
import ACTIONS from '../../../ws/actions';
import ws from '../../../ws';
import SmartForm from '../../../ui-kit/form-builder/smart-form';
import finishSubmit from '../../../ui-kit/form-builder/util/finish-submit';
import { FIELD_TYPES } from '../../../ui-kit/form-builder/util/validation';
import StandardTextField from '../../../ui-kit/form-builder/fields/standard-text-field';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { Photo, Upload } from '@mui/icons-material';
import FileField from '../../../ui-kit/form-builder/fields/file-field';
import CenterBox from '../../../ui-kit/layout/center-box';
import { UNITS } from '../../../util/misc';
import { useAlert } from '../../../util/hooks';
import { useHistory } from 'react-router-dom';
import { links } from '../routing';


const fieldNames = {
  thumbnail: 'thumbnail',
  file: 'file',
  name: 'name',
  description: 'description',
};

function UploadVideo() {
  const showAlert = useAlert();
  const history = useHistory();

  return (
    <>
      <Typography variant='h4'>Upload video</Typography>
      <SmartForm
        initialValues={{
          [fieldNames.name]: '',
          [fieldNames.file]: null,
          [fieldNames.description]: '',
          [fieldNames.thumbnail]: null
        }}
        onSubmit={(values, formikHelpers) => finishSubmit(
          ws.request(ACTIONS.uploadVideo, values).then(({ payload }) => {
            showAlert('Started processing your video');
            history.push(links.single.get(payload.id));
          }), formikHelpers
        )}
        validationConfig={{
          [fieldNames.name]: [FIELD_TYPES.text, 50, true],
          [fieldNames.file]: [FIELD_TYPES.file, [1, UNITS.GB], true],
          [fieldNames.description]: [FIELD_TYPES.text, 1000],
          [fieldNames.thumbnail]: [FIELD_TYPES.file, [4, UNITS.MB, true]]
        }}
        submitText='Upload'
      >
        <Grid container columnSpacing={3} rowSpacing={1}>
          <Grid item xs={12}>
            <StandardTextField name={fieldNames.name} autoComplete='false' required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FileField
              label='Video file'
              name={fieldNames.file}
              keepRatio
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FileField
              label='Thumbnail'
              name={fieldNames.thumbnail}
              HintIcon={Photo}
              isImage
              keepRatio
              emptyContent={
                <CenterBox flexDirection='column' p={3}>
                  <Upload sx={{ fontSize: '3em' }} />
                  <Typography
                    sx={{ color: theme => theme.palette.grey[400] }}
                    textAlign='center'
                  >
                    If no thumbnail is provided, the first frame of the video will be used as one
                  </Typography>
                </CenterBox>
              }
            />
          </Grid>
          <Grid item xs={12}>
            <StandardTextField
              name={fieldNames.description}
              autoComplete='false'
              multiline
              rows={5}
            />
          </Grid>
        </Grid>
      </SmartForm>
    </>
  );
}

export default UploadVideo;