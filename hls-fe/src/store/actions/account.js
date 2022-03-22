import { account } from './action-types';


const signIn = token => ({
  type: account.SIGN_IN,
  token
});

const logOut = () => ({
  type: account.LOG_OUT
});

const updateUserData = userData => ({
  type: account.UPDATE_USER_DATA,
  userData
});
export {
  signIn,
  logOut,
  updateUserData,
};