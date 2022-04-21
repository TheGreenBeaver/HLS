import React from 'react';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import UserMenu from './user-menu';
import Alerts from './alerts';
import NewVideoMenu from './new-video-menu';
import StyledLink from '../../ui-kit/styled-link';
import { links } from '../../pages/routing';
import logo from '../../assets/logo-full.svg';
import { useUserState } from '../../store/selectors';
import Subscriptions from './subscriptions';


function Header() {
  const { isAuthorized, isVerified } = useUserState();
  return (
    <AppBar sx={{ bgcolor: 'background.paper' }}>
      <Toolbar sx={{ justifyContent: 'space-between', bgcolor: 'background.paper' }}>
        <StyledLink to={links.videos.list.path} sx={{ width: 120 }}>
          <img src={logo} alt='logo' />
        </StyledLink>
        <Box display='flex' alignItems='center' columnGap={1}>
          {isAuthorized && isVerified && <Subscriptions />}
          <NewVideoMenu />
          <Alerts />
          <UserMenu />
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;