import React, { useRef, useState } from 'react';
import VideoRecorder from '../../../ui-kit/video/recorder';
import SmartForm from '../../../ui-kit/form-builder/smart-form';
import FileField from '../../../ui-kit/form-builder/fields/file-field';
import ws from '../../../ws';
import ACTIONS from '../../../ws/actions';
import { FIELD_TYPES } from '../../../ui-kit/form-builder/util/validation';
import { Photo, Upload } from '@mui/icons-material';
import StandardTextField from '../../../ui-kit/form-builder/fields/standard-text-field';
import { mapValues, now } from 'lodash';
import { UNITS } from '../../../util/misc';
import { useHistory, useLocation } from 'react-router-dom';
import { links } from '../routing';
import PlanPicker from './plan-picker';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { number, shape, func } from 'prop-types';
import CenterBox from '../../../ui-kit/layout/center-box';
import { PLANNED_STREAM_KEY } from '../../../util/constants';
import { Form } from 'formik';
import fieldNames from './field-names';
import GoButton from './go-button';
import { useAlert } from '../../../util/hooks';


function PreLive({ startedAtRef, setIsLive, setLiveStreamId }) {
  const history = useHistory();

  return (
    <>
      <Typography variant='h4'>Go live</Typography>
      <SmartForm
        onSubmit={(values, formikHelpers) => {
          startedAtRef.current = now();
          const toSend = { ...values };
          if (toSend[fieldNames.plan] == null) {
            delete toSend[fieldNames.plan];
          }
          formikHelpers.setSubmitting(true);
          ws
            .request(ACTIONS.startStream, toSend)
            .then(({ payload }) => {
              if (payload.plan) {
                history.push(links.single.get(payload.id));
              } else {
                setIsLive(true);
                setLiveStreamId(payload.id);
              }
            })
            .catch(e => {
              const errorsObj = mapValues(e.payload, v => v.join('; '));
              formikHelpers.setErrors(errorsObj);
              formikHelpers.setSubmitting(false);
            });
        }}
        initialValues={{
          [fieldNames.thumbnail]: null,
          [fieldNames.name]: '',
          [fieldNames.description]: '',
          [fieldNames.plan]: null
        }}
        validationConfig={{
          [fieldNames.name]: [FIELD_TYPES.text, 50, true],
          [fieldNames.thumbnail]: [FIELD_TYPES.file, [4, UNITS.MB, true], true],
          [fieldNames.description]: [FIELD_TYPES.text, 1000],
          [fieldNames.plan]: [FIELD_TYPES.futureDate]
        }}
        doNotPopulate
      >
        <Form>
          <Grid container columnSpacing={3} rowSpacing={1}>
            <Grid item xs={12}>
              <StandardTextField name={fieldNames.name} autoComplete='false' />
            </Grid>

            <Grid item xs={12} sm={8}>
              <FileField
                label='Thumbnail'
                name={fieldNames.thumbnail}
                isImage
                keepRatio
                HintIcon={Photo}
                emptyContent={
                  <CenterBox flexDirection='column' p={3}>
                    <Upload sx={{ fontSize: '3em' }} />
                    <Typography
                      sx={{ color: theme => theme.palette.grey[400] }}
                      textAlign='center'
                    >
                      Thumbnail is required for live streams
                    </Typography>
                  </CenterBox>
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <PlanPicker />
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
          <GoButton />
        </Form>
      </SmartForm>
    </>
  );
}

PreLive.propTypes = {
  startedAtRef: shape({ current: number.isRequired }).isRequired,
  setIsLive: func.isRequired,
  setLiveStreamId: func.isRequired
};

function Live({ liveStreamId, startedAtRef }) {
  const showAlert = useAlert();
  const history = useHistory();
  return (
    <VideoRecorder
      onFinish={() => {
        ws.request(ACTIONS.endStream, {
          streamedDuration: now() - startedAtRef.current
        }).then(() => {
          showAlert('You are not live anymore; finishing processing your stream');
          history.push(links.single.get(liveStreamId));
        });
      }}
    />
  );
}

Live.propTypes = {
  liveStreamId: number.isRequired,
  startedAtRef: shape({ current: number.isRequired }).isRequired
};

function GoLive() {
  const { state } = useLocation();
  const plannedStreamId = state?.[PLANNED_STREAM_KEY];
  const [isLive, setIsLive] = useState(!!plannedStreamId);
  const [liveStreamId, setLiveStreamId] = useState(plannedStreamId);
  const startedAtRef = useRef(0);

  return (
    isLive
      ? <Live liveStreamId={liveStreamId} startedAtRef={startedAtRef} />
      : <PreLive setLiveStreamId={setLiveStreamId} startedAtRef={startedAtRef} setIsLive={setIsLive} />
  );
}

export default GoLive;