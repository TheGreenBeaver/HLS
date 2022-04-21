import React from 'react';
import { node, bool } from 'prop-types';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';


function PageContainer({ children, narrow }) {
  return (
    <Container component='main' maxWidth={narrow ? 'xs' : 'lg'} sx={{ minHeight: '100vh' }}>
      <Box
        sx={theme => {
          const { toolbar } = theme.mixins;
          const extraSpacing = parseInt(theme.spacing(narrow ? 8 : 2));
          return Object.entries(toolbar).reduce((result, [propName, propVal]) => {
            if (typeof propVal === 'number') {
              return { ...result, paddingTop: `${propVal + extraSpacing}px` };
            }
            const adjustedPropName = propName.includes('min-width:0px')
              ? `${propName} and (max-width:${theme.breakpoints.values.sm - 1}px)`
              : propName;
            return { ...result, [adjustedPropName]: { paddingTop: `${propVal.minHeight + extraSpacing}px` } };
          }, {});
        }}
        pb={8}
        display='flex'
        alignItems={narrow ? 'center' : 'stretch'}
        flexDirection='column'
        minHeight='100vh'
      >
        {children}
      </Box>
    </Container>
  );
}

PageContainer.propTypes = {
  children: node.isRequired,
  narrow: bool,
};

PageContainer.defaultProps = {
  narrow: false,
  stretch: false
};

export default PageContainer;