import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ACTIONS from '../../../ws/actions';
import { useDispatch } from 'react-redux';
import { updateUserData } from '../../../store/actions/account';
import Typography from '@mui/material/Typography';
import { NON_FIELD_ERR } from '../../../util/constants';
import { camelCase } from 'lodash';
import confirmableActions from './confirmable-actions';
import { useReturnToApp } from '../../access-control';
import ws from '../../../ws';
import Box from '@mui/material/Box';
import { CenterBox } from '../../../ui-kit/layout';
import Preloader from '../../../ui-kit/preloader';
import { useAlert } from '../../../util/hooks';


const SITUATION = {
  stale: 'stale',
  processing: 'processing',
  success: 'success',
};
const TEXT = {
  [confirmableActions.verify]: {
    [SITUATION.processing]: 'Verifying your account...',
    [SITUATION.success]: 'Your account is now verified!',
    [SITUATION.stale]: 'Account verification'
  },
  [confirmableActions.changePassword]: {
    [SITUATION.processing]: 'Finishing the password change...',
    [SITUATION.success]: 'Successfully set a new password for your account!',
    [SITUATION.stale]: 'Password change confirmation'
  },
  [confirmableActions.resetPassword]: {
    [SITUATION.processing]: 'Finishing the password reset...',
    [SITUATION.success]: 'Your password has been successfully reset',
    [SITUATION.stale]: 'Password reset confirmation'
  }
};

function Confirm() {
  const { uid, token, confirmedAction: _a } = useParams();
  const confirmedAction = camelCase(_a);
  const textBlock = TEXT[confirmedAction];

  const condition = !!(uid && token && confirmedAction);
  const [isProcessing, setIsProcessing] = useState(condition);
  const [err, setErr] = useState(null);

  const dispatch = useDispatch();
  const showAlert = useAlert();
  const returnToApp = useReturnToApp();

  useEffect(() => {
    const attemptConfirmation = async () => {
      setIsProcessing(true);
      setErr(null);
      try {
        const { payload } = await ws.request(ACTIONS.confirm, { uid, token, confirmedAction });
        dispatch(updateUserData(payload));
        const message = textBlock[SITUATION.success];
        showAlert(message, 'success');
        returnToApp();
      } catch (e) {
        setErr(e);
        setIsProcessing(false);
      }
    };

    if (condition) {
      attemptConfirmation();
    }
  }, [uid, token, confirmedAction]);

  function getContent() {
    if (err) {
      return <Typography>Error: {err.payload[NON_FIELD_ERR].join('')}</Typography>
    }

    if (isProcessing) {
      return (
        <Box textAlign='center' display='flex' alignItems='center' flexDirection='column'>
          <Preloader size={80} />
          <Typography mt={2}>{textBlock[SITUATION.processing]}</Typography>
        </Box>
      )
    }

    return (
      <Typography>{textBlock[SITUATION.stale]}</Typography>
    );
  }

  return <CenterBox>{getContent()}</CenterBox>
}

export default Confirm;