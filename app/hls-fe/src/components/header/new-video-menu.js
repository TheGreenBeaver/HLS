import React from 'react';
import { VideoCall } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import { usePopover } from '../../util/hooks';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Link } from 'react-router-dom';
import { links } from '../../pages/routing';


function NewVideoMenu() {
  const { triggerProps, popoverProps, closeMenu } = usePopover();

  return (
    <>
      <IconButton {...triggerProps}>
        <VideoCall />
      </IconButton>

      <Menu
        sx={{ mt: 1 }}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
        MenuListProps={{ sx: { minWidth: 150 } }}
        {...popoverProps}
      >
        <MenuItem
          component={Link}
          to={links.videos.upload.path}
          onClick={closeMenu}
        >
          Upload video
        </MenuItem>
        <MenuItem
          component={Link}
          to={links.videos.goLive.path}
          onClick={closeMenu}
        >
          Go live
        </MenuItem>
      </Menu>
    </>
  );
}

export default NewVideoMenu;