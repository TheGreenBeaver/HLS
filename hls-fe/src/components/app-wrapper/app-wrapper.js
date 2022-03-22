import React from 'react';
import { bool, node } from 'prop-types';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Modals from '../modals';
import Header from '../header';


function AppWrapper({ children, isInteractive }) {
  return (
    <Container component='main' maxWidth={isInteractive ? 'lg' : 'xs'}>
      {
        isInteractive && <>
          <Header />
          <Modals />
        </>
      }
      <Box
        sx={isInteractive ? {
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
  children: node,
  isInteractive: bool.isRequired
};

export default AppWrapper;