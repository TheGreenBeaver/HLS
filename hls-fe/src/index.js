import React from 'react';
import ReactDOM from 'react-dom';

import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import './theme/reset.css';
import theme from './theme';
import { ThemeProvider } from '@mui/material';

import { Provider as ReduxProvider } from 'react-redux';
import store from './store';

import { BrowserRouter as Router } from 'react-router-dom';

import { SnackbarProvider } from 'notistack';

import App from './App';


ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <ScopedCssBaseline>
        <ReduxProvider store={store}>
          <SnackbarProvider>
            <Router>
              <App />
            </Router>
          </SnackbarProvider>
        </ReduxProvider>
      </ScopedCssBaseline>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);