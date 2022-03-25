import Routing from './pages/routing';
import { useWsAction, useWsCleanup, useWsRequest } from './ws/hooks';
import ACTIONS from './ws/actions';
import { getCredentials } from './util/auth';
import { useErr, useIsAuthorized } from './store/selectors';
import { useDispatch } from 'react-redux';
import { logOut, updateUserData } from './store/actions/account';
import { useEffect } from 'react';
import ws from './ws';
import httpStatus from 'http-status';
import { setError } from './store/actions/general';
import AppWrapper from './components/app-wrapper';
import { useSnackbar } from 'notistack';


function App() {
  const dispatch = useDispatch();
  const isAuthorized = useIsAuthorized();
  const err = useErr();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    ws.interceptor = (payload, status) => {
      if (
        (httpStatus[`${status}_CLASS`] === httpStatus.classes.SERVER_ERROR && !payload) ||
        status === httpStatus.NOT_FOUND
      ) {
        dispatch(setError({ payload, status }));
        return true;
      }
      if (status === httpStatus.UNAUTHORIZED) {
        dispatch(logOut());
        return true;
      }

      return false;
    };
  }, []);

  useWsAction(
    ACTIONS.videoProcessedAck,
    payload => {
      enqueueSnackbar(`${payload.name} was successfully processed`, { variant: 'success' });
    }
  );

  useWsCleanup();

  useWsRequest(
    ACTIONS.me,
    { token: getCredentials() },
    isAuthorized,
    [isAuthorized],
    payload => dispatch(updateUserData(payload)),
    () => dispatch(logOut())
  );

  if (err) {
    return `ERROR: ${err.status}`;
  }

  return (
    <AppWrapper>
      <Routing />
    </AppWrapper>
  );
}

export default App;
