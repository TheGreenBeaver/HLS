import { general, account } from '../actions/action-types';

const initialState = {
  err: null,
  profileModalOpen: false
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case general.SET_ERROR:
      return { ...state, err: action.err };
    case general.SET_PROFILE_MODAL_STATE:
      return { ...state, profileModalOpen: action.open };
    case account.LOG_OUT:
      return initialState;
    default:
      return state;
  }
}

export default reducer;