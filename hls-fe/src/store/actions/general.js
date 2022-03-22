import { general } from './action-types';


const setError = err => ({
  type: general.SET_ERROR,
  err
});

const setProfileModalState = open => ({
  type: general.SET_PROFILE_MODAL_STATE,
  open
});

const openProfileModal = () => setProfileModalState(true);

const closeProfileModal = () => setProfileModalState(false);

const clearError = () => setError(null);

export {
  setError, clearError,
  setProfileModalState, openProfileModal, closeProfileModal
};