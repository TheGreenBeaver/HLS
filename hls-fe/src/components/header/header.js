import React from 'react';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import UserMenu from './user-menu';
import Alerts from './alerts';
import NewVideoMenu from './new-video-menu';
import StyledLink from '../styled-link';
import { links } from '../../pages/routing';


function Header() {
  return (
    <AppBar>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <StyledLink
          to={links.videos.list.path}
          sx={{ color: 'primary.contrastText' }}
        >
          LOGO
        </StyledLink>
        <Box display='flex' alignItems='center' columnGap={1}>
          <NewVideoMenu />
          <Alerts />
          <UserMenu />
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;