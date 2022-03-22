/* eslint-disable default-case */
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useWsRequest } from '../../../ws/hooks';
import ACTIONS from '../../../ws/actions';
import { useDispatch } from 'react-redux';
import { updateUserData } from '../../../store/actions/account';
import Typography from '@mui/material/Typography';
import { NON_FIELD_ERR } from '../../../util/constants';
import { camelCase } from 'lodash';
import confirmableActions from './confirmable-actions';
import { useSnackbar } from 'notistack';
import { useUserState } from '../../../store/selectors';
import { getDefaultRoute } from '../../routing';


function Confirm() {
  const dispatch = useDispatch();
  const { uid, token, confirmedAction: _a } = useParams();
  const confirmedAction = camelCase(_a);
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();
  const userState = useUserState();

  const { isFetching, err } = useWsRequest(
    ACTIONS.confirm,
    { uid, token, confirmedAction },
    !!(uid && token && confirmedAction),
    [uid, token, confirmedAction],
    payload => {
      dispatch(updateUserData(payload));
      let message;
      switch (confirmedAction) {
        case confirmableActions.verify:
          message = 'Your account is now verified!';
          break;
        case confirmableActions.resetPassword:
          message = 'Your password has been successfully reset';
          break;
        case confirmableActions.changePassword:
          message = 'Your password has been changed';
      }
      history.push(getDefaultRoute(userState));
      enqueueSnackbar(message, { variant: 'success' });
    },
  );

  if (err) {
    return <Typography>Error {err.status}: {err.payload[NON_FIELD_ERR].join('')}</Typography>
  }

  if (isFetching) {
    return <Typography>Confirmation in progress...</Typography>
  }

  return (
    <Typography>Confirmation</Typography>
  );
}

export default Confirm;