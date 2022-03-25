import { useSelector } from 'react-redux';

function useUserState() {
  const { userData, isAuthorized } = useSelector(state => state.account);
  return {
    isAuthorized,
    isFetched: !!userData,
    isVerified: !!userData?.isVerified,
  };
}

function useIsReady() {
  const { userData, isAuthorized } = useSelector(state => state.account);
  return isAuthorized && !!userData;
}

function useIsAuthorized() {
  return useSelector(state => state.account.isAuthorized);
}

function useUserData() {
  return useSelector(state => state.account.userData);
}

function useErr() {
  return useSelector(state => state.general.err);
}

function useProfileModalOpen() {
  return useSelector(state => state.general.profileModalOpen);
}

export {
  useUserState, useErr, useUserData, useProfileModalOpen, useIsAuthorized, useIsReady
};