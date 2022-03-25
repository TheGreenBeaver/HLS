import React from 'react';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import ws from '../../ws';
import ACTIONS from '../../ws/actions';
import { logOut } from '../../store/actions/account';
import { openProfileModal } from '../../store/actions/general';
import { useDispatch } from 'react-redux';
import { useUserData } from '../../store/selectors';
import { usePopover } from '../../util/hooks';


function UserMenu() {
  const dispatch = useDispatch();
  const { avatar, username, isVerified } = useUserData();
  const { closeMenu, popoverProps, triggerProps } = usePopover();

  function onLogOutClick() {
    closeMenu();
    ws
      .request(ACTIONS.logOut)
      .then(() => dispatch(logOut()))
  }

  function onEditProfileClick() {
    dispatch(openProfileModal());
    closeMenu();
  }

  return (
    <>
      <Avatar
        src={avatar}
        sx={{ cursor: 'pointer' }}
        {...triggerProps}
      >
        {username[0]}
      </Avatar>

      <Menu
        sx={{ mt: 1 }}
        MenuListProps={{
          sx: { minWidth: 150 }
        }}
        {...popoverProps}
      >
        <MenuItem>
          {username}
        </MenuItem>
        <Divider />
        {
          isVerified &&
          <MenuItem onClick={onEditProfileClick}>
            Edit profile
          </MenuItem>
        }
        <MenuItem onClick={onLogOutClick}>
          Log out
        </MenuItem>
      </Menu>
    </>
  );
}

export default UserMenu;