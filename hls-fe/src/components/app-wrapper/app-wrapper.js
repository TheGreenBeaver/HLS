import React from 'react';
import { node } from 'prop-types';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Modals from '../modals';
import Header from '../header';
import { useIsReady } from '../../store/selectors';


function AppWrapper({ children }) {
  const isReady = useIsReady();
  return (
    <Container component='main' maxWidth={isReady ? 'lg' : 'xs'}>
      {
        isReady && <>
          <Header />
          <Modals />
        </>
      }
      <Box
        sx={isReady ? {
          mt: 2
        } : {
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {children}
      </Box>
    </Container>
  );
}

AppWrapper.propTypes = {
  children: node
};

export default AppWrapper;