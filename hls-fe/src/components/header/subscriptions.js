import React from 'react';
import { usePopover } from '../../util/hooks';
import { useWsRequest } from '../../ws/hooks';
import ACTIONS from '../../ws/actions';
import IconButton from '@mui/material/IconButton';
import { LiveTv } from '@mui/icons-material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Preloader from '../../ui-kit/preloader';
import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';
import { links } from '../../pages/routing';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';


function Subscriptions() {
  const { closeMenu, popoverProps, triggerProps } = usePopover();
  const { data, isFetching } = useWsRequest(ACTIONS.listChannels);

  function getContent() {
    if (isFetching) {
      return (
        <Box display='flex' justifyContent='center'>
          <Preloader size='2em' />
        </Box>
      );
    }

    if (data.length) {
      return data.map(u =>
        <MenuItem
          key={u.id}
          component={Link}
          to={links.channels.single.get(u.id)}
          onClick={closeMenu}
          sx={{ columnGap: 1 }}
        >
          <Avatar src={u.avatar}>
            {u.username[0]}
          </Avatar>
          {u.username}
        </MenuItem>
      );
    }

    return <Typography py={2} px={3} color='text.secondary'>You have no subscriptions</Typography>;
  }

  return (
    <>
      <IconButton {...triggerProps}>
        <LiveTv />
      </IconButton>

      <Menu
        sx={{ mt: 1 }}
        MenuListProps={{ sx: { width: 220, maxHeight: 250 } }}
        {...popoverProps}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
      >
        {getContent()}
      </Menu>
    </>
  );
}

export default Subscriptions;