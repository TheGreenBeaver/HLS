import { Redirect, useHistory } from 'react-router-dom';
import { links } from './routing';
import { useUserState } from '../store/selectors';
import PageContainer from './page-container';
import MaintenancePage from './utility/maintenance-page';


function getDefaultRoute({ isAuthorized, isVerified }) {
  if (!isAuthorized) {
    return links.auth.signIn.path;
  }

  if (!isVerified) {
    return links.auth.notVerified.path;
  }

  return links.videos.list.path;
}

const STORAGE_FIELD = 'prevPage'

function useReturnToApp() {
  const history = useHistory();
  const { location: { state } } = history;

  function returnToApp() {
    const to = state?.[STORAGE_FIELD] || links.videos.list.path;
    history.replace(to);
  }

  return returnToApp;
}

function withAccessControl(Component, narrow, fits, maintenance) {
  return props => {
    const userState = useUserState();
    const history = useHistory();
    const { location: { pathname, state } } = history;

    if (!fits(userState)) {
      const savedPath = state?.[STORAGE_FIELD];
      const to = {
        pathname: savedPath || getDefaultRoute(userState),
        state: savedPath ? undefined : { [STORAGE_FIELD]: pathname }
      };
      return <Redirect to={to} />;
    }

    return (
      <PageContainer narrow={narrow}>
        {maintenance ? <MaintenancePage /> : <Component {...props} />}
      </PageContainer>
    );
  };
}

export { useReturnToApp, withAccessControl };