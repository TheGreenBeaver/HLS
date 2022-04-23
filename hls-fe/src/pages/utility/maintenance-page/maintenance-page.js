import React from 'react';
import { CenterBox } from '../../../ui-kit/layout';
import { ReactComponent as Maintenance } from '../../../assets/maintenance.svg';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import './maintenance-page.styles.scss';


function MaintenancePage() {
  return (
    <CenterBox flex={1} flexDirection='column' rowGap={2}>
      <Typography variant='h4'>Page under maintenance</Typography>
      <Box width='50%' height='50%'>
        <Maintenance />
      </Box>
    </CenterBox>
  );
}

export default MaintenancePage;