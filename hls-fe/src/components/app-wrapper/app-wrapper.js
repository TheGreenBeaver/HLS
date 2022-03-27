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
    <Container component='main' maxWidth={isReady ? 'lg' : 'xs'} sx={{ minHeight: '100vh' }}>
      {
        isReady && <>
          <Header />
          <Modals />
        </>
      }
      <Box
        id='the-main-box'
        sx={isReady ? theme => {
          const { toolbar } = theme.mixins;
          const extraSpacing = parseInt(theme.spacing(2));
          return Object.entries(toolbar).reduce((result, [propName, propVal]) => {
            if (typeof propVal === 'number') {
              return { ...result, paddingTop: `${propVal + extraSpacing}px` };
            }
            const adjustedPropName = propName.includes('min-width:0px')
              ? `${propName} and (max-width:${theme.breakpoints.values.sm - 1}px)`
              : propName;
            return { ...result, [adjustedPropName]: { paddingTop: `${propVal.minHeight + extraSpacing}px` } };
          }, {});
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