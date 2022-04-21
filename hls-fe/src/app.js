import Routing from './pages/routing';
import { useWsCleanup } from './ws/hooks';
import ACTIONS from './ws/actions';
import { getCredentials } from './util/auth';
import { useErr, useUserState } from './store/selectors';
import { useDispatch } from 'react-redux';
import { logOut, updateUserData } from './store/actions/account';
import { useEffect } from 'react';
import ws from './ws';
import httpStatus from 'http-status';
import { setError } from './store/actions/general';
import Header from './components/header';
import Modals from './components/modals';
import Loading from './pages/utility/loading';
import ErrorPage from './pages/utility/error-page';


function App() {
  const dispatch = useDispatch();
  const userState = useUserState();
  const err = useErr();

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

  useWsCleanup();

  useEffect(() => {
    const fetchSelfData = async () => {
      try {
        const { payload } = await ws.request(ACTIONS.me, { token: getCredentials() });
        dispatch(updateUserData(payload));
      } catch (e) {
        dispatch(logOut());
      }
    };

    if (userState.isAuthorized) {
      fetchSelfData();
    }
  }, [userState.isAuthorized]);

  if (err) {
    return <ErrorPage status={err.status} />;
  }

  if (userState.isAuthorized && !userState.isFetched) {
    return <Loading fullPage />;
  }

  return (
    <>
      <Header />
      {userState.isFetched && <Modals />}
      <Routing />
    </>
  );
}

export default App;
