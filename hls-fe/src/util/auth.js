const TOKEN = 'token';

function getCredentials() {
  return localStorage.getItem(TOKEN);
}

function saveCredentials(token) {
  localStorage.setItem(TOKEN, token);
}

function clearCredentials() {
  localStorage.removeItem(TOKEN);
}

function getIsAuthorized() {
  return !!getCredentials();
}

export { getCredentials, saveCredentials, clearCredentials, getIsAuthorized };